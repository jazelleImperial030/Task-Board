"use client";

import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";

interface PriorityChartProps {
  high: number;
  medium: number;
  low: number;
}

const COLORS: Record<string, string> = {
  High: "#F85149",
  Medium: "#D29922",
  Low: "#3FB950",
};

export default function PriorityChart({ high, medium, low }: PriorityChartProps) {
  const total = high + medium + low;
  const data = [
    { name: "High", value: high },
    { name: "Medium", value: medium },
    { name: "Low", value: low },
  ].filter((d) => d.value > 0);

  if (total === 0) {
    return (
      <div className="bg-surface rounded-lg border border-border-custom p-6 flex items-center justify-center h-[300px]">
        <p className="text-muted text-sm">No tasks yet</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border-custom p-4">
      <h3 className="text-xs font-semibold text-foreground mb-3">Tasks by Priority</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={90}
            outerRadius={110}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          {/* Center label */}
          <text
            x="50%"
            y="40%"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground text-lg font-bold"
          >
            {total}
          </text>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-muted text-[10px]"
          >
            tasks
          </text>
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-xs text-muted">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
