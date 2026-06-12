import * as z from 'zod';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  location: z.string().min(1, 'Location is required').max(255),
  road_junction: z.string().min(1, 'Road/Junction name is required').max(255),
  survey_date: z.string().min(1, 'Survey date is required'),
  direction: z.string().min(1, 'Survey direction is required').max(100),
  notes: z.string().optional(),
  status: z.enum(['Draft', 'Uploading', 'Processing', 'Completed', 'Review Required']),
});

try {
  projectSchema.parse({
    name: 'test',
    location: 'test',
    road_junction: 'test',
    survey_date: 'test',
    direction: 'test',
    notes: 'test',
    status: 'Draft',
  });
  console.log('Success');
} catch (e) {
  console.log(e);
}
