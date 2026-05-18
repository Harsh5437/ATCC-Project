"""
ATCC AI Worker — Frame Annotator

Renders visual debugging overlays on individual video frames:
bounding boxes, class labels, tracking IDs, rolling confidence scores,
track age, the entry-band region, and a live stats HUD.
"""

from __future__ import annotations

import cv2
import numpy as np

from trackers.bytetrack import TrackedVehicle
from core.config import settings


# ── Per-class color palette (BGR) ────────────────────────────────
CLASS_COLORS: dict[str, tuple[int, int, int]] = {
    "Bike":            (0, 200, 255),   # amber
    "Car":             (255, 180, 0),    # blue
    "Bus":             (0, 180, 0),      # green
    "Truck":           (0, 80, 255),     # red-orange
    "Auto/E-rickshaw": (0, 255, 200),   # cyan-green
    "LCV":             (200, 100, 255),  # magenta
}

DEFAULT_COLOR = (180, 180, 180)
REJECTED_COLOR = (0, 0, 255)      # Red for rejected

# ── Font settings ────────────────────────────────────────────────
FONT = cv2.FONT_HERSHEY_SIMPLEX
FONT_SCALE_LABEL = 0.4
FONT_SCALE_HUD = 0.55
FONT_SCALE_TITLE = 0.7
FONT_THICKNESS = 1
LINE_TYPE = cv2.LINE_AA


def _color_for(class_name: str) -> tuple[int, int, int]:
    return CLASS_COLORS.get(class_name, DEFAULT_COLOR)


def draw_entry_band(
    frame: np.ndarray,
    band_top: float,
    band_bottom: float,
) -> np.ndarray:
    """Draw the horizontal entry-band region with a translucent tint."""
    h, w = frame.shape[:2]
    top = int(band_top)
    bottom = int(band_bottom)

    overlay = frame.copy()
    cv2.rectangle(overlay, (0, top), (w, bottom), (0, 200, 255), -1)
    cv2.addWeighted(overlay, 0.12, frame, 0.88, 0, frame)
    
    cv2.line(frame, (0, top), (w, top), (0, 200, 255), 1, LINE_TYPE)
    cv2.line(frame, (0, bottom), (w, bottom), (0, 200, 255), 1, LINE_TYPE)

    label = f"ENTRY BAND (imgsz={settings.IMAGE_SIZE})"
    cv2.putText(frame, label, (20, top + 20), FONT, 0.45, (0, 200, 255), 1, LINE_TYPE)

    return frame


def draw_tracked_vehicles(
    frame: np.ndarray,
    vehicles: list[TrackedVehicle],
    counted_ids: set[int],
) -> np.ndarray:
    """Draw bounding boxes and highlight statuses (Counted/Rejected/Active)."""
    for v in vehicles:
        is_counted = v.track_id in counted_ids
        
        if v.is_rejected:
            color = REJECTED_COLOR
        elif is_counted:
            color = (0, 255, 0)
        else:
            color = _color_for(v.class_name)
            
        thickness = 2 if is_counted else 1
        x1, y1, x2, y2 = map(int, v.bbox)

        # Bounding box
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness, LINE_TYPE)

        # ── Label Composition ────────────────────────────────────
        # Show ID, Class, Rolling Conf, and Age
        label = f"ID:{v.track_id} {v.class_name} C:{v.avg_confidence:.2f} A:{v.track_age}"
        
        if v.is_rejected:
            label = f"REJECTED: {v.reject_reason}"
        elif is_counted:
            label += " [COUNTED]"
            
        (tw, th), _ = cv2.getTextSize(label, FONT, FONT_SCALE_LABEL, FONT_THICKNESS)
        label_y = max(y1 - 4, th + 4)
        cv2.rectangle(frame, (x1, label_y - th - 4), (x1 + tw + 6, label_y + 4), color, -1)
        cv2.putText(frame, label, (x1 + 3, label_y), FONT, FONT_SCALE_LABEL, (0, 0, 0), FONT_THICKNESS, LINE_TYPE)

        # Centroid dot
        cx, cy = int(v.center[0]), int(v.center[1])
        cv2.circle(frame, (cx, cy), 3, color, -1, LINE_TYPE)

    return frame


def draw_hud(
    frame: np.ndarray,
    frame_idx: int,
    class_counts: dict[str, int],
    timestamp: str,
) -> np.ndarray:
    """Draw a professional analytics HUD."""
    h, w = frame.shape[:2]

    panel_h = 200
    panel_w = 260
    
    overlay = frame.copy()
    cv2.rectangle(overlay, (15, 15), (panel_w, panel_h), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.85, frame, 0.15, 0, frame)
    cv2.rectangle(frame, (15, 15), (panel_w, panel_h), (80, 80, 80), 1, LINE_TYPE)

    cv2.putText(frame, "HIGHWAY DISTANT ANALYTICS", (25, 45), FONT, 0.55, (0, 200, 255), 2, LINE_TYPE)
    cv2.line(frame, (25, 55), (panel_w - 10, 55), (60, 60, 60), 1)

    cv2.putText(frame, f"TIME: {timestamp}", (25, 75), FONT, 0.4, (150, 150, 150), 1, LINE_TYPE)
    cv2.putText(frame, f"IMG: {settings.IMAGE_SIZE}px", (140, 75), FONT, 0.4, (150, 150, 150), 1, LINE_TYPE)

    y_off = 100
    total = 0
    for cls_name in settings.ATCC_CLASSES:
        count = class_counts.get(cls_name, 0)
        color = _color_for(cls_name)
        cv2.rectangle(frame, (25, y_off - 10), (35, y_off), color, -1)
        cv2.putText(frame, f"{cls_name}: {count}", (45, y_off), FONT, 0.45, (220, 220, 220), 1, LINE_TYPE)
        total += count
        y_off += 18

    cv2.line(frame, (25, y_off - 6), (panel_w - 10, y_off - 6), (60, 60, 60), 1)
    cv2.putText(frame, f"TOTAL VEHICLES: {total}", (25, y_off + 18), FONT, 0.6, (0, 200, 255), 2, LINE_TYPE)

    return frame


def annotate_frame(
    frame: np.ndarray,
    vehicles: list[TrackedVehicle],
    band_top: float,
    band_bottom: float,
    counted_ids: set[int],
    class_counts: dict[str, int],
    frame_idx: int,
    timestamp: str,
) -> np.ndarray:
    """Composes high-resolution analytics overlays."""
    out = frame.copy()
    out = draw_entry_band(out, band_top, band_bottom)
    out = draw_tracked_vehicles(out, vehicles, counted_ids)
    out = draw_hud(out, frame_idx, class_counts, timestamp)
    return out
