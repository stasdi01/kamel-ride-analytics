"use client";

import React from "react";

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  context?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  delta?: string;
  deltaDir?: "up" | "down" | "flat";
  sparkColor?: string;
  sparkLine?: string;
  sparkArea?: string;
}

export default function StatCard({
  label,
  value,
  unit,
  context,
  icon,
  iconBg,
  iconColor,
  delta,
  deltaDir = "flat",
  sparkColor,
  sparkLine,
  sparkArea,
}: StatCardProps) {
  const deltaStyles = {
    up:   { color: "#2F9E6B", bg: "rgba(47,158,107,.09)" },
    down: { color: "#D2503B", bg: "rgba(210,80,59,.08)" },
    flat: { color: "#6B6660", bg: "rgba(34,28,22,.05)" },
  };
  const { color: dColor, bg: dBg } = deltaStyles[deltaDir];
  const sparkId = `spark-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div
      className="rounded-2xl relative overflow-hidden"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #ECE3D5",
        boxShadow: "0 1px 2px rgba(34,28,22,.03)",
        padding: "20px 22px 22px",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <span
          className="font-sans font-medium"
          style={{ fontSize: 12.5, color: "#6B6660", letterSpacing: "0.01em" }}
        >
          {label}
        </span>
        <span
          className="flex items-center justify-center rounded-lg"
          style={{ width: 28, height: 28, backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </span>
      </div>

      <div className="leading-none">
        <span
          className="font-display font-semibold"
          style={{
            fontSize: 38,
            color: "#2A2520",
            letterSpacing: "-0.025em",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="font-display font-medium ml-0.5"
            style={{ fontSize: 22, color: "#9A938B", letterSpacing: "-0.01em" }}
          >
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3.5 gap-2">
        {delta && (
          <span
            className="inline-flex items-center gap-1 font-sans font-medium rounded-md"
            style={{
              fontSize: 12.5,
              padding: "3px 7px",
              color: dColor,
              backgroundColor: dBg,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {deltaDir === "up" && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 14l6-6 6 6" />
              </svg>
            )}
            {deltaDir === "down" && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 10l6 6 6-6" />
              </svg>
            )}
            {delta}
          </span>
        )}
        {context && (
          <span className="font-sans" style={{ fontSize: 12, color: "#9A938B" }}>
            {context}
          </span>
        )}
      </div>

      {sparkLine && sparkArea && sparkColor && (
        <svg
          style={{
            position: "absolute",
            right: 14,
            bottom: 14,
            width: 92,
            height: 30,
            pointerEvents: "none",
            opacity: 0.9,
          }}
          viewBox="0 0 92 30"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={sparkId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={sparkColor} stopOpacity="0.28" />
              <stop offset="100%" stopColor={sparkColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={sparkArea} fill={`url(#${sparkId})`} />
          <path
            d={sparkLine}
            fill="none"
            stroke={sparkColor}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
