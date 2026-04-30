"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { RouteVolume } from "@/types/event";

interface Props {
  data: RouteVolume[];
}

const ORANGE_SHADES = ["#F97316", "#FB923C", "#FDBA74", "#FED7AA", "#FFF7ED"];

export default function RouteBreakdownChart({ data }: Props) {
  return (
    <div
      className="rounded-lg p-5"
      style={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A" }}
    >
      <h2 className="text-sm font-sans font-semibold mb-4" style={{ color: "#F5F5F5" }}>
        Volume by Route
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "#737373", fontSize: 11, fontFamily: "var(--font-plus-jakarta)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="route"
            width={150}
            tick={{ fill: "#737373", fontSize: 11, fontFamily: "var(--font-plus-jakarta)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 6 }}
            labelStyle={{ color: "#F5F5F5", fontFamily: "var(--font-plus-jakarta)" }}
            itemStyle={{ fontFamily: "var(--font-plus-jakarta)" }}
          />
          <Bar dataKey="count" name="Events" radius={[0, 3, 3, 0]}>
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={ORANGE_SHADES[Math.min(index, ORANGE_SHADES.length - 1)]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
