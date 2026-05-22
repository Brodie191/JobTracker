'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { WeeklyPoint } from '@/lib/queries/analytics';

interface WeeklyChartProps {
  data: WeeklyPoint[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-muted-foreground border-t border-b border-border">
        not enough data yet
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label: format(parseISO(d.week_start), 'd MMM'),
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid
            stroke="hsl(var(--border))"
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fontFamily: 'var(--font-courier)', fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: 'var(--font-courier)', fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            width={24}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 0,
              fontSize: 11,
              fontFamily: 'var(--font-courier)',
              padding: '4px 8px',
            }}
            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
            cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--foreground))"
            strokeWidth={1.5}
            dot={{ r: 2.5, fill: 'hsl(var(--foreground))', stroke: 'none' }}
            activeDot={{ r: 4, fill: 'hsl(var(--foreground))', stroke: 'none' }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
