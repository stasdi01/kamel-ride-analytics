"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { CategoryVolume } from "@/types/event";

interface Props {
  data: CategoryVolume[];
}

const COLORS: Record<string, string> = {
  trips:      "#F39C3D",
  payments:   "#2F9E6B",
  engagement: "#6B5BCC",
  users:      "#2A2520",
};

const FALLBACK_COLORS = ["#F39C3D", "#2F9E6B", "#6B5BCC", "#2A2520"];

interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  percent: number;
}

function renderLabel({ cx, cy, midAngle, outerRadius, percent }: LabelProps) {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#9A938B"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontFamily="var(--font-instrument-sans)"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function CategoryDonutChart({ data }: Props) {
  return (
    <div
      className="rounded-2xl"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #ECE3D5",
        boxShadow: "0 1px 2px rgba(34,28,22,.03)",
        padding: "24px 28px 20px",
      }}
    >
      <div className="mb-2">
        <h2
          className="font-display font-semibold"
          style={{
            fontSize: 22,
            color: "#2A2520",
            letterSpacing: "-0.015em",
            fontVariationSettings: '"opsz" 144',
            margin: 0,
          }}
        >
          Events by category
        </h2>
        <p className="font-sans mt-1" style={{ fontSize: 13.5, color: "#6B6660", margin: 0 }}>
          Distribution across all event types
        </p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart margin={{ top: 10, right: 30, bottom: 0, left: 30 }}>
          <Pie
            data={data}
            cx="50%"
            cy="44%"
            innerRadius={50}
            outerRadius={72}
            dataKey="count"
            nameKey="category"
            labelLine={{ stroke: "#9A938B", strokeWidth: 1, strokeOpacity: 0.4 }}
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
            contentStyle={{
              backgroundColor: "#1A1611",
              border: "none",
              borderRadius: 10,
              padding: "10px 12px",
              boxShadow: "0 8px 24px rgba(26,22,17,.18)",
            }}
            labelStyle={{ color: "#BFB3A0", fontFamily: "var(--font-instrument-sans)" }}
            itemStyle={{ fontFamily: "var(--font-instrument-sans)", color: "#FFF3E4" }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: "#6B6660", fontSize: 12.5, fontFamily: "var(--font-instrument-sans)" }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
