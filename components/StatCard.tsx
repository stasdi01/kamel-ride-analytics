"use client";

interface StatCardProps {
  label: string;
  value: string;
  description: string;
  accentColor?: string;
}

export default function StatCard({
  label,
  value,
  description,
  accentColor = "#F97316",
}: StatCardProps) {
  return (
    <div
      className="rounded-lg p-5 flex flex-col gap-1"
      style={{
        backgroundColor: "#1A1A1A",
        border: "1px solid #2A2A2A",
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      <span className="text-xs uppercase tracking-widest font-sans" style={{ color: "#737373" }}>
        {label}
      </span>
      <span className="text-4xl font-mono font-bold leading-none" style={{ color: "#F5F5F5" }}>
        {value}
      </span>
      <span className="text-xs font-sans mt-1" style={{ color: "#737373" }}>
        {description}
      </span>
    </div>
  );
}
