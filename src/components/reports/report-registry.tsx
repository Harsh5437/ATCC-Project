'use client';

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
  FileText, 
  Download, 
  Eye, 
  RefreshCw, 
  Trash2, 
  MoreHorizontal,
  FileSpreadsheet,
  FileType,
  Database,
  Video,
  Loader2
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useAIJobs } from '@/lib/hooks/useAIWorker';
import { getReportDownloadUrl, getReportPdfUrl, getReportXlsxUrl, getDebugVideoUrl, type ProcessingJob } from '@/lib/services/ai-worker-api';

export function ReportRegistry() {
  const { data: jobs, isLoading } = useAIJobs();

  // Only show completed jobs that have reports
  const completedJobs = jobs?.filter((j: ProcessingJob) => 
    j.status === 'Completed' && j.report_path
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
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
            <TableHead className="text-xs uppercase font-bold text-muted-foreground">Report Identity</TableHead>
            <TableHead className="text-xs uppercase font-bold text-muted-foreground">Source Video</TableHead>
            <TableHead className="text-xs uppercase font-bold text-muted-foreground">Worker Node</TableHead>
            <TableHead className="text-xs uppercase font-bold text-muted-foreground">Completed</TableHead>
            <TableHead className="text-xs uppercase font-bold text-muted-foreground">Status</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {completedJobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 opacity-20" />
                  <p>No reports generated yet. Process a video to see results here.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            completedJobs.map((job: ProcessingJob) => {
              const filename = job.video_path?.split('/').pop() || 'Unknown';
              return (
                <TableRow key={job.job_id} className="border-muted-foreground/10 hover:bg-muted/20 group transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/5 p-2 rounded-md group-hover:bg-primary/10 transition-colors">
                        <FileText className="h-4 w-4 text-rose-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">IRC Volume Report</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-mono">
                          JSON • {job.job_id.slice(0, 8)}…
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Database className="h-3 w-3" />
                      {filename}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase border-muted-foreground/20 text-muted-foreground">
                      {job.worker_node}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {job.completed_at ? format(new Date(job.completed_at), 'MMM dd, HH:mm') : '--'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" className="h-5 text-[10px]">
                      Completed
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" size="icon" 
                        className="h-8 w-8 hover:bg-emerald-500/10 hover:text-emerald-500"
                        title="Download PDF Report"
                        onClick={() => window.open(getReportPdfUrl(job.job_id), '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(getReportPdfUrl(job.job_id), '_blank')}>
                            <FileText className="mr-2 h-4 w-4 text-rose-500" /> Download PDF Report
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(getReportXlsxUrl(job.job_id), '_blank')}>
                            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500" /> Download Excel Report
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(getReportDownloadUrl(job.job_id), '_blank')}>
                            <FileType className="mr-2 h-4 w-4 text-blue-500" /> Preview JSON Data
                          </DropdownMenuItem>
                          {job.debug_video_path && (
                            <DropdownMenuItem onClick={() => window.open(getDebugVideoUrl(job.job_id), '_blank')}>
                              <Video className="mr-2 h-4 w-4 text-indigo-500" /> Stream Debug Video
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
