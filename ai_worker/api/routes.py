"""
ATCC AI Worker — API Routes

Exposes endpoints for video upload, job management, and report retrieval.
All heavy processing runs in a thread-pool executor to keep the
async event loop responsive.
"""

from __future__ import annotations

import logging
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import aiofiles
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse

from core.config import settings
from pipelines.video_processor import (
    JobStatus,
    get_job,
    list_jobs,
    process_video,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["processing"])

# Thread pool for CPU-bound video processing
_executor = ThreadPoolExecutor(max_workers=settings.MAX_CONCURRENT_JOBS)


# ── Upload & Process ─────────────────────────────────────────────
@router.post("/process")
async def upload_and_process(video: UploadFile = File(...)):
    """
    Accept a video file upload and start async processing.

    Returns immediately with a job_id that can be polled for status.
    """
    # Validate file type
    allowed = {"video/mp4", "video/quicktime", "video/x-msvideo"}
    if video.content_type not in allowed:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type: {video.content_type}. Allowed: MP4, MOV, AVI",
        )

    # Save to disk
    job_id = str(uuid.uuid4())
    ext = Path(video.filename or "video.mp4").suffix
    save_path = settings.UPLOAD_DIR / f"{job_id}{ext}"

    async with aiofiles.open(save_path, "wb") as out:
        while chunk := await video.read(1024 * 1024):  # 1MB chunks
            await out.write(chunk)

    logger.info("Video saved: %s (%s)", save_path, video.content_type)

    # Dispatch processing to background thread
    _executor.submit(process_video, str(save_path), job_id)

    return JSONResponse(
        status_code=202,
        content={
            "job_id": job_id,
            "status": JobStatus.QUEUED.value,
            "message": "Video accepted. Processing started.",
        },
    )


# ── Job Status ───────────────────────────────────────────────────
@router.get("/jobs")
async def get_all_jobs():
    """List all processing jobs."""
    return list_jobs()


@router.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Get the status and logs for a specific job."""
    state = get_job(job_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return state.to_dict()


# ── Report Download ──────────────────────────────────────────────
@router.get("/reports/{job_id}")
async def download_report(job_id: str):
    """Download the generated JSON report for a completed job."""
    state = get_job(job_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Job not found")

    if state.status != JobStatus.COMPLETED:
        raise HTTPException(
            status_code=409,
            detail=f"Job is not completed. Current status: {state.status.value}",
        )

    report_path = Path(state.report_path) if state.report_path else None
    if report_path is None or not report_path.exists():
        raise HTTPException(status_code=404, detail="Report file not found")

    return FileResponse(
        path=report_path,
        media_type="application/json",
        filename=f"atcc_report_{job_id}.json",
    )


@router.get("/reports/{job_id}/pdf")
async def download_report_pdf(job_id: str):
    """Download the professional PDF report for a completed job."""
    state = get_job(job_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Job not found")

    if state.status != JobStatus.COMPLETED:
        raise HTTPException(status_code=409, detail="Job not completed")

    pdf_path = Path(state.pdf_path) if state.pdf_path else None
    if pdf_path is None or not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDF report not found")

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"atcc_report_{job_id}.pdf",
    )


@router.get("/reports/{job_id}/xlsx")
async def download_report_xlsx(job_id: str):
    """Download the detailed Excel report for a completed job."""
    state = get_job(job_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Job not found")

    if state.status != JobStatus.COMPLETED:
        raise HTTPException(status_code=409, detail="Job not completed")

    xlsx_path = Path(state.xlsx_path) if state.xlsx_path else None
    if xlsx_path is None or not xlsx_path.exists():
        raise HTTPException(status_code=404, detail="Excel report not found")

    return FileResponse(
        path=xlsx_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=f"atcc_report_{job_id}.xlsx",
    )


# ── Debug Video Download ─────────────────────────────────────────
@router.get("/debug/video/{job_id}")
async def download_debug_video(job_id: str):
    """Download the annotated debug video for a completed job."""
    state = get_job(job_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Job not found")

    if not settings.DEBUG_MODE:
        raise HTTPException(status_code=404, detail="Debug mode is disabled")

    if state.status != JobStatus.COMPLETED:
        raise HTTPException(
            status_code=409,
            detail=f"Job is not completed. Current status: {state.status.value}",
        )

    video_path = Path(state.debug_video_path) if state.debug_video_path else None
    if video_path is None or not video_path.exists():
        raise HTTPException(status_code=404, detail="Debug video not found")

    return FileResponse(
        path=video_path,
        media_type="video/mp4",
        filename=f"atcc_debug_{job_id}.mp4",
    )


@router.get("/debug/thumbnail/{job_id}")
async def get_debug_thumbnail(job_id: str):
    """Get the thumbnail preview frame for a completed job."""
    state = get_job(job_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Job not found")

    thumb_path = Path(state.thumbnail_path) if state.thumbnail_path else None
    if thumb_path is None or not thumb_path.exists():
        raise HTTPException(status_code=404, detail="Thumbnail not found")

    return FileResponse(
        path=thumb_path,
        media_type="image/jpeg",
        filename=f"atcc_thumb_{job_id}.jpg",
    )


# ── Health ───────────────────────────────────────────────────────
@router.get("/health")
async def health_check():
    """Liveness probe."""
    return {
        "status": "healthy",
        "device": settings.DEVICE,
        "model": settings.MODEL_WEIGHTS,
        "max_concurrent": settings.MAX_CONCURRENT_JOBS,
        "debug_mode": settings.DEBUG_MODE,
    }
