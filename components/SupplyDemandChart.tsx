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
  tickInterval?: number;
}

export default function SupplyDemandChart({ data, tickInterval = 0 }: Props) {
  const totalTrips = data.reduce((s, d) => s + d.tripsPosted, 0);
  const totalReqs = data.reduce((s, d) => s + d.seatRequested, 0);

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
      <div className="flex items-start justify-between gap-6 mb-3">
        <div>
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
            Trips posted vs. seat requests
          </h2>
          <p className="font-sans mt-1" style={{ fontSize: 13.5, color: "#6B6660", margin: 0 }}>
            Daily totals · last 7 days
          </p>
          <div className="flex gap-4 mt-2">
            <span className="inline-flex items-center gap-1.5 font-sans font-medium" style={{ fontSize: 12.5, color: "#2A2520" }}>
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "#F39C3D" }} />
              Trips posted
            </span>
            <span className="inline-flex items-center gap-1.5 font-sans font-medium" style={{ fontSize: 12.5, color: "#2A2520" }}>
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "#2A2520" }} />
              Seat requests
            </span>
          </div>
        </div>
        <div className="flex gap-7 flex-shrink-0">
          <div>
            <div
              className="font-display font-semibold"
              style={{ fontSize: 22, color: "#2A2520", letterSpacing: "-0.02em", lineHeight: 1, fontVariationSettings: '"opsz" 144' }}
            >
              {totalTrips}
            </div>
            <div className="font-sans mt-0.5 uppercase" style={{ fontSize: 11.5, color: "#6B6660", letterSpacing: "0.06em" }}>
              Trips · week
            </div>
          </div>
          <div>
            <div
              className="font-display font-semibold"
              style={{ fontSize: 22, color: "#2A2520", letterSpacing: "-0.02em", lineHeight: 1, fontVariationSettings: '"opsz" 144' }}
            >
              {totalReqs}
            </div>
            <div className="font-sans mt-0.5 uppercase" style={{ fontSize: 11.5, color: "#6B6660", letterSpacing: "0.06em" }}>
              Requests · week
            </div>
          </div>
          {totalTrips > 0 && (
            <div>
              <div
                className="font-display font-semibold"
                style={{ fontSize: 22, color: "#2A2520", letterSpacing: "-0.02em", lineHeight: 1, fontVariationSettings: '"opsz" 144' }}
              >
                {(totalReqs / totalTrips).toFixed(2)}×
              </div>
              <div className="font-sans mt-0.5 uppercase" style={{ fontSize: 11.5, color: "#6B6660", letterSpacing: "0.06em" }}>
                Demand ratio
              </div>
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="#F1E8D8" />
          <XAxis
            dataKey="day"
            interval={tickInterval}
            tick={{ fill: "#9A938B", fontSize: 11.5, fontFamily: "var(--font-instrument-sans)" }}
            axisLine={{ stroke: "#ECE3D5" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#9A938B", fontSize: 11.5, fontFamily: "var(--font-instrument-sans)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1A1611",
              border: "none",
              borderRadius: 10,
              padding: "10px 12px",
              boxShadow: "0 8px 24px rgba(26,22,17,.18)",
            }}
            labelStyle={{
              color: "#BFB3A0",
              fontFamily: "var(--font-instrument-sans)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 4,
            }}
            itemStyle={{ fontFamily: "var(--font-instrument-sans)", fontSize: 12, color: "#FFF3E4" }}
          />
          <Legend
            wrapperStyle={{ display: "none" }}
          />
          <Line
            type="monotone"
            dataKey="tripsPosted"
            name="Trips Posted"
            stroke="#F39C3D"
            strokeWidth={2.4}
            dot={{ fill: "#FFF", stroke: "#F39C3D", strokeWidth: 2, r: 4.5 }}
            activeDot={{ r: 6, fill: "#F39C3D" }}
          />
          <Line
            type="monotone"
            dataKey="seatRequested"
            name="Seat Requests"
            stroke="#2A2520"
            strokeWidth={2}
            dot={{ fill: "#FFF", stroke: "#2A2520", strokeWidth: 1.6, r: 3.5 }}
            activeDot={{ r: 5, fill: "#2A2520" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
