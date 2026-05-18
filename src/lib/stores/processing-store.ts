/**
 * ATCC — Processing Store (Zustand)
 *
 * Client-side state for active uploads and processing jobs.
 * Persisted to localStorage to survive page refreshes.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ActiveUpload {
  id: string;
  file?: File;                // File cannot be persisted to localStorage
  fileName?: string;          // Keep name for UI after refresh
  fileSize?: number;          // Keep size for UI after refresh
  progress: number;
  status: 'uploading' | 'submitted' | 'failed';
  jobId?: string;
  error?: string;
}

interface ProcessingStore {
  // ── Active uploads ───────────────────────────────────────────
  uploads: ActiveUpload[];
  addUpload: (upload: ActiveUpload) => void;
  updateUpload: (id: string, updates: Partial<ActiveUpload>) => void;
  removeUpload: (id: string) => void;
  clearCompleted: () => void;

  // ── Tracked job IDs ──────────────────────────────────────────
  trackedJobIds: string[];
  trackJob: (jobId: string) => void;
  untrackJob: (jobId: string) => void;

  // ── Selected job ─────────────────────────────────────────────
  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;
}

export const useProcessingStore = create<ProcessingStore>()(
  persist(
    (set) => ({
      // Uploads
      uploads: [],
      addUpload: (upload) =>
        set((s) => ({ uploads: [...s.uploads, upload] })),
      updateUpload: (id, updates) =>
        set((s) => ({
          uploads: s.uploads.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        })),
      removeUpload: (id) =>
        set((s) => ({ uploads: s.uploads.filter((u) => u.id !== id) })),
      clearCompleted: () =>
        set((s) => ({ uploads: s.uploads.filter((u) => u.status !== 'submitted') })),

      // Job tracking
      trackedJobIds: [],
      trackJob: (jobId) =>
        set((s) => ({
          trackedJobIds: s.trackedJobIds.includes(jobId)
            ? s.trackedJobIds
            : [...s.trackedJobIds, jobId],
        })),
      untrackJob: (jobId) =>
        set((s) => ({
          trackedJobIds: s.trackedJobIds.filter((id) => id !== jobId),
        })),

      // Selected job
      selectedJobId: null,
      setSelectedJobId: (id) => set({ selectedJobId: id }),
    }),
    {
      name: 'atcc-processing-storage',
      storage: createJSONStorage(() => localStorage),
      // Don't persist the actual File object (it's not serializable)
      // and don't persist the selectedJobId across sessions.
      partialize: (state) => ({
        uploads: state.uploads.map(({ file, ...rest }) => rest),
        trackedJobIds: state.trackedJobIds,
      }),
    }
  )
);
