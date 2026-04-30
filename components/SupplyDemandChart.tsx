"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { SupplyDemandPoint } from "@/types/event";

interface Props {
  data: SupplyDemandPoint[];
}

export default function SupplyDemandChart({ data }: Props) {
  return (
    <div
      className="rounded-lg p-5"
      style={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A" }}
    >
      <h2 className="text-sm font-sans font-semibold mb-4" style={{ color: "#F5F5F5" }}>
        Supply vs Demand
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
          <XAxis
            dataKey="day"
            tick={{ fill: "#737373", fontSize: 12, fontFamily: "var(--font-plus-jakarta)" }}
            axisLine={{ stroke: "#2A2A2A" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#737373", fontSize: 12, fontFamily: "var(--font-plus-jakarta)" }}
            axisLine={false}
            tickLine={false}
          />
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
          <Line
            type="monotone"
            dataKey="tripsPosted"
            name="Trips Posted (Supply)"
            stroke="#F97316"
            strokeWidth={2}
            dot={{ fill: "#F97316", r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="seatRequested"
            name="Seat Requests (Demand)"
            stroke="#60A5FA"
            strokeWidth={2}
            dot={{ fill: "#60A5FA", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
