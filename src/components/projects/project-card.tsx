'use client';

import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  MapPin, 
  Calendar, 
  FileVideo, 
  FileBarChart, 
  Clock,
  Pencil,
  Trash2,
  Navigation
} from 'lucide-react';
import { Database } from '@/lib/supabase/database.types';
import { useDeleteProject } from '@/lib/hooks/useProjects';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const deleteProject = useDeleteProject();

  const getStatusVariant = (status: string | null): any => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Processing': return 'info';
      case 'Uploading': return 'warning';
      case 'Review Required': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this project? All associated videos and data will be lost.')) {
      await deleteProject.mutateAsync(project.id);
    }
  };

  return (
    <Card className="group border-none bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 shadow-lg overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {project.road_junction}, {project.location}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center focus:outline-none">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(project)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-4 py-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-md text-primary">
              <FileVideo className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Videos</p>
              <p className="text-sm font-semibold">0</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/10 p-2 rounded-md text-emerald-500">
              <FileBarChart className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Reports</p>
              <p className="text-sm font-semibold">0</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-muted/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Navigation className="h-3 w-3" />
            {project.direction}
          </div>
          <Badge variant={getStatusVariant(project.status)}>
            {project.status || 'Draft'}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 bg-muted/20 flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Survey: {project.survey_date ? format(new Date(project.survey_date), 'MMM dd, yyyy') : 'N/A'}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Updated: {project.created_at ? format(new Date(project.created_at), 'HH:mm') : 'N/A'}
        </div>
      </CardFooter>
    </Card>
  );
}
