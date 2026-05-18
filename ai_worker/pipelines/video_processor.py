"""
ATCC AI Worker — Production Video Processing Pipeline

Orchestrates the full detection → tracking → counting → reporting
pipeline. Optimized for high throughput with frame skipping
and performance metrics.
"""

from __future__ import annotations

import json
import logging
import time
import uuid
import threading
import queue
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path

import cv2

from core.config import settings
from trackers.bytetrack import VehicleTracker
from counting.line_counter import LineCrossingCounter
from reports.generator import ReportGenerator
from visualization.annotator import annotate_frame
from visualization.debug_writer import DebugVideoWriter

logger = logging.getLogger(__name__)


class JobStatus(str, Enum):
    QUEUED = "Queued"
    INITIALIZING = "Initializing"
    ANALYZING_FRAMES = "Analyzing Frames"
    TRACKING_VEHICLES = "Tracking Vehicles"
    GENERATING_REPORT = "Generating Report"
    COMPLETED = "Completed"
    FAILED = "Failed"


class JobState:
    """Mutable state container for a processing job."""

    def __init__(self, job_id: str, video_path: str) -> None:
        self.job_id = job_id
        self.video_path = video_path
        self.status: JobStatus = JobStatus.QUEUED
        self.progress: int = 0
        self.logs: list[str] = []
        self.error: str | None = None
        self.started_at: datetime | None = None
        self.completed_at: datetime | None = None
        self.report_path: str | None = None
        self.pdf_path: str | None = None
        self.xlsx_path: str | None = None
        self.debug_video_path: str | None = None
        self.thumbnail_path: str | None = None
        self.worker_node: str = "NODE-01"

    def log(self, message: str) -> None:
        ts = datetime.now().strftime("%H:%M:%S")
        entry = f"[{ts}] {message}"
        self.logs.append(entry)
        logger.info("Job %s — %s", self.job_id, message)
        registry.save()

    def to_dict(self) -> dict:
        return {
            "job_id": self.job_id,
            "video_path": self.video_path,
            "status": self.status.value,
            "progress": self.progress,
            "logs": self.logs[-100:],
            "error": self.error,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "report_path": self.report_path,
            "pdf_path": self.pdf_path,
            "xlsx_path": self.xlsx_path,
            "debug_video_path": self.debug_video_path,
            "thumbnail_path": self.thumbnail_path,
            "worker_node": self.worker_node,
        }

    @classmethod
    def from_dict(cls, data: dict) -> JobState:
        state = cls(data["job_id"], data["video_path"])
        state.status = JobStatus(data["status"])
        state.progress = data["progress"]
        state.logs = data.get("logs", [])
        state.error = data["error"]
        state.started_at = datetime.fromisoformat(data["started_at"]) if data.get("started_at") else None
        state.completed_at = datetime.fromisoformat(data["completed_at"]) if data.get("completed_at") else None
        state.report_path = data.get("report_path")
        state.pdf_path = data.get("pdf_path")
        state.xlsx_path = data.get("xlsx_path")
        state.debug_video_path = data.get("debug_video_path")
        state.thumbnail_path = data.get("thumbnail_path")
        state.worker_node = data.get("worker_node", "NODE-01")
        return state


