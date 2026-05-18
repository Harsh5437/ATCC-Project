'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileDown, 
  Settings2, 
  FileText, 
  Table as TableIcon, 
  BarChart3,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ExportCenter() {
  const templates = [
    { name: 'IRC Classified Volume', description: 'Standard MORTH/IRC-67 compliance report', icon: FileText, formats: ['PDF', 'Excel'] },
    { name: 'Peak Hour Analytics', description: 'Detailed peak volume and PHF analysis', icon: BarChart3, formats: ['PDF', 'CSV'] },
    { name: 'Vehicle Composition', description: 'Classification breakdown by percentage', icon: BarChart3, formats: ['PDF'] },
    { name: 'Directional Flow', description: 'Turning movement and lane-wise analytics', icon: TableIcon, formats: ['Excel', 'CSV'] },
  ];

  return (
    <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileDown className="h-5 w-5 text-primary" />
          Export Center
        </CardTitle>
        <CardDescription>Generate customized traffic engineering reports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.map((t) => (
          <div key={t.name} className="group relative rounded-lg border border-muted-foreground/10 p-4 hover:bg-muted/20 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <t.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{t.name}</h4>
                  <p className="text-[10px] text-muted-foreground">{t.description}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex gap-2">
              {t.formats.map(f => (
                <Badge key={f} variant="secondary" className="text-[9px] h-4 px-1.5 font-mono">
                  {f}
                </Badge>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 space-y-4">
          <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/20 flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <p className="text-[10px] text-emerald-500/80 font-medium">Data verified against AI confidence scores before generation.</p>
          </div>
          <Button className="w-full shadow-lg shadow-primary/20">
            <Settings2 className="mr-2 h-4 w-4" />
            Configure Custom Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
