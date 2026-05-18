'use client';

import { useState } from 'react';
import { ProjectCard } from '@/components/projects/project-card';
import { ProjectDialog } from '@/components/projects/project-dialog';
import { EmptyState } from '@/components/projects/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, LayoutGrid, List } from 'lucide-react';
import { useProjects } from '@/lib/hooks/useProjects';
import { Database } from '@/lib/supabase/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

export default function ProjectsPage() {
  const { data: projects, isLoading, isError } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedProject(null);
    setDialogOpen(true);
  };

  const filteredProjects = projects?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.toLowerCase().includes(search.toLowerCase()) ||
    p.road_junction?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
            Traffic Surveys
          </h2>
          <p className="text-muted-foreground">
            Manage your ATCC survey projects and deployment zones.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleCreate} className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name, city, or junction..."
            className="pl-8 bg-card/50 border-muted-foreground/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-muted-foreground/20 p-1 bg-card/50">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="h-10 border-muted-foreground/20">
            <Filter className="mr-2 h-4 w-4" />
            Filter Status
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[250px] rounded-xl bg-card/40 animate-pulse border border-muted/20" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex h-[400px] items-center justify-center rounded-xl border border-destructive/50 bg-destructive/5">
          <p className="text-sm text-destructive font-medium">Failed to load survey projects. Please refresh the page.</p>
        </div>
      ) : filteredProjects && filteredProjects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onEdit={handleEdit} />
          ))}
        </div>
      ) : (
        <EmptyState onCreate={handleCreate} />
      )}

      <ProjectDialog 
        project={selectedProject} 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </div>
  );
}
