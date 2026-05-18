'use client';

import { FolderKanban, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onCreate: () => void;
}

export function EmptyState({ onCreate }: EmptyStateProps) {
  return (
    <div className="flex h-[450px] items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/5 p-12 text-center">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted shadow-inner">
          <FolderKanban className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mt-6 text-xl font-bold tracking-tight">No survey projects found</h3>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          You haven't initiated any traffic survey projects yet. Create your first project to start uploading videos and generating analytics reports.
        </p>
        <Button onClick={onCreate} size="lg" className="mt-8 px-8 shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          Create First Project
        </Button>
      </div>
    </div>
  );
}
