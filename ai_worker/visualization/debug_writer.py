"""
ATCC AI Worker — Debug Video Writer

Manages the output MP4 file and thumbnail capture for
the visual debugging pipeline.
"""

from __future__ import annotations

import logging
from pathlib import Path

import cv2
import numpy as np

logger = logging.getLogger(__name__)


class DebugVideoWriter:
    """
    Writes annotated frames to an MP4 file using OpenCV's VideoWriter.

    Also captures a single mid-video frame as a JPEG thumbnail.
    """

    def __init__(
        self,
        output_path: Path,
        width: int,
        height: int,
        fps: float,
        total_frames: int,
    ) -> None:
        self.output_path = output_path
        self.thumbnail_path = output_path.with_suffix(".thumb.jpg")
        self.total_frames = total_frames
        self.thumbnail_frame_idx = total_frames // 2  # mid-video
        self._thumbnail_saved = False

        # Use mp4v codec for broad compatibility
        fourcc = cv2.VideoWriter_fourcc(*"avc1")
        self.writer = cv2.VideoWriter(
            str(output_path), fourcc, fps, (width, height)
        )

        if not self.writer.isOpened():
            raise RuntimeError(f"Failed to open video writer: {output_path}")

        logger.info(
            "Debug writer initialized: %s (%dx%d @ %.1ffps)",
            output_path.name, width, height, fps,
        )

    def write_frame(self, frame: np.ndarray, frame_idx: int) -> None:
        """Write a single annotated frame and optionally capture thumbnail."""
        self.writer.write(frame)

        # Capture thumbnail at the mid-point
        if not self._thumbnail_saved and frame_idx >= self.thumbnail_frame_idx:
            cv2.imwrite(str(self.thumbnail_path), frame)
            self._thumbnail_saved = True
            logger.info("Thumbnail captured: %s", self.thumbnail_path.name)

    def release(self) -> None:
        """Finalize and close the video file."""
        self.writer.release()
        logger.info("Debug video finalized: %s", self.output_path.name)

        # If thumbnail was never captured (very short video), use last frame
        if not self._thumbnail_saved:
            logger.warning("Thumbnail not captured (video too short).")
