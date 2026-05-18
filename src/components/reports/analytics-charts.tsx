'use client';

import { 
  AreaChart, Area, 
  BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const hourlyData = [
  { time: '00:00', volume: 400 }, { time: '04:00', volume: 300 },
  { time: '08:00', volume: 2400 }, { time: '12:00', volume: 1800 },
  { time: '16:00', volume: 2100 }, { time: '20:00', volume: 1200 },
  { time: '23:59', volume: 600 },
];

const classData = [
  { name: 'Car/Jeep', value: 4500, color: '#3b82f6' },
  { name: 'Bus', value: 1200, color: '#10b981' },
  { name: 'Truck (2-Axle)', value: 800, color: '#f59e0b' },
  { name: 'MAV', value: 400, color: '#ef4444' },
  { name: 'LCV', value: 1500, color: '#8b5cf6' },
  { name: '2-Wheeler', value: 3000, color: '#ec4899' },
];

const directionalData = [
  { direction: 'Northbound', volume: 4500 },
  { direction: 'Southbound', volume: 3800 },
  { direction: 'Eastbound', volume: 2900 },
  { direction: 'Westbound', volume: 3100 },
];

export function AnalyticsCharts() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2 border-none bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle>Traffic Flow Dynamics</CardTitle>
          <CardDescription>Hourly volume trend and classification breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="hourly">
            <TabsList className="mb-4 bg-muted/50 border border-muted-foreground/10">
              <TabsTrigger value="hourly">Hourly Trend</TabsTrigger>
              <TabsTrigger value="directional">Directional Flow</TabsTrigger>
            </TabsList>
            <TabsContent value="hourly" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                  <XAxis dataKey="time" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="directional" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={directionalData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                  <XAxis dataKey="direction" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                    cursor={{ fill: '#ffffff05' }}
                  />
                  <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle>Vehicle Composition</CardTitle>
          <CardDescription>Class distribution based on IRC-67</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={classData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {classData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
