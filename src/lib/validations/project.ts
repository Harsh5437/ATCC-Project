import * as z from 'zod';

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  location: z.string().min(1, 'Location is required').max(255),
  road_junction: z.string().min(1, 'Road/Junction name is required').max(255),
  survey_date: z.string().min(1, 'Survey date is required'),
  direction: z.string().min(1, 'Survey direction is required').max(100),
  notes: z.string().optional(),
  status: z.enum(['Draft', 'Uploading', 'Processing', 'Completed', 'Review Required']).default('Draft'),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
