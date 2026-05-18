'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { time: '00:00', volume: 1200 },
  { time: '04:00', volume: 800 },
  { time: '08:00', volume: 4200 },
  { time: '12:00', volume: 3800 },
  { time: '16:00', volume: 5400 },
  { time: '20:00', volume: 3200 },
  { time: '23:59', volume: 1500 },
];

export function TrafficVolumeChart() {
  return (
    <Card className="col-span-4 border-none bg-card/50 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle>Traffic Volume Trend</CardTitle>
        <CardDescription>Aggregate vehicle volume across all zones (Last 24h)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis 
                dataKey="time" 
                stroke="#71717a" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#71717a" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  borderColor: '#27272a',
                  color: '#fafafa'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorVolume)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
