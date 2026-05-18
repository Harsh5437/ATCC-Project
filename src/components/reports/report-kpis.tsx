'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Clock, Weight, Target } from 'lucide-react';

export function ReportKpis() {
  const kpis = [
    {
      title: 'Total Classified Vehicles',
      value: '128,492',
      icon: Car,
      trend: '+12.5%',
      color: 'text-primary',
    },
    {
      title: 'Peak Hour Volume',
      value: '2,840 vph',
      icon: Clock,
      trend: '08:00 - 09:00',
      color: 'text-blue-500',
    },
    {
      title: 'Heavy Vehicle Percentage',
      value: '14.2%',
      icon: Weight,
      trend: 'IRC Class B',
      color: 'text-amber-500',
    },
    {
      title: 'AI Detection Accuracy',
      value: '99.4%',
      icon: Target,
      trend: 'Verified',
      color: 'text-emerald-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="border-none bg-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">
              {kpi.trend}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
