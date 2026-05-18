"""
ATCC AI Worker — YOLOv8 Vehicle Detector

Wraps Ultralytics YOLOv8 for inference, returning structured
detection results filtered to vehicle classes only.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

import numpy as np
from ultralytics import YOLO

from core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class Detection:
    """A single detected vehicle bounding box."""

    bbox: np.ndarray    # [x1, y1, x2, y2]
    confidence: float
    class_id: int
    class_name: str     # ATCC class name


class VehicleDetector:
    """
    YOLOv8-based vehicle detector.

    Initializes the model once and exposes `detect()` and `detect_batch()`
    methods that return `Detection` objects for the given frames.
    """

    def __init__(self) -> None:
        logger.info("Loading YOLOv8 model: %s on device: %s", settings.MODEL_WEIGHTS, settings.DEVICE)
        self.model = YOLO(settings.MODEL_WEIGHTS)
        self.model.to(settings.DEVICE)
        
        # Get vehicle class IDs from config mapping
        self.vehicle_coco_ids: set[int] = set(settings.COCO_TO_ATCC.keys())
        
        logger.info("YOLOv8 model loaded. Filtering for COCO IDs: %s", self.vehicle_coco_ids)

    def _parse_results(self, results) -> list[list[Detection]]:
        batch_detections = []
        for result in results:
            detections: list[Detection] = []
            if result.boxes is not None:
                boxes = result.boxes
                for i in range(len(boxes)):
                    cls_id = int(boxes.cls[i].item())

                    # Filter: only keep configured vehicle classes
                    if cls_id not in self.vehicle_coco_ids:
                        continue

                    conf = float(boxes.conf[i].item())
                    xyxy = boxes.xyxy[i].cpu().numpy()

                    atcc_class = settings.COCO_TO_ATCC.get(cls_id)
                    if not atcc_class:
                        continue

                    detections.append(
                        Detection(
                            bbox=xyxy,
                            confidence=conf,
                            class_id=cls_id,
                            class_name=atcc_class,
                        )
                    )
            batch_detections.append(detections)
        return batch_detections

    def detect(self, frame: np.ndarray) -> list[Detection]:
        """
        Run inference on a single BGR frame.
        """
        results = self.model(
            frame,
            conf=settings.CONFIDENCE_THRESHOLD,
            iou=settings.IOU_THRESHOLD,
            imgsz=settings.IMAGE_SIZE,
            verbose=False,
            half=settings.HALF_PRECISION,
        )
        return self._parse_results(results)[0]

    def detect_batch(self, frames: list[np.ndarray]) -> list[list[Detection]]:
        """
        Run inference on a batch of BGR frames.
        """
        if not frames:
            return []
            
        results = self.model(
            frames,
            conf=settings.CONFIDENCE_THRESHOLD,
            iou=settings.IOU_THRESHOLD,
            imgsz=settings.IMAGE_SIZE,
            verbose=False,
            half=settings.HALF_PRECISION,
        )
        return self._parse_results(results)
