import { KpiCards } from '@/components/dashboard/kpi-cards';
import { TrafficVolumeChart } from '@/components/dashboard/traffic-volume-chart';
import { VehicleDistributionChart } from '@/components/dashboard/vehicle-distribution-chart';
import { ProcessingQueue } from '@/components/dashboard/processing-queue';
import { RecentDetections } from '@/components/dashboard/recent-detections';
import { SystemHealth, RecentReports, SurveyZoneStatus } from '@/components/dashboard/dashboard-panels';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Download, Filter, Calendar } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
            Control Center
          </h2>
          <p className="text-muted-foreground">
            Enterprise Traffic Analytics & AI Surveillance Dashboard
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="hidden h-8 lg:flex border-muted-foreground/20">
            <Calendar className="mr-2 h-4 w-4" />
            Last 24 Hours
          </Button>
          <Button variant="outline" size="sm" className="hidden h-8 lg:flex border-muted-foreground/20">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button size="sm" className="h-8 shadow-lg shadow-primary/20">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <KpiCards />

      {/* Analytics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <TrafficVolumeChart />
        <VehicleDistributionChart />
      </div>

      {/* Operations Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ProcessingQueue />
        </div>
        <div className="lg:col-span-2">
          <RecentDetections />
        </div>
      </div>

      {/* Footer / Status Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SystemHealth />
        <SurveyZoneStatus />
        <RecentReports />
      </div>
    </div>
  );
}
