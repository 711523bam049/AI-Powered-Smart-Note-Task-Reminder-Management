import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';

export default function DashboardCharts({ weeklyActivity = [], tagCounts = [] }) {
  // Color palette matching dark/light styles
  const COLORS = ['#aa3bff', '#00ecff', '#10b981', '#fbbf24', '#f87171', '#3b82f6', '#ec4899'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass px-3 py-2 rounded-lg text-xs font-semibold shadow-premium border border-[var(--border-color)]">
          <p className="text-[var(--text-muted)] mb-1">{label}</p>
          <p className="text-brand-purple">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
      {/* 1. Weekly Activity Line Chart */}
      <div className="glass rounded-2xl p-6 flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="font-bold font-display text-lg text-[var(--text-main)]">
            Capture Frequency
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Weekly total capture updates logged
          </p>
        </div>

        <div className="h-64 w-full">
          {weeklyActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#aa3bff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#aa3bff" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  stroke="var(--text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  name="Captures" 
                  stroke="#aa3bff" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#purpleGlow)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[var(--text-muted)]">
              No activity logs recorded this week.
            </div>
          )}
        </div>
      </div>

      {/* 2. Tag Distribution Bar Chart */}
      <div className="glass rounded-2xl p-6 flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="font-bold font-display text-lg text-[var(--text-main)]">
            Tag Segments
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Distribution of tags across your notes & tasks
          </p>
        </div>

        <div className="h-64 w-full">
          {tagCounts.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagCounts} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="var(--text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Items" radius={[6, 6, 0, 0]}>
                  {tagCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[var(--text-muted)]">
              No tags recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
