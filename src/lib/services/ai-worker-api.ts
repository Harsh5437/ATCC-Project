/**
 * ATCC AI Worker — API Client
 *
 * Clean service abstraction for communicating with the
 * FastAPI backend. All endpoints return typed responses.
 */

import axios, { AxiosProgressEvent } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_AI_WORKER_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  timeout: 300_000, // 5 min for large uploads
});

// ── Types ────────────────────────────────────────────────────────

export interface ProcessingJob {
  job_id: string;
  video_path: string;
  status: string;
  progress: number;
  logs: string;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
  report_path: string | null;
  debug_video_path: string | null;
  thumbnail_path: string | null;
  worker_node: string;
}

export interface ProcessResponse {
  job_id: string;
  status: string;
  message: string;
}

export interface HealthResponse {
  status: string;
  device: string;
  model: string;
  max_concurrent: number;
  debug_mode: boolean;
}

// ── Upload ───────────────────────────────────────────────────────

export async function uploadVideoForProcessing(
  file: File,
  onProgress?: (progress: number) => void,
  bandTop?: number,
  bandBottom?: number,
): Promise<ProcessResponse> {
  const formData = new FormData();
  formData.append('video', file);
  if (bandTop !== undefined) {
    formData.append('band_top', bandTop.toString());
  }
  if (bandBottom !== undefined) {
    formData.append('band_bottom', bandBottom.toString());
  }

  const { data } = await api.post<ProcessResponse>('/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (event.total && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });

  return data;
}

// ── Jobs ─────────────────────────────────────────────────────────

export async function fetchAllJobs(): Promise<ProcessingJob[]> {
  const { data } = await api.get<ProcessingJob[]>('/jobs');
  return data;
}

export async function fetchJobStatus(jobId: string): Promise<ProcessingJob> {
  const { data } = await api.get<ProcessingJob>(`/jobs/${jobId}`);
  return data;
}

// ── Reports ──────────────────────────────────────────────────────

export function getReportDownloadUrl(jobId: string): string {
  return `${API_BASE}/api/v1/reports/${jobId}`;
}

export function getReportPdfUrl(jobId: string): string {
  return `${API_BASE}/api/v1/reports/${jobId}/pdf`;
}

export function getReportXlsxUrl(jobId: string): string {
  return `${API_BASE}/api/v1/reports/${jobId}/xlsx`;
}

export function getDebugVideoUrl(jobId: string): string {
  return `${API_BASE}/api/v1/debug/video/${jobId}`;
}

export function getDebugThumbnailUrl(jobId: string): string {
  return `${API_BASE}/api/v1/debug/thumbnail/${jobId}`;
}

// ── Health ───────────────────────────────────────────────────────

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health');
  return data;
}

export default api;
