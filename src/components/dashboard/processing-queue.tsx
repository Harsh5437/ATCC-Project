'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileVideo, Clock, Loader2 } from 'lucide-react';

const queue = [
  {
    id: '1',
    filename: 'NH44_Junction_A_1.mp4',
    status: 'processing',
    progress: 68,
    eta: '2m 15s',
  },
  {
    id: '2',
    filename: 'Expressway_East_3.mov',
    status: 'queued',
    progress: 0,
    eta: '5m 30s',
  },
  {
    id: '3',
    filename: 'City_Center_Main.mp4',
    status: 'processing',
    progress: 12,
    eta: '12m 45s',
  },
];

export function ProcessingQueue() {
  return (
    <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg">Active Processing Queue</CardTitle>
        <CardDescription>Video analysis currently in progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {queue.map((job) => (
            <div key={job.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <FileVideo className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{job.filename}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={job.status === 'processing' ? 'info' : 'warning'} className="text-[10px] h-4">
                        {job.status === 'processing' && <Loader2 className="h-2 w-2 animate-spin mr-1" />}
                        {job.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-2 w-2" /> ETA: {job.eta}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-sm font-semibold">{job.progress}%</span>
              </div>
              <Progress value={job.progress} className="h-1.5" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
