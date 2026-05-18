"""
ATCC AI Worker — FastAPI Application Entry Point

Start with:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router
from core.config import settings

# ── Logging ──────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)

# ── App ──────────────────────────────────────────────────────────
app = FastAPI(
    title="ATCC AI Worker",
    description=(
        "Automatic Traffic Counter & Classifier — "
        "Video processing pipeline powered by YOLOv8 + ByteTrack."
    ),
    version="1.0.0",
)

# Allow the Next.js dashboard to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # lock down in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
async def root():
    return {
        "service": "ATCC AI Worker",
        "version": "1.0.0",
        "model": settings.MODEL_WEIGHTS,
        "device": settings.DEVICE,
        "docs": "/docs",
    }
