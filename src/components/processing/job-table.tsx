'use client';

import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  Terminal, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Cpu,
  MonitorPlay,
  ArrowRight,
  Download,
  Video
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAIJobs, useAIJobStatus } from '@/lib/hooks/useAIWorker';
import { useProcessingStore } from '@/lib/stores/processing-store';
import { getReportDownloadUrl, getDebugVideoUrl, type ProcessingJob } from '@/lib/services/ai-worker-api';
import { format } from 'date-fns';

export function JobTable() {
  const [search, setSearch] = useState('');
  const { data: jobs, isLoading } = useAIJobs();
  const { selectedJobId, setSelectedJobId } = useProcessingStore();
  const { data: selectedJob } = useAIJobStatus(selectedJobId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'Failed': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'Analyzing Frames':
      case 'Tracking Vehicles':
      case 'Generating Report':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string): any => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Failed': return 'destructive';
      case 'Analyzing Frames':
      case 'Tracking Vehicles':
      case 'Generating Report':
        return 'default';
      case 'Queued':
      case 'Initializing':
        return 'secondary';
      default: return 'secondary';
    }
  };

  const filteredJobs = jobs?.filter((job: ProcessingJob) =>
    job.video_path?.toLowerCase().includes(search.toLowerCase()) ||
    job.worker_node?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-xl bg-card/40 animate-pulse border border-muted/20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search operations..."
            className="pl-8 bg-card/50 border-muted-foreground/20 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <MonitorPlay className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="rounded-xl border border-muted-foreground/10 bg-card/30 overflow-hidden shadow-xl">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-muted-foreground/10">
              <TableHead className="text-xs uppercase font-bold text-muted-foreground">Operation</TableHead>
              <TableHead className="text-xs uppercase font-bold text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs uppercase font-bold text-muted-foreground w-[200px]">AI Pipeline</TableHead>
              <TableHead className="text-xs uppercase font-bold text-muted-foreground text-center">Node</TableHead>
              <TableHead className="text-xs uppercase font-bold text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!filteredJobs || filteredJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No AI operations found. Upload a video to begin.
                </TableCell>
              </TableRow>
            ) : (
              filteredJobs.map((job: ProcessingJob) => {
                const filename = job.video_path?.split('/').pop() || 'Unknown';
                return (
                  <TableRow key={job.job_id} className="border-muted-foreground/10 hover:bg-muted/20 group">
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm truncate max-w-[250px]">{filename}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          {job.job_id.slice(0, 8)}…
                          <ArrowRight className="h-2 w-2" />
                          {job.started_at ? format(new Date(job.started_at), 'HH:mm:ss') : 'Pending'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(job.status)} className="capitalize gap-1.5 h-6">
                        {getStatusIcon(job.status)}
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                          <span>ETA: {job.progress > 0 && job.progress < 100 ? `${Math.round((100 - job.progress) * 0.5)}s` : '--'}</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-1.5 bg-muted/50" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-muted/40 px-2 py-1 rounded border border-muted-foreground/10">
                        <Cpu className="h-3 w-3" />
                        {job.worker_node || 'AUTO'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          title="Stream Logs"
                          onClick={() => setSelectedJobId(job.job_id)}
                        >
                          <Terminal className="h-4 w-4" />
                        </Button>
                        {job.status === 'Completed' && (
                          <>
                            <Button 
                              variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-500/10 hover:text-emerald-500"
                              title="Download Report"
                              onClick={() => window.open(getReportDownloadUrl(job.job_id), '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {job.debug_video_path && (
                              <Button 
                                variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-500"
                                title="Debug Video"
                                onClick={() => window.open(getDebugVideoUrl(job.job_id), '_blank')}
                              >
                                <Video className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Live Logs Dialog */}
      <Dialog open={!!selectedJobId} onOpenChange={() => setSelectedJobId(null)}>
        <DialogContent className="sm:max-w-[700px] border-none bg-zinc-950 p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-4 border-b border-white/5 bg-zinc-900/50">
            <DialogTitle className="flex items-center gap-2 text-zinc-100">
              <div className="bg-emerald-500/10 p-1.5 rounded">
                <Terminal className="h-4 w-4 text-emerald-500" />
              </div>
              Worker Logs — {selectedJobId?.slice(0, 8)}…
              {selectedJob && selectedJob.status !== 'Completed' && selectedJob.status !== 'Failed' && (
                <Badge variant="outline" className="ml-auto border-emerald-500/30 text-emerald-500 bg-emerald-500/5 text-[10px] animate-pulse">
                  LIVE
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 font-mono text-xs text-zinc-400 bg-black/40 min-h-[400px] max-h-[60vh] overflow-y-auto">
            <pre className="whitespace-pre-wrap leading-relaxed">
              {selectedJob?.logs || 'Waiting for logs…'}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
