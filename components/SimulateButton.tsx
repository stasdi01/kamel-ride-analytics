"use client";

import { useState } from "react";

const EVENT_POOL: Array<{ name: string; category: string; hasRoute: boolean }> = [
  { name: "trip_posted", category: "trips", hasRoute: true },
  { name: "trip_posted", category: "trips", hasRoute: true },
  { name: "trip_posted", category: "trips", hasRoute: true },
  { name: "seat_requested", category: "trips", hasRoute: true },
  { name: "seat_requested", category: "trips", hasRoute: true },
  { name: "seat_requested", category: "trips", hasRoute: true },
  { name: "seat_requested", category: "trips", hasRoute: true },
  { name: "seat_confirmed", category: "trips", hasRoute: true },
  { name: "seat_confirmed", category: "trips", hasRoute: true },
  { name: "seat_confirmed", category: "trips", hasRoute: true },
  { name: "seat_declined", category: "trips", hasRoute: true },
  { name: "trip_departed", category: "trips", hasRoute: true },
  { name: "trip_completed", category: "trips", hasRoute: true },
  { name: "trip_cancelled", category: "trips", hasRoute: true },
  { name: "payment_processed", category: "payments", hasRoute: true },
  { name: "payment_processed", category: "payments", hasRoute: true },
  { name: "payment_failed", category: "payments", hasRoute: true },
  { name: "promo_applied", category: "payments", hasRoute: true },
  { name: "review_submitted", category: "engagement", hasRoute: true },
  { name: "user_signed_up", category: "users", hasRoute: false },
];

const ROUTES = [
  "Boston → New York",
  "Boston → New York",
  "Boston → New York",
  "New York → Boston",
  "New York → Boston",
  "Boston → Philadelphia",
  "New York → Philadelphia",
  "Boston → Providence",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface Props {
  onSimulated: () => void;
}

export default function SimulateButton({ onSimulated }: Props) {
  const [loading, setLoading] = useState(false);
  const [failCount, setFailCount] = useState(0);

  async function handleSimulate() {
    setLoading(true);
    setFailCount(0);
    try {
      const now = Date.now();
      const picks = Array.from({ length: 20 }, (_, i) => ({
        ...pickRandom(EVENT_POOL),
        timestamp: new Date(now + i * 50).toISOString(),
      }));
      const results = await Promise.allSettled(
        picks.map((ev) =>
          fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: ev.name,
              category: ev.category,
              route: ev.hasRoute ? pickRandom(ROUTES) : undefined,
              timestamp: ev.timestamp,
            }),
          }).then((res) => {
            if (!res.ok) throw new Error(`${res.status}`);
            return res;
          })
        )
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) setFailCount(failed);
      onSimulated();
    } catch {
      setFailCount(20);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {failCount > 0 && !loading && (
        <span className="font-sans text-xs" style={{ color: "#D2503B" }}>
          {failCount} event{failCount > 1 ? "s" : ""} failed to send
        </span>
      )}
      <button
        type="button"
        onClick={handleSimulate}
        disabled={loading}
        className="inline-flex items-center gap-2 font-sans font-semibold rounded-lg transition-colors"
        style={{
          padding: "9px 16px",
          fontSize: 13.5,
          letterSpacing: "-0.005em",
          backgroundColor: loading ? "#E8862A" : "#F39C3D",
          color: "#1A1611",
          border: 0,
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 1px 0 rgba(255,255,255,.25) inset, 0 1px 2px rgba(0,0,0,.4)",
          opacity: loading ? 0.8 : 1,
        }}
      >
        {loading ? (
          <>
            <span
              className="inline-block w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "#1A1611", borderTopColor: "transparent" }}
            />
            Simulating…
          </>
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 14, height: 14 }}
            >
              <path d="M13 2 L4 14 h7 l-1 8 9-12 h-7 z" />
            </svg>
            Simulate Events
          </>
        )}
      </button>
    </div>
  );
}
