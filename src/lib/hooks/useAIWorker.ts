/**
 * ATCC — React Query hooks for AI Worker integration
 *
 * Provides hooks for:
 * - Uploading videos to the AI worker
 * - Polling individual job status (3s interval)
 * - Fetching all jobs
 * - Fetching worker health
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  uploadVideoForProcessing,
  fetchAllJobs,
  fetchJobStatus,
  fetchHealth,
  type ProcessingJob,
} from '@/lib/services/ai-worker-api';
import { useProcessingStore } from '@/lib/stores/processing-store';
import { toast } from 'sonner';

// ── Upload mutation ──────────────────────────────────────────────

export function useUploadToWorker() {
  const { addUpload, updateUpload, trackJob } = useProcessingStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const uploadId = Math.random().toString(36).substring(7);

      // Register ephemeral upload in store
      addUpload({
        id: uploadId,
        file,
        fileName: file.name,
        fileSize: file.size,
        progress: 0,
        status: 'uploading',
      });

      try {
        const result = await uploadVideoForProcessing(file, (progress) => {
          updateUpload(uploadId, { progress });
        });

        // Upload complete → transition to "submitted"
        updateUpload(uploadId, {
          status: 'submitted',
          progress: 100,
          jobId: result.job_id,
        });

        // Start tracking the job for polling
        trackJob(result.job_id);

        return result;
      } catch (err: any) {
        updateUpload(uploadId, {
          status: 'failed',
          error: err?.message || 'Upload failed',
        });
        throw err;
      }
    },
    onSuccess: (data) => {
      toast.success('Video submitted for AI processing', {
        description: `Job ID: ${data.job_id.slice(0, 8)}…`,
      });
      queryClient.invalidateQueries({ queryKey: ['ai-jobs'] });
    },
    onError: (err: any) => {
      toast.error('Upload failed', {
        description: err?.message || 'Could not reach AI worker',
      });
    },
  });
}

// ── All jobs (background refresh) ────────────────────────────────

export function useAIJobs() {
  return useQuery({
    queryKey: ['ai-jobs'],
    queryFn: fetchAllJobs,
    refetchInterval: 5000, // 5s background refresh
    staleTime: 2000,
  });
}

// ── Single job polling (3s) ──────────────────────────────────────

export function useAIJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ['ai-job', jobId],
    queryFn: () => fetchJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      // Stop polling once terminal
      const status = query.state.data?.status;
      if (status === 'Completed' || status === 'Failed') return false;
      return 3000;
    },
    staleTime: 1000,
  });
}

// ── Worker health ────────────────────────────────────────────────

export function useWorkerHealth() {
  return useQuery({
    queryKey: ['ai-health'],
    queryFn: fetchHealth,
    refetchInterval: 30_000, // 30s
    staleTime: 15_000,
    retry: 1,
  });
}
