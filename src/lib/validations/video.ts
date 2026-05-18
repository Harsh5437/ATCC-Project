import * as z from 'zod';

export const videoUploadSchema = z.object({
  project_id: z.string().uuid('Please select a project'),
  files: z.array(z.instanceof(File)).min(1, 'Please select at least one video file'),
});

export type VideoUploadFormValues = z.infer<typeof videoUploadSchema>;

export const videoSchema = z.object({
  filename: z.string(),
  project_id: z.string().uuid(),
  storage_url: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).default('pending'),
  duration: z.number().optional(),
});