class PersistentJobRegistry:
    """Handles in-memory job storage with disk-based JSON persistence."""

    def __init__(self, storage_path: Path) -> None:
        self.path = storage_path
        self._jobs: dict[str, JobState] = {}
        self.load()

    def add(self, state: JobState) -> None:
        self._jobs[state.job_id] = state
        self.save()

    def get(self, job_id: str) -> JobState | None:
        return self._jobs.get(job_id)

    def list_all(self) -> list[dict]:
        return [j.to_dict() for j in sorted(self._jobs.values(), key=lambda x: x.started_at or datetime.min, reverse=True)]

    def save(self) -> None:
        try:
            data = {jid: j.to_dict() for jid, j in self._jobs.items()}
            with open(self.path, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error("Failed to save job registry: %s", e)

    def load(self) -> None:
        if not self.path.exists():
            return
        try:
            with open(self.path, "r") as f:
                data = json.load(f)
                self._jobs = {jid: JobState.from_dict(d) for jid, d in data.items()}
        except Exception as e:
            logger.error("Failed to load job registry: %s", e)


registry = PersistentJobRegistry(settings.REPORTS_DIR / "registry.json")


def get_job(job_id: str) -> JobState | None:
    return registry.get(job_id)


def list_jobs() -> list[dict]:
    return registry.list_all()


def process_video(video_path: str, job_id: str | None = None) -> str:
    """
    Production-optimized video processing pipeline.
    """
    jid = job_id or str(uuid.uuid4())
    state = JobState(jid, video_path)
    state.started_at = datetime.now()
    registry.add(state)

    state.status = JobStatus.INITIALIZING
    state.log(f"INIT  — Production Mode | Model: {settings.MODEL_WEIGHTS} | imgsz: {settings.IMAGE_SIZE}")
    state.log(f"PERF  — Frame Skipping: Process every {settings.PROCESS_EVERY_N_FRAMES}th frame")

    debug_writer: DebugVideoWriter | None = None

    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise RuntimeError(f"Cannot open video: {video_path}")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        state.log(f"INFO  — Source: {width}x{height} @ {fps:.1f}fps")

        tracker = VehicleTracker()
        counter = LineCrossingCounter(frame_height=height)

        if settings.DEBUG_MODE:
            debug_path = settings.DEBUG_OUTPUT_DIR / f"debug_{jid}.mp4"
            debug_writer = DebugVideoWriter(
                output_path=debug_path,
                width=width,
                height=height,
                fps=fps / settings.PROCESS_EVERY_N_FRAMES,
                total_frames=total_frames // settings.PROCESS_EVERY_N_FRAMES,
            )
            state.debug_video_path = str(debug_path)
            state.thumbnail_path = str(debug_path.with_suffix(".thumb.jpg"))
            state.log("DEBUG — Rendering active (Performance impact expected)")
        else:
            state.log("PERF  — Debug rendering disabled (Max throughput)")

        state.progress = 5
        registry.save()

        # ── 3. Optimized Frame Loop (Multithreaded I/O) ──────────────────────────────
        state.status = JobStatus.ANALYZING_FRAMES
        
        frame_idx = 0
        processed_count = 0
        start_time = time.time()

        frame_queue = queue.Queue(maxsize=32)
        read_complete = threading.Event()

        def frame_reader_thread():
            f_idx = 0
            while not read_complete.is_set():
                ret, frm = cap.read()
                if not ret:
                    break
                f_idx += 1
                # Pre-filter frames directly in the reader thread to save queue RAM
                if f_idx % settings.PROCESS_EVERY_N_FRAMES == 0:
                    frame_queue.put((f_idx, frm))
            read_complete.set()

        reader = threading.Thread(target=frame_reader_thread, daemon=True)
        reader.start()

        while not read_complete.is_set() or not frame_queue.empty():
            try:
                frame_idx, frame = frame_queue.get(timeout=0.5)
            except queue.Empty:
                continue

            # Rule: Only process every Nth frame (already pre-filtered in reader)
            processed_count += 1
            
            video_seconds = frame_idx / fps
            video_time = datetime(2026, 1, 1) + timedelta(seconds=video_seconds)
            hour_key = video_time.strftime("%H:00")
            timestamp = video_time.strftime("%H:%M:%S")

            # Core AI Operations
            tracked = tracker.update(frame)
            counter.update(tracked, current_hour=hour_key)

            # Conditional Debug Rendering
            if debug_writer is not None:
                annotated = annotate_frame(
                    frame=frame,
                    vehicles=tracked,
                    band_top=counter.band_top,
                    band_bottom=counter.band_bottom,
                    counted_ids=counter.counted_ids,
                    class_counts=dict(counter.class_counts),
                    frame_idx=frame_idx,
                    timestamp=timestamp,
                )
                debug_writer.write_frame(annotated, frame_idx)

            # Periodic Progress & Metrics
            if frame_idx % (int(fps) * 5) == 0:
                # Capture thumbnail at approx 50% if enabled
                if settings.ENABLE_THUMBNAIL and 0.48 < (frame_idx / total_frames) < 0.52 and not state.thumbnail_path:
                    thumb_dir = settings.REPORTS_DIR / jid
                    thumb_dir.mkdir(parents=True, exist_ok=True)
                    thumb_path = thumb_dir / "thumbnail.jpg"
                    cv2.imwrite(str(thumb_path), frame)
                    state.thumbnail_path = str(thumb_path)

                elapsed = time.time() - start_time
                inference_fps = processed_count / elapsed if elapsed > 0 else 0
                avg_frame_time = (elapsed / processed_count) * 1000 if processed_count > 0 else 0
                
                progress = min(int((frame_idx / total_frames) * 90) + 5, 95)
                state.progress = progress
                state.log(
                    f"PROC  — {progress}% | Count: {counter.total_count} | "
                    f"Speed: {inference_fps:.1f} inf/s | Latency: {avg_frame_time:.1f}ms"
                )
                registry.save()

        read_complete.set()
        cap.release()
        total_time = time.time() - start_time

        if debug_writer is not None:
            debug_writer.release()

        state.log(f"PERF  — Finalized {processed_count} inferences in {total_time:.1f}s")
        state.log(f"PERF  — Effective Processing Speed: {frame_idx / total_time:.1f} source_fps")

        # ── 4. Generate professional reports ─────────────────────
        state.status = JobStatus.GENERATING_REPORT
        state.progress = 95
        state.log("REPT  — Generating multi-format professional reports (PDF, XLSX, JSON)")
        
        report_gen = ReportGenerator(
            job_id=jid,
            video_path=video_path,
            counter_summary=counter.get_summary(),
            video_meta={
                "width": width, "height": height, "fps": fps,
                "total_frames": total_frames,
                "duration_seconds": total_frames / fps,
                "processed_frames": processed_count,
                "processing_time": total_time,
                "effective_fps": frame_idx / total_time
            },
        )
        report_gen.save()
        
        # Update paths for API access
        state.report_path = str(report_gen.json_path)
        state.pdf_path = str(report_gen.pdf_path)
        state.xlsx_path = str(report_gen.xlsx_path)

        state.status = JobStatus.COMPLETED
        state.progress = 100
        state.completed_at = datetime.now()
        state.log(f"DONE  — Vehicles: {counter.total_count} | Result saved.")
        registry.save()

    except Exception as exc:
        state.status = JobStatus.FAILED
        state.error = str(exc)
        state.log(f"ERROR — {exc}")
        registry.save()
        if debug_writer is not None:
            try: debug_writer.release()
            except: pass

    return jid
