'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server, Activity, Database, FileText, Download, CheckCircle2 } from 'lucide-react';

export function SystemHealth() {
  const systems: any[] = [];

  return (
    <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg">System Health</CardTitle>
        <CardDescription>Real-time node performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {systems.length === 0 ? (
            <div className="text-sm text-center text-muted-foreground py-4">No system data available</div>
          ) : (
            systems.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-sm font-medium">{s.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Load: {s.load}</span>
                  <Badge variant="outline" className="text-[10px] uppercase border-emerald-500/20 text-emerald-500">
                    {s.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentReports() {
  const reports: any[] = [];

  return (
    <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl h-full">
      <CardHeader>
        <CardTitle className="text-lg">Recent Reports</CardTitle>
        <CardDescription>Recently generated PDF exports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-sm text-center text-muted-foreground py-4">No recent reports</div>
          ) : (
            reports.map((r) => (
              <div key={r.name} className="flex items-center justify-between group cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.date} • {r.size}</p>
                  </div>
                </div>
                <Download className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SurveyZoneStatus() {
  const zones: any[] = [];

  return (
    <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg">Survey Zone Status</CardTitle>
        <CardDescription>Live monitoring points</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {zones.length === 0 ? (
            <div className="text-sm text-center text-muted-foreground py-4">No survey zones available</div>
          ) : (
            zones.map((z) => (
              <div key={z.name} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{z.name}</p>
                  <p className="text-[10px] text-muted-foreground">{z.vehicles} vehicles detected</p>
                </div>
                <Badge 
                  variant={z.status === 'Active' ? 'success' : 'secondary'} 
                  className="text-[10px]"
                >
                  {z.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
