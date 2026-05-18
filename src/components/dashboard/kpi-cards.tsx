'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Truck, Zap, Activity } from 'lucide-react';

const kpis = [
  {
    title: 'Total Classified Vehicles',
    value: '42,892',
    description: '+12.5% from last period',
    icon: Users,
    color: 'text-blue-500',
  },
  {
    title: 'Heavy Vehicle Percentage',
    value: '18.4%',
    description: '+2.1% trend increase',
    icon: Truck,
    color: 'text-amber-500',
  },
  {
    title: 'Peak Hour Volume',
    value: '3,240',
    description: 'vph observed at 17:00',
    icon: Zap,
    color: 'text-purple-500',
  },
  {
    title: 'AI Accuracy Score',
    value: '99.2%',
    description: 'Based on manual validation',
    icon: Activity,
    color: 'text-emerald-500',
  },
];

export function KpiCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="border-none bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{kpi.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
