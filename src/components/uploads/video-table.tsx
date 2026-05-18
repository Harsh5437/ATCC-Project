'use client';

import { useVideos, useDeleteVideo } from '@/lib/hooks/useVideos';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  ExternalLink, 
  Trash2, 
  Play, 
  Video,
  Monitor,
  Clock,
  Layout
} from 'lucide-react';
import { format } from 'date-fns';

export function VideoTable() {
  const { data: videos, isLoading } = useVideos();
  const deleteMutation = useDeleteVideo();

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 rounded-lg bg-muted/40 animate-pulse border border-muted/20" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-muted-foreground/10 bg-card/30 overflow-hidden shadow-xl">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="border-muted-foreground/10">
            <TableHead className="text-xs uppercase font-bold text-muted-foreground">Video Ingestion</TableHead>
            <TableHead className="text-xs uppercase font-bold text-muted-foreground">Project</TableHead>
            <TableHead className="text-xs uppercase font-bold text-muted-foreground">Tech Specs</TableHead>
            <TableHead className="text-xs uppercase font-bold text-muted-foreground">Ingestion Date</TableHead>
            <TableHead className="text-xs uppercase font-bold text-muted-foreground">Status</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!videos || videos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Video className="h-8 w-8 opacity-20" />
                  <p>No survey videos ingested yet.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            videos.map((video) => (
              <TableRow key={video.id} className="border-muted-foreground/10 hover:bg-muted/20 group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/5 p-2 rounded-md group-hover:bg-primary/10 transition-colors">
                      <Play className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium text-sm max-w-[200px] truncate">{video.filename}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Layout className="h-3 w-3" />
                    {(video.projects as any)?.name || 'Default'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                      <Monitor className="h-3 w-3" /> {video.resolution || '720p+'}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                      <Clock className="h-3 w-3" /> {video.duration ? `${Math.floor(video.duration / 60)}m ${video.duration % 60}s` : 'Unknown'}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {video.uploaded_at ? format(new Date(video.uploaded_at), 'MMM dd, HH:mm') : '-'}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={video.status === 'completed' ? 'success' : 'secondary'}
                    className="capitalize text-[10px] h-5"
                  >
                    {video.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.open(video.storage_url || '', '_blank')}>
                        <ExternalLink className="mr-2 h-4 w-4" /> View Source
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(video)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Purge Record
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
