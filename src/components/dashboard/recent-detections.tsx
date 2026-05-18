'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Car, Truck, Bike, ShieldCheck } from 'lucide-react';

const detections = [
  {
    id: '1',
    type: 'Truck (Heavy)',
    zone: 'Zone North',
    timestamp: '14:22:15',
    confidence: 99.8,
    icon: Truck,
    color: 'text-amber-500',
  },
  {
    id: '2',
    type: 'Sedan',
    zone: 'Zone South',
    timestamp: '14:22:12',
    confidence: 98.5,
    icon: Car,
    color: 'text-blue-500',
  },
  {
    id: '3',
    type: 'Motorcycle',
    zone: 'Zone East',
    timestamp: '14:22:08',
    confidence: 97.2,
    icon: Bike,
    color: 'text-emerald-500',
  },
  {
    id: '4',
    type: 'SUV',
    zone: 'Zone North',
    timestamp: '14:22:05',
    confidence: 99.1,
    icon: Car,
    color: 'text-blue-500',
  },
];

export function RecentDetections() {
  return (
    <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg">Recent Detections</CardTitle>
        <CardDescription>Live feed from edge analysis units</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-muted-foreground/20">
              <TableHead className="text-xs uppercase font-bold text-muted-foreground">Type</TableHead>
              <TableHead className="text-xs uppercase font-bold text-muted-foreground">Zone</TableHead>
              <TableHead className="text-xs uppercase font-bold text-muted-foreground">Time</TableHead>
              <TableHead className="text-xs uppercase font-bold text-muted-foreground text-right">Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detections.map((d) => (
              <TableRow key={d.id} className="border-muted-foreground/10 hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <d.icon className={`h-4 w-4 ${d.color}`} />
                    <span className="font-medium text-sm">{d.type}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{d.zone}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{d.timestamp}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[10px]">
                    <ShieldCheck className="h-2 w-2 mr-1" /> {d.confidence}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
