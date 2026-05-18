'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileVideo, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  Zap,
  Clock
} from 'lucide-react';
import { UploadTask } from '@/lib/hooks/useUploadQueue';

interface UploadQueueProps {
  tasks: UploadTask[];
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

export function UploadQueue({ tasks, onRemove, onRetry }: UploadQueueProps) {
  if (tasks.length === 0) return null;

  return (
    <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-lg flex items-center gap-2">
              Ingestion Queue
              <Badge variant="secondary" className="h-5 px-1.5 font-mono">
                {tasks.length}
              </Badge>
            </CardTitle>
            <CardDescription>Real-time upload synchronization</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="relative group rounded-lg border border-muted-foreground/10 bg-muted/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <FileVideo className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px]">
                    {task.fileName || task.file?.name || 'Unknown'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {((task.fileSize || task.file?.size || 0) / (1024 * 1024)).toFixed(1)} MB • {task.metadata?.resolution || 'Extracting...'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {task.status === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : task.status === 'failed' ? (
                  <Button variant="ghost" size="icon" onClick={() => onRetry(task.id)} className="h-8 w-8">
                    <RefreshCw className="h-4 w-4 text-amber-500" />
                  </Button>
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
                <Button variant="ghost" size="icon" onClick={() => onRemove(task.id)} className="h-8 w-8 hover:text-destructive">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" /> {task.speed || 'Initializing...'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {task.eta || 'Calculating...'}
                </span>
                <span>{Math.round(task.progress)}%</span>
              </div>
              <Progress value={task.progress} className="h-1.5" />
            </div>

            {task.error && (
              <p className="text-[10px] text-destructive flex items-center gap-1 mt-2">
                <AlertCircle className="h-3 w-3" /> {task.error}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
