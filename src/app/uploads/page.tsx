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
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Database, HardDrive, Cpu, Wifi, WifiOff, Table as TableIcon } from 'lucide-react';

export default function UploadsPage() {
  const { data: projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const uploadMutation = useUploadToWorker();
  const { data: health } = useWorkerHealth();
  const { uploads, removeUpload } = useProcessingStore();

  const workerOnline = !!health;

  const handleFilesSelected = (files: File[], metadata: any[]) => {
    if (!selectedProjectId) {
      alert('Please select a project first.');
      return;
    }

    // Upload each file to the AI worker
    files.forEach((file) => {
      uploadMutation.mutate(file);
    });
  };

  const handleRetry = (id: string) => {
    const upload = uploads.find(u => u.id === id);
    if (upload && upload.file) {
      uploadMutation.mutate(upload.file);
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
