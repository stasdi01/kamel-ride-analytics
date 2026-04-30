"use client";

import type { RouteVolume } from "@/types/event";

interface Props {
  data: RouteVolume[];
}

const HOT_ROUTES = new Set([
  "Boston → New York",
  "New York → Boston",
  "Boston → Philadelphia",
  "New York → Philadelphia",
]);

export default function RouteBreakdownChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div
        className="rounded-2xl"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #ECE3D5",
          boxShadow: "0 1px 2px rgba(34,28,22,.03)",
          padding: "24px 28px",
        }}
      >
        <h2
          className="font-display font-semibold"
          style={{
            fontSize: 22,
            color: "#2A2520",
            letterSpacing: "-0.015em",
            fontVariationSettings: '"opsz" 144',
            margin: "0 0 8px",
          }}
        >
          Event volume by route
        </h2>
        <p className="font-sans" style={{ fontSize: 13.5, color: "#9A938B", margin: 0 }}>
          No route data yet
        </p>
      </div>
    );
  }

  const total = data.reduce((s, r) => s + r.count, 0);
  const maxCount = Math.max(...data.map((r) => r.count));

  function splitRoute(route: string): { from: string; to: string } {
    const parts = route.split(" → ");
    return { from: parts[0] ?? route, to: parts[1] ?? "" };
  }

  return (
    <div
      className="rounded-2xl"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #ECE3D5",
        boxShadow: "0 1px 2px rgba(34,28,22,.03)",
        padding: "24px 28px",
      }}
    >
      <div className="flex items-start justify-between gap-6 mb-1">
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
            Event volume by route
          </h2>
          <p className="font-sans mt-1" style={{ fontSize: 13.5, color: "#6B6660", margin: 0 }}>
            Combined posts &amp; requests · top corridors
          </p>
          <div className="flex gap-4 mt-2">
            <span className="inline-flex items-center gap-1.5 font-sans font-medium" style={{ fontSize: 12.5, color: "#2A2520" }}>
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "#F39C3D" }} />
              High-demand corridor
            </span>
            <span className="inline-flex items-center gap-1.5 font-sans font-medium" style={{ fontSize: 12.5, color: "#2A2520" }}>
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "#E8C9A0" }} />
              Standard corridor
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div
            className="font-display font-semibold"
            style={{
              fontSize: 22,
              color: "#2A2520",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              fontVariationSettings: '"opsz" 144',
            }}
          >
            {total.toLocaleString()}
          </div>
          <div className="font-sans mt-0.5 uppercase" style={{ fontSize: 11.5, color: "#6B6660", letterSpacing: "0.06em" }}>
            Events · {data.length} routes
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 mt-5">
        {data.map((r) => {
          const { from, to } = splitRoute(r.route);
          const hot = HOT_ROUTES.has(r.route);
          const widthPct = (r.count / maxCount) * 100;
          return (
            <div
              key={r.route}
              className="grid items-center gap-4"
              style={{ gridTemplateColumns: "200px 1fr 72px 52px" }}
            >
              <div
                className="flex items-center gap-2 font-sans font-medium"
                style={{ fontSize: 13.5, color: "#2A2520", letterSpacing: "-0.005em" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: hot ? "#F39C3D" : "#C8C2BB" }}
                />
                <span>{from}</span>
                <span style={{ color: "#9A938B", fontSize: 12 }}>→</span>
                <span>{to}</span>
              </div>
              <div
                className="relative rounded-lg overflow-hidden"
                style={{ height: 28, background: "#FFF8EC" }}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 rounded-lg"
                  style={{
                    width: `${widthPct}%`,
                    background: hot
                      ? "linear-gradient(90deg, #F39C3D 0%, #FBC988 100%)"
                      : "linear-gradient(90deg, #E8C9A0 0%, #F4DDB8 100%)",
                    transition: "width .8s cubic-bezier(.2,.7,.2,1)",
                  }}
                />
              </div>
              <div
                className="text-right font-display font-semibold"
                style={{
                  fontSize: 18,
                  color: "#2A2520",
                  letterSpacing: "-0.01em",
                  fontVariationSettings: '"opsz" 144',
                }}
              >
                {r.count.toLocaleString()}
              </div>
              <div className="text-right font-sans" style={{ fontSize: 12.5, color: "#9A938B" }}>
                {((r.count / total) * 100).toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
