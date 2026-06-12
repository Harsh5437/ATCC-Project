"""
ATCC AI Worker — Advanced Entry-Band Counter

Optimized for highway top-view cameras. Uses averaged confidence
from the tracker to make more stable counting decisions.
"""

from __future__ import annotations

import logging
from collections import defaultdict

from trackers.bytetrack import TrackedVehicle
from core.config import settings

logger = logging.getLogger(__name__)


class LineCrossingCounter:
    """
    Stable Entry-Band Counter for Highway Traffic.
    """

    def __init__(
        self,
        frame_height: int,
        band_top: float | None = None,
        band_bottom: float | None = None,
    ) -> None:
        top_ratio = band_top if band_top is not None else settings.ENTRY_BAND_TOP
        bottom_ratio = band_bottom if band_bottom is not None else settings.ENTRY_BAND_BOTTOM
        self.band_top: float = frame_height * top_ratio
        self.band_bottom: float = frame_height * bottom_ratio
        self.frame_height = frame_height

        self.counted_ids: set[int] = set()

        # Aggregated counts
        self.class_counts: dict[str, int] = defaultdict(int)
        self.hourly_counts: dict[str, dict[str, int]] = defaultdict(
            lambda: defaultdict(int)
        )

        self.total_count: int = 0
        self._last_log_time: dict[int, float] = {} 

        logger.info(
            "Highway Counter initialized — Band: %.0fpx-%.0fpx (Resolution: %d imgsz)",
            self.band_top,
            self.band_bottom,
            settings.IMAGE_SIZE
        )

    def update(
        self,
        tracked_vehicles: list[TrackedVehicle],
        current_hour: str,
    ) -> list[TrackedVehicle]:
        """
        Process tracked vehicles and register those entering the counting band.
        """
        new_counts: list[TrackedVehicle] = []

        for vehicle in tracked_vehicles:
            tid = vehicle.track_id
            cy = vehicle.center[1]
            
            # 1. Skip if already counted
            if tid in self.counted_ids:
                continue

            # 2. Skip if rejected (e.g., small bicycle)
            if vehicle.is_rejected:
                if self.band_top <= cy <= self.band_bottom and tid not in self._last_log_time:
                    logger.info("REJECTED: ID %d (%s) — %s", tid, vehicle.class_name, vehicle.reject_reason)
                    self._last_log_time[tid] = 1.0 
                continue

            # 3. RULE: Use averaged confidence for stable counting
            if vehicle.avg_confidence < settings.CONFIDENCE_THRESHOLD:
                continue

            # 4. Skip if unstable (too young)
            if vehicle.track_age < settings.MIN_TRACK_AGE:
                continue

            # 5. RULE: Count if centroid enters the band
            if self.band_top <= cy <= self.band_bottom:
                self.counted_ids.add(tid)
                self.class_counts[vehicle.class_name] += 1
                self.hourly_counts[current_hour][vehicle.class_name] += 1
                self.total_count += 1
                new_counts.append(vehicle)

                logger.info(
                    "COUNTED: ID %d (%s) [Avg Conf: %.2f, Age: %d]",
                    tid,
                    vehicle.class_name,
                    vehicle.avg_confidence,
                    vehicle.track_age
                )

        return new_counts

    def get_summary(self) -> dict:
        """Return a snapshot of all counts."""
        return {
            "total_count": self.total_count,
            "class_counts": dict(self.class_counts),
            "hourly_counts": {
                k: dict(v) for k, v in sorted(self.hourly_counts.items())
            },
            "band_region": [self.band_top, self.band_bottom],
        }
