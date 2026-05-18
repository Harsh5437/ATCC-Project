"""
ATCC AI Worker — ByteTrack Vehicle Tracker

Uses Ultralytics' built-in ByteTrack integration with custom
geometric filtering and rolling confidence averaging for
increased stability in dense traffic.
"""

from __future__ import annotations

import logging
from collections import defaultdict, deque
from dataclasses import dataclass, field

import numpy as np
from ultralytics import YOLO

from core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class TrackedVehicle:
    """Represents a single tracked vehicle across frames."""

    track_id: int
    bbox: np.ndarray        # [x1, y1, x2, y2]
    confidence: float       # Single-frame confidence
    avg_confidence: float   # Rolling average confidence
    track_age: int          # Total frames seen
    class_id: int
    class_name: str
    is_rejected: bool = False
    reject_reason: str | None = None
    center: tuple[float, float] = field(init=False)

    def __post_init__(self) -> None:
        x1, y1, x2, y2 = self.bbox
        self.center = ((x1 + x2) / 2, (y1 + y2) / 2)


class VehicleTracker:
    """
    Multi-object tracker powered by Ultralytics ByteTrack.
    """

    def __init__(self) -> None:
        logger.info("Initializing tracker with model: %s", settings.MODEL_WEIGHTS)
        self.model = YOLO(settings.MODEL_WEIGHTS)
        self.model.to(settings.DEVICE)

        self.vehicle_classes: list[int] = list(settings.COCO_TO_ATCC.keys())
        
        # State persistence for rolling statistics
        self._conf_history: dict[int, deque[float]] = defaultdict(
            lambda: deque(maxlen=settings.CONF_AVG_WINDOW)
        )
        self._track_age: dict[int, int] = defaultdict(int)

        logger.info("ByteTrack tracker initialized (imgsz=%d)", settings.IMAGE_SIZE)

    def update(self, frame: np.ndarray) -> list[TrackedVehicle]:
        """
        Run detection + tracking on a single frame.
        """
        results = self.model.track(
            frame,
            persist=True,
            tracker=settings.TRACKER_CONFIG,
            conf=settings.CONFIDENCE_THRESHOLD,
            iou=settings.IOU_THRESHOLD,
            imgsz=settings.IMAGE_SIZE,
            classes=self.vehicle_classes,
            verbose=False,
            half=settings.HALF_PRECISION,
        )

        tracked: list[TrackedVehicle] = []

        for result in results:
            boxes = result.boxes
            if boxes is None or boxes.id is None:
                continue

            for i in range(len(boxes)):
                track_id = int(boxes.id[i].item())
                cls_id = int(boxes.cls[i].item())
                conf = float(boxes.conf[i].item())
                xyxy = boxes.xyxy[i].cpu().numpy()

                atcc_class = settings.COCO_TO_ATCC.get(cls_id)
                if not atcc_class:
                    continue

                # ── Update history ───────────────────────────────
                self._conf_history[track_id].append(conf)
                self._track_age[track_id] += 1
                
                avg_conf = sum(self._conf_history[track_id]) / len(self._conf_history[track_id])
                age = self._track_age[track_id]

                # ── Geometric Filtering ───────────────────────────
                x1, y1, x2, y2 = xyxy
                width = x2 - x1
                height = y2 - y1
                area = width * height

                is_rejected = False
                reject_reason = None

                if atcc_class == "Bike":
                    if width < settings.MIN_BIKE_WIDTH:
                        is_rejected = True
                        reject_reason = f"Small Width ({width:.0f}px)"
                    elif area < settings.MIN_BIKE_AREA:
                        is_rejected = True
                        reject_reason = f"Small Area ({area:.0f}px^2)"

                tracked.append(
                    TrackedVehicle(
                        track_id=track_id,
                        bbox=xyxy,
                        confidence=conf,
                        avg_confidence=avg_conf,
                        track_age=age,
                        class_id=cls_id,
                        class_name=atcc_class,
                        is_rejected=is_rejected,
                        reject_reason=reject_reason,
                    )
                )

        # Cleanup stale history (optional, for long videos)
        # In production, we'd remove IDs that haven't been seen in N frames.
        
        return tracked
