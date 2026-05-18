"""
ATCC AI Worker — Optimized Report Generator

Designed for high-throughput production workloads.
Supports tiered reporting modes (FAST, STANDARD, FULL)
to minimize generation latency.
"""

from __future__ import annotations

import json
import logging
import time
from datetime import datetime
from pathlib import Path

import matplotlib.pyplot as plt
import openpyxl
from openpyxl.styles import Font, PatternFill
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
)

from core.config import settings

logger = logging.getLogger(__name__)


class ReportGenerator:
    """High-performance report generator with configurable output tiers."""

    def __init__(
        self,
        job_id: str,
        video_path: str,
        counter_summary: dict,
        video_meta: dict,
    ) -> None:
        self.job_id = job_id
        self.video_path = Path(video_path).name
        self.counter_summary = counter_summary
        self.video_meta = video_meta
        
        self.output_dir = settings.REPORTS_DIR / job_id
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.json_path = self.output_dir / "report.json"
        self.pdf_path = self.output_dir / "report.pdf"
        self.xlsx_path = self.output_dir / "report.xlsx"
        self.chart_dist_path = self.output_dir / "chart_distribution.png"
        self.chart_hourly_path = self.output_dir / "chart_hourly.png"

        self.report_data = self._build_report_payload()
        self.metrics = {}

    def _build_report_payload(self) -> dict:
        class_counts = self.counter_summary.get("class_counts", {})
        total = self.counter_summary.get("total_count", 0)

        distribution = []
        for cls_name in settings.ATCC_CLASSES:
            count = class_counts.get(cls_name, 0)
            distribution.append({
                "type": cls_name,
                "count": count,
                "percentage": round((count / total * 100) if total > 0 else 0, 1)
            })

        hourly = self.counter_summary.get("hourly_counts", {})
        
        return {
            "metadata": {
                "job_id": self.job_id,
                "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "video_source": self.video_path,
                "mode": settings.REPORT_MODE
            },
            "summary": {
                "total_vehicles": total,
                "duration": f"{round(self.video_meta['duration_seconds'], 1)}s",
            },
            "distribution": distribution,
            "hourly": sorted(hourly.items())
        }

    def _generate_charts(self):
        """Render Matplotlib charts if enabled."""
        if not settings.ENABLE_CHARTS and settings.REPORT_MODE != "FULL":
            return

        start = time.time()
        labels = [d["type"] for d in self.report_data["distribution"] if d["count"] > 0]
        sizes = [d["count"] for d in self.report_data["distribution"] if d["count"] > 0]
        
        if sizes:
            plt.figure(figsize=(5, 3))
            plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=140)
            plt.savefig(self.chart_dist_path, dpi=100, bbox_inches='tight')
            plt.close()

        self.metrics["charts_ms"] = round((time.time() - start) * 1000, 1)

    def _generate_pdf(self):
        """Build optimized PDF summary."""
        start = time.time()
        doc = SimpleDocTemplate(str(self.pdf_path), pagesize=A4, leftMargin=50, rightMargin=50)
        elements = []
        styles = getSampleStyleSheet()

        # Lean Header
        elements.append(Paragraph(f"ATCC Survey: {self.job_id}", styles['Heading1']))
        elements.append(Paragraph(f"Source: {self.video_path} | Date: {self.report_data['metadata']['generated_at']}", styles['Normal']))
        elements.append(Spacer(1, 0.2 * inch))

        # Charts (Lazy)
        if self.chart_dist_path.exists():
            elements.append(Image(str(self.chart_dist_path), width=3.5*inch, height=2.5*inch))
            elements.append(Spacer(1, 0.2 * inch))

        # Core Results Table
        table_data = [["Class", "Count", "%"]]
        for d in self.report_data["distribution"]:
            if d["count"] > 0 or settings.REPORT_MODE != "FAST":
                table_data.append([d["type"], str(d["count"]), f"{d['percentage']}%"])
        
        t = Table(table_data, colWidths=[2*inch, 1*inch, 1*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#2c3e50")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ]))
        elements.append(t)
        
        elements.append(Spacer(1, 0.5*inch))
        elements.append(Paragraph(f"Total Classified: {self.report_data['summary']['total_vehicles']}", styles['Heading3']))

        doc.build(elements)
        self.metrics["pdf_ms"] = round((time.time() - start) * 1000, 1)

    def _generate_excel(self):
        """Build Excel report if enabled."""
        if not settings.ENABLE_XLSX and settings.REPORT_MODE == "FAST":
            return

        start = time.time()
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Summary"
        
        ws.append(["Category", "Count"])
        for d in self.report_data["distribution"]:
            ws.append([d["type"], d["count"]])
        
        wb.save(self.xlsx_path)
        self.metrics["xlsx_ms"] = round((time.time() - start) * 1000, 1)

    def save(self) -> Path:
        """Execute tiered report generation."""
        total_start = time.time()
        
        # 1. JSON (Always)
        with open(self.json_path, "w") as f:
            json.dump(self.report_data, f, indent=2)

        # 2. Tiered Exports
        if settings.REPORT_MODE != "FAST" or settings.ENABLE_CHARTS:
            self._generate_charts()
        
        self._generate_pdf()
        
        if settings.REPORT_MODE != "FAST" or settings.ENABLE_XLSX:
            self._generate_excel()

        self.metrics["total_ms"] = round((time.time() - total_start) * 1000, 1)
        
        logger.info(
            "REPT  — Mode: %s | Total: %sms (PDF: %sms, XLSX: %sms, Charts: %sms)",
            settings.REPORT_MODE,
            self.metrics["total_ms"],
            self.metrics.get("pdf_ms", 0),
            self.metrics.get("xlsx_ms", 0),
            self.metrics.get("charts_ms", 0)
        )
        
        return self.json_path
