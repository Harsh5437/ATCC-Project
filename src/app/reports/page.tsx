'use client';

import { ReportKpis } from '@/components/reports/report-kpis';
import { AnalyticsCharts } from '@/components/reports/analytics-charts';
import { ReportRegistry } from '@/components/reports/report-registry';
import { ExportCenter } from '@/components/reports/export-center';
import { 
  FilePieChart, 
  Settings, 
  Download, 
  Printer,
  Calendar,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
            Traffic Analytics Center
          </h2>
          <p className="text-muted-foreground">
            Enterprise-grade reporting and traffic engineering analytics.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-9 border-muted-foreground/20">
            <Calendar className="mr-2 h-4 w-4" />
            May 2026
          </Button>
          <Button variant="outline" size="sm" className="h-9 border-muted-foreground/20">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button size="sm" className="h-9 shadow-lg shadow-primary/20">
            <Printer className="mr-2 h-4 w-4" />
            Print Summary
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <ReportKpis />

      {/* Analytics Visualization */}
      <AnalyticsCharts />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Reports Registry */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FilePieChart className="h-4 w-4 text-primary" />
              Generated Intelligence Reports
            </h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-xs">
                All Formats
              </Button>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                Archived
              </Button>
            </div>
          </div>
          <ReportRegistry />
        </div>

        {/* Export Center Sidebar */}
        <div className="lg:col-span-1">
          <ExportCenter />
        </div>
      </div>
    </div>
  );
}
