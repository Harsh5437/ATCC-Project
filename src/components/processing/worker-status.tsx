'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, Thermometer, Zap, Box } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function WorkerStatus() {
  const workers = [
    { id: 'NODE-01', status: 'online', gpu: 85, temp: 68, power: 240 },
    { id: 'NODE-02', status: 'online', gpu: 42, temp: 52, power: 180 },
    { id: 'NODE-03', status: 'idle', gpu: 0, temp: 35, power: 45 },
  ];

  return (
    <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary" />
          AI Worker Nodes
        </CardTitle>
        <CardDescription>Edge Inference cluster status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {workers.map((w) => (
          <div key={w.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-bold">{w.id}</span>
              </div>
              <Badge variant={w.status === 'online' ? 'success' : 'secondary'} className="text-[10px] uppercase">
                {w.status}
              </Badge>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                <span>GPU Utilization</span>
                <span>{w.gpu}%</span>
              </div>
              <Progress value={w.gpu} className="h-1.5" />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <Thermometer className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">{w.temp}°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">{w.power}W</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
