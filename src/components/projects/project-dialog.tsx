'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { projectSchema, ProjectFormValues } from '@/lib/validations/project';
import { useCreateProject, useUpdateProject } from '@/lib/hooks/useProjects';
import { Database } from '@/lib/supabase/database.types';
import { toast } from 'sonner';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectDialogProps {
  project?: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDialog({ project, open, onOpenChange }: ProjectDialogProps) {
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      location: '',
      road_junction: '',
      survey_date: '',
      direction: '',
      notes: '',
      status: 'Draft',
    },
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        location: project.location || '',
        road_junction: project.road_junction || '',
        survey_date: project.survey_date || '',
        direction: project.direction || '',
        notes: project.notes || '',
        status: (project.status as any) || 'Draft',
      });
    } else {
      reset({
        name: '',
        location: '',
        road_junction: '',
        survey_date: '',
        direction: '',
        notes: '',
        status: 'Draft',
      });
    }
  }, [project, reset]);

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      if (project) {
        await updateProject.mutateAsync({ id: project.id, project: values });
        toast.success('Project updated successfully');
      } else {
        await createProject.mutateAsync(values);
        toast.success('Project created successfully');
      }
      onOpenChange(false);
      reset();
    } catch (error: any) {
      console.error('Failed to save project:', error);
      toast.error(error.message || 'Failed to save project');
    }
  };

  const isPending = createProject.isPending || updateProject.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Create New Project'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Project Name</label>
              <Input id="name" {...register('name')} placeholder="e.g. NH-44 Survey" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <select
                id="status"
                {...register('status')}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="Draft">Draft</option>
                <option value="Uploading">Uploading</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Review Required">Review Required</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">City/Location</label>
              <Input id="location" {...register('location')} placeholder="e.g. Bangalore" />
              {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="road_junction" className="text-sm font-medium">Road / Junction</label>
              <Input id="road_junction" {...register('road_junction')} placeholder="e.g. Silk Board" />
              {errors.road_junction && <p className="text-xs text-destructive">{errors.road_junction.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="survey_date" className="text-sm font-medium">Survey Date</label>
              <Input id="survey_date" type="date" {...register('survey_date')} />
              {errors.survey_date && <p className="text-xs text-destructive">{errors.survey_date.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="direction" className="text-sm font-medium">Direction</label>
              <Input id="direction" {...register('direction')} placeholder="e.g. North to South" />
              {errors.direction && <p className="text-xs text-destructive">{errors.direction.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</label>
            <textarea
              id="notes"
              {...register('notes')}
              className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm"
              placeholder="Additional survey details..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : project ? 'Save Changes' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
