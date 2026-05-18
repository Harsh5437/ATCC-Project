import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../supabase/database.types';

export async function uploadVideo(
  supabase: SupabaseClient<Database>,
  file: File,
  onProgress?: (progress: number) => void
) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('videos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('videos')
    .getPublicUrl(filePath);

  return {
    path: data.path,
    publicUrl,
  };
}

export async function deleteVideoFile(supabase: SupabaseClient<Database>, path: string) {
  const { error } = await supabase.storage.from('videos').remove([path]);
  if (error) throw error;
}
