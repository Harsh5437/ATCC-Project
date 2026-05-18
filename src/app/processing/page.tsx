'use client';

import { JobTable } from '@/components/processing/job-table';
import { QueueStats } from '@/components/processing/queue-stats';
import { WorkerStatus } from '@/components/processing/worker-status';
import { useAIJobs, useWorkerHealth } from '@/lib/hooks/useAIWorker';
import { type ProcessingJob } from '@/lib/services/ai-worker-api';
import { 
  Activity, 
  Settings, 
  History, 
  ShieldAlert,
  Cpu,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ProcessingPage() {
  const { data: jobs } = useAIJobs();
  const { data: health } = useWorkerHealth();

  const workerOnline = !!health;

  const stats = {
    queued: jobs?.filter((j: ProcessingJob) => j.status === 'Queued').length || 0,
    active: jobs?.filter((j: ProcessingJob) => 
      ['Analyzing Frames', 'Tracking Vehicles', 'Generating Report', 'Initializing'].includes(j.status)
    ).length || 0,
    completed: jobs?.filter((j: ProcessingJob) => j.status === 'Completed').length || 0,
    failed: jobs?.filter((j: ProcessingJob) => j.status === 'Failed').length || 0,
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
            AI Operations
          </h2>
          <p className="text-muted-foreground">
            Monitor real-time vehicle classification and frame analysis pipelines.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={workerOnline ? 'success' : 'destructive'} 
            className="flex items-center gap-1.5 h-7 px-3"
          >
            {workerOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {workerOnline ? `Online (${health.device})` : 'Offline'}
          </Badge>
          <Button variant="outline" size="sm" className="h-9 border-muted-foreground/20">
            <Settings className="mr-2 h-4 w-4" />
            Node Config
          </Button>
          <Button size="sm" className="h-9 shadow-lg shadow-primary/20">
            <Activity className="mr-2 h-4 w-4" />
            Live Monitor
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <QueueStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Job Feed */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Active Pipeline ({jobs?.length || 0} jobs)
            </h3>
          </div>
          <JobTable />
          
          {/* Failed Jobs Alert Section */}
          {stats.failed > 0 && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-center justify-between shadow-lg shadow-destructive/5">
              <div className="flex items-center gap-3">
                <div className="bg-destructive/10 p-2 rounded-full">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h4 className="font-bold text-destructive">Critical: {stats.failed} Operations Failed</h4>
                  <p className="text-xs text-muted-foreground">Some analysis jobs require manual intervention or worker node restart.</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive transition-colors">
                Resolve Failures
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar Status */}
        <div className="lg:col-span-1 space-y-6">
          <WorkerStatus />
          
          {/* Pipeline Utilization */}
          <div className="rounded-xl border border-muted-foreground/10 bg-card/30 p-6 space-y-4 shadow-xl">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              Pipeline Config
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model</span>
                <span className="font-mono">{health?.model || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Device</span>
                <span className="font-mono">{health?.device || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Workers</span>
                <span className="font-mono">{health?.max_concurrent || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Debug Mode</span>
                <Badge variant={health?.debug_mode ? 'success' : 'secondary'} className="text-[9px] h-4">
                  {health?.debug_mode ? 'ON' : 'OFF'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
