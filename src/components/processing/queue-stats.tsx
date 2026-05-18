'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, Activity, CheckCircle2, AlertCircle } from 'lucide-react';

interface QueueStatsProps {
  stats: {
    queued: number;
    active: number;
    completed: number;
    failed: number;
  };
}

export function QueueStats({ stats }: QueueStatsProps) {
  const items = [
    {
      title: 'Queued Jobs',
      value: stats.queued,
      icon: Layers,
      color: 'text-blue-500',
      description: 'Pending analysis',
    },
    {
      title: 'Active Processing',
      value: stats.active,
      icon: Activity,
      color: 'text-primary',
      description: 'Current AI workload',
    },
    {
      title: 'Completed Today',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      description: 'Successfully analyzed',
    },
    {
      title: 'Failed Jobs',
      value: stats.failed,
      icon: AlertCircle,
      color: 'text-destructive',
      description: 'Action required',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title} className="border-none bg-card/50 backdrop-blur-sm shadow-lg hover:bg-card/80 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
