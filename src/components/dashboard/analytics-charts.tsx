"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export function AnalyticsCharts({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Insights</CardTitle>
          <CardDescription>
            Insights are currently unavailable. Make sure you have an Instagram Business or Creator account connected.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Map API insights data to chart format if real data exists.
  // Assuming 'data' contains objects with name, values array.
  // Transform it for recharts depending on actual structure.

  // Example dummy transform based on Meta's typical format:
  // [{ name: 'impressions', values: [{ value: 120, end_time: '2023-10-01' }] }]
  const chartData = data.reduce((acc: any[], metric: any) => {
    metric.values?.forEach((val: any, idx: number) => {
      if (!acc[idx]) acc[idx] = { date: new Date(val.end_time).toLocaleDateString() };
      acc[idx][metric.name] = val.value;
    });
    return acc;
  }, []);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Insights</CardTitle>
        <CardDescription>Live data fetched from Meta Graph API</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip />
                <Bar dataKey="impressions" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                {/* Dynamically render bars for other metrics if present in standard API responses */}
                {Object.keys(chartData[0] || {}).includes('reach') && (
                  <Bar dataKey="reach" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-secondary" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
           <p className="text-sm text-muted-foreground text-center py-8">Not enough data to display charts.</p>
        )}
      </CardContent>
    </Card>
  );
}
