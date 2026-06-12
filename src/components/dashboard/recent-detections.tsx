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

const detections: any[] = [];

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
            {detections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No recent detections
                </TableCell>
              </TableRow>
            ) : (
              detections.map((d) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
