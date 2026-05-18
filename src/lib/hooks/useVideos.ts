import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '../supabase/client';
import { getVideos, createVideo, deleteVideo } from '../services/db-utils';
import { uploadVideo, deleteVideoFile } from '../services/storage-utils';
import { Database } from '../supabase/database.types';

type Video = Database['public']['Tables']['videos']['Row'] & {
  projects: { name: string } | null;
};

export function useVideos(projectId?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['videos', projectId],
    queryFn: () => getVideos(supabase, projectId),
  });
}

export function useUploadVideo() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, projectId }: { file: File; projectId: string }) => {
      // 1. Upload to storage
      const { publicUrl, path } = await uploadVideo(supabase, file);

      // 2. Create database record
      return createVideo(supabase, {
        filename: file.name,
        project_id: projectId,
        storage_url: publicUrl,
        status: 'pending',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
}

export function useDeleteVideo() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (video: Video) => {
      // 1. Delete from storage (if we have the path)
      // Note: We need to extract path from storage_url or store path separately.
      // For now, let's assume storage_url contains the path or we just delete DB record.
      const path = video.storage_url?.split('/').pop();
      if (path) {
        await deleteVideoFile(supabase, path);
      }

      // 2. Delete from database
      await deleteVideo(supabase, video.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
}
