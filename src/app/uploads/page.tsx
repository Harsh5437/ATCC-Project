'use client';

import { useState } from 'react';
import { FileUploadArea } from '@/components/uploads/file-upload-area';
import { UploadQueue } from '@/components/uploads/upload-queue';
import { VideoTable } from '@/components/uploads/video-table';
import { useProjects } from '@/lib/hooks/useProjects';
import { useUploadToWorker, useWorkerHealth } from '@/lib/hooks/useAIWorker';
import { useProcessingStore } from '@/lib/stores/processing-store';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Database, HardDrive, Cpu, Wifi, WifiOff, Table as TableIcon } from 'lucide-react';

export default function UploadsPage() {
  const { data: projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [bandTop, setBandTop] = useState<number>(0.45);
  const [bandBottom, setBandBottom] = useState<number>(0.68);
  const uploadMutation = useUploadToWorker();
  const { data: health } = useWorkerHealth();
  const { uploads, removeUpload } = useProcessingStore();

  const workerOnline = !!health;

  const handleFilesSelected = (files: File[], metadata: any[]) => {
    if (!selectedProjectId) {
      alert('Please select a project first.');
      return;
    }

    // Upload each file to the AI worker with custom bands
    files.forEach((file) => {
      uploadMutation.mutate({ file, bandTop, bandBottom });
    });
  };

  const handleRetry = (id: string) => {
    const upload = uploads.find(u => u.id === id);
    if (upload && upload.file) {
      uploadMutation.mutate({ file: upload.file, bandTop, bandBottom });
      removeUpload(id);
    } else {
      toast.error('File data lost after refresh. Please re-upload.', {
        id: 'upload-retry-fail'
      });
      removeUpload(id);
    }
  };

  // Map Zustand uploads to the UploadQueue format
  const queueTasks = uploads.map(u => ({
    id: u.id,
    fileName: u.fileName || u.file?.name || 'Unknown',
    fileSize: u.fileSize || u.file?.size || 0,
    projectId: selectedProjectId,
    progress: u.progress,
    status: u.status === 'uploading' ? 'uploading' as const :
            u.status === 'submitted' ? 'completed' as const :
            'failed' as const,
    error: u.error,
    speed: u.status === 'uploading' ? 'Streaming…' : undefined,
    eta: u.status === 'uploading' ? 'Calculating…' : u.status === 'submitted' ? '0s' : undefined,
  }));

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
            Data Ingestion
          </h2>
          <p className="text-muted-foreground">
            Upload survey footage for AI-powered vehicle classification.
          </p>
        </div>
        <Badge 
          variant={workerOnline ? 'success' : 'destructive'} 
          className="flex items-center gap-1.5 h-7 px-3"
        >
          {workerOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          AI Worker: {workerOnline ? 'Online' : 'Offline'}
          {health && ` (${health.device})`}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-sm">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Target Project
                </label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="bg-card/50 border-muted-foreground/20">
                    <SelectValue placeholder="Select a survey project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-6 pt-5">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Model: {health?.model || 'yolov8n.pt'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Workers: {health?.max_concurrent || 2}
                  </span>
                </div>
              </div>
            </div>

            {/* Adjustable Counter Band */}
            <Card className="overflow-hidden border border-muted-foreground/10 bg-card/30 backdrop-blur-md shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Bi-Directional Counting Zone (Up/Down)
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Configure the horizontal region for bi-directional (Up and Down) vehicle counting.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                    Dynamic ROI
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Visual Road Simulation */}
                <div className="relative h-44 rounded-xl border border-muted-foreground/15 bg-slate-950 overflow-hidden group shadow-inner">
                  {/* Perspective Road Lanes */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950 to-slate-950" />
                  
                  {/* Road markings */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-slate-700/60 transform -translate-x-1/2" />
                  <div className="absolute left-1/4 top-0 bottom-0 w-0.5 border-l border-slate-800/40" />
                  <div className="absolute right-1/4 top-0 bottom-0 w-0.5 border-l border-slate-800/40" />

                  {/* Lane Arrows */}
                  <div className="absolute top-6 left-1/3 text-slate-700/20 transform -rotate-12 select-none font-bold text-xs">↑ LANE 1</div>
                  <div className="absolute bottom-6 right-1/3 text-slate-700/20 transform rotate-12 select-none font-bold text-xs">↓ LANE 2</div>
                  
                  {/* Simulated vehicles */}
                  <div className="absolute top-12 left-1/4 w-8 h-12 bg-blue-500/10 border border-blue-500/30 rounded-md flex items-center justify-center text-[8px] font-mono text-blue-400/80 select-none animate-pulse">
                    Car
                  </div>
                  <div className="absolute bottom-8 right-1/4 w-10 h-16 bg-amber-500/10 border border-amber-500/30 rounded-md flex items-center justify-center text-[8px] font-mono text-amber-400/80 select-none">
                    Truck
                  </div>
                  <div className="absolute top-1/2 left-1/2 w-9 h-14 bg-purple-500/10 border border-purple-500/30 rounded-md flex items-center justify-center text-[8px] font-mono text-purple-400/80 select-none transform -translate-x-1/2 -translate-y-1/2">
                    LCV
                  </div>

                  {/* Custom Band Overlay */}
                  <div 
                    className="absolute inset-x-0 bg-emerald-500/10 border-y-2 border-emerald-400/80 backdrop-blur-[0.5px] transition-all duration-300 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    style={{
                      top: `${bandTop * 100}%`,
                      bottom: `${(1 - bandBottom) * 100}%`,
                    }}
                  >
                    <div className="px-2 py-0.5 rounded bg-emerald-500/90 text-[10px] font-extrabold text-slate-950 uppercase tracking-widest shadow-md">
                      Bi-Directional Tracking Active ({Math.round(bandTop * 100)}% - {Math.round(bandBottom * 100)}%)
                    </div>
                  </div>

                  {/* Top Boundary Line indicator label */}
                  <div 
                    className="absolute left-3 text-[9px] font-bold text-emerald-400/80 bg-slate-900/90 px-1.5 py-0.5 rounded border border-emerald-500/20 transform -translate-y-1/2 pointer-events-none transition-all duration-300"
                    style={{ top: `${bandTop * 100}%` }}
                  >
                    Top Line: {Math.round(bandTop * 100)}%
                  </div>

                  {/* Bottom Boundary Line indicator label */}
                  <div 
                    className="absolute right-3 text-[9px] font-bold text-emerald-400/80 bg-slate-900/90 px-1.5 py-0.5 rounded border border-emerald-500/20 transform -translate-y-1/2 pointer-events-none transition-all duration-300"
                    style={{ top: `${bandBottom * 100}%` }}
                  >
                    Bottom Line: {Math.round(bandBottom * 100)}%
                  </div>
                </div>

                {/* Sliders Control Panel */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="band-top-slider" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Top Boundary (Entry Line)
                      </label>
                      <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                        {Math.round(bandTop * 100)}%
                      </span>
                    </div>
                    <input
                      id="band-top-slider"
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(bandTop * 100)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) / 100;
                        // Ensure top doesn't cross bottom
                        setBandTop(Math.min(val, bandBottom - 0.05));
                      }}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <p className="text-[10px] text-muted-foreground">Sets where tracking starts. Default: 45%</p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="band-bottom-slider" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Bottom Boundary (Exit Line)
                      </label>
                      <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                        {Math.round(bandBottom * 100)}%
                      </span>
                    </div>
                    <input
                      id="band-bottom-slider"
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(bandBottom * 100)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) / 100;
                        // Ensure bottom doesn't cross top
                        setBandBottom(Math.max(val, bandTop + 0.05));
                      }}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <p className="text-[10px] text-muted-foreground">Sets where tracking finishes. Default: 68%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <FileUploadArea onFilesSelected={handleFilesSelected} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <TableIcon className="h-4 w-4 text-primary" />
                Ingestion Registry
              </h3>
            </div>
            <VideoTable />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <UploadQueue 
              tasks={queueTasks} 
              onRemove={removeUpload} 
              onRetry={handleRetry} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
