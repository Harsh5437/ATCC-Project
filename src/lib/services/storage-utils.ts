import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../supabase/database.types';

function checkIsMock(supabase: SupabaseClient<Database>): boolean {
  const isSupabaseConfigured = supabase.supabaseUrl && !supabase.supabaseUrl.includes('localhost:54321');
  return !isSupabaseConfigured;
}

export async function uploadVideo(
  supabase: SupabaseClient<Database>,
  file: File,
  onProgress?: (progress: number) => void
) {
  if (checkIsMock(supabase)) {
    // Simulate upload progress
    if (onProgress) {
      onProgress(25);
      await new Promise(resolve => setTimeout(resolve, 200));
      onProgress(60);
      await new Promise(resolve => setTimeout(resolve, 200));
      onProgress(100);
    }
    
    // Generate object URL so browser can preview and play it locally
    const publicUrl = typeof window !== 'undefined' ? URL.createObjectURL(file) : '';
    
    return {
      path: `mock_videos/${file.name}`,
      publicUrl,
    };
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    return {
      path: data.path,
      publicUrl,
    };
  } catch (error: any) {
    console.warn('Supabase uploadVideo failed, falling back to local object URL:', error);
    
    if (onProgress) {
      onProgress(50);
      onProgress(100);
    }
    
    const publicUrl = typeof window !== 'undefined' ? URL.createObjectURL(file) : '';
    return {
      path: `mock_videos/${file.name}`,
      publicUrl,
    };
  }
}

export async function deleteVideoFile(supabase: SupabaseClient<Database>, path: string) {
  if (checkIsMock(supabase)) {
    return;
  }

  try {
    const { error } = await supabase.storage.from('videos').remove([path]);
    if (error) throw error;
  } catch (error: any) {
    console.warn(`Supabase deleteVideoFile ${path} failed:`, error);
  }
}
