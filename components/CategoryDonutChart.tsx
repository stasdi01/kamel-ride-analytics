"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { CategoryVolume } from "@/types/event";

interface Props {
  data: CategoryVolume[];
}

const COLORS: Record<string, string> = {
  trips: "#F97316",
  payments: "#60A5FA",
  engagement: "#A78BFA",
  users: "#34D399",
};

const FALLBACK_COLORS = ["#F97316", "#60A5FA", "#A78BFA", "#34D399"];

interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: LabelProps) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#0F0F0F"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
      fontFamily="var(--font-plus-jakarta)"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function CategoryDonutChart({ data }: Props) {
  return (
    <div
      className="rounded-lg p-5"
      style={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A" }}
    >
      <h2 className="text-sm font-sans font-semibold mb-4" style={{ color: "#F5F5F5" }}>
        Events by Category
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            dataKey="count"
            nameKey="category"
            labelLine={false}
            label={renderLabel}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.category}
                fill={COLORS[entry.category] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 6 }}
            labelStyle={{ color: "#F5F5F5", fontFamily: "var(--font-plus-jakarta)" }}
            itemStyle={{ fontFamily: "var(--font-plus-jakarta)" }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: "#737373", fontSize: 12, fontFamily: "var(--font-plus-jakarta)" }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
