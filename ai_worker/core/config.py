"""
ATCC AI Worker — Core Configuration

Centralizes all environment variables, paths, and constants
used across the processing pipeline.
"""

from pathlib import Path
from pydantic_settings import BaseSettings


def get_default_device() -> str:
    """Auto-detect the best hardware acceleration device available (MPS, CUDA, or CPU)."""
    try:
        import torch
        if torch.backends.mps.is_available():
            return "mps"
        elif torch.cuda.is_available():
            return "cuda"
    except ImportError:
        pass
    return "cpu"


class Settings(BaseSettings):
    """Application settings loaded from environment or .env file."""

    # ── Paths ─────────────────────────────────────────────────────
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    REPORTS_DIR: Path = BASE_DIR / "reports_output"
    
    # ── Production Performance ────────────────────────────────────
    MODEL_WEIGHTS: str = "yolov8s.pt"   
    IMAGE_SIZE: int = 960              
    PROCESS_EVERY_N_FRAMES: int = 4    
    DEBUG_MODE: bool = True           

    @property
    def BATCH_SIZE(self) -> int:
        # High-end: 8 batches for GPU (MPS/CUDA). Low-end: 1 batch for CPU.
        return 8 if self.DEVICE in ("cuda", "mps") else 1

    @property
    def HALF_PRECISION(self) -> bool:
        # GPUs can handle FP16 efficiently, CPUs generally cannot.
        return self.DEVICE in ("cuda", "mps")

    # ── Reporting Performance ─────────────────────────────────────
    # Modes: "FAST" (JSON/PDF Only), "STANDARD" (JSON/PDF/XLSX), "FULL" (All + Charts)
    REPORT_MODE: str = "STANDARD"      
    ENABLE_CHARTS: bool = False        # High CPU/Time overhead
    ENABLE_XLSX: bool = True           # Moderate overhead
    ENABLE_THUMBNAIL: bool = False     # Minimal overhead

    # ── Detection ─────────────────────────────────────────────────
    CONFIDENCE_THRESHOLD: float = 0.25
    IOU_THRESHOLD: float = 0.45
    DEVICE: str = get_default_device()

    # ── Geometric Filtering ───────────────────────────────────────
    MIN_BIKE_WIDTH: int = 35           
    MIN_BIKE_AREA: int = 2500          

    # ── Tracking ──────────────────────────────────────────────────
    TRACKER_CONFIG: str = "bytetrack.yaml"
    MIN_TRACK_AGE: int = 10            
    CONF_AVG_WINDOW: int = 10          

    # ── Counting (Entry-Band Mode) ────────────────────────────────
    ENTRY_BAND_TOP: float = 0.45
    ENTRY_BAND_BOTTOM: float = 0.68
    
    # ── Operational ───────────────────────────────────────────────
    MAX_CONCURRENT_JOBS: int = 2
    DEBUG_OUTPUT_DIR: Path = BASE_DIR / "outputs" / "debug"

    # ── COCO → ATCC class mapping ─────────────────────────────────
    COCO_TO_ATCC: dict[int, str] = {
        2: "Car",             # car
        3: "Bike",            # motorcycle
        5: "Bus",             # bus
        7: "Truck",           # truck
    }

    ATCC_CLASSES: list[str] = [
        "Bike",
        "Car",
        "Bus",
        "Truck",
        "Auto/E-rickshaw",
        "LCV",
    ]

    model_config = {"env_prefix": "ATCC_", "env_file": ".env"}


settings = Settings()

# Ensure directories exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
settings.DEBUG_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
