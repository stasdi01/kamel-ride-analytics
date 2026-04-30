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
      const picks = Array.from({ length: 20 }, () => pickRandom(EVENT_POOL));
      const results = await Promise.allSettled(
        picks.map((ev) =>
          fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: ev.name,
              category: ev.category,
              route: ev.hasRoute ? pickRandom(ROUTES) : undefined,
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
        <span className="text-xs font-sans" style={{ color: "#F97316" }}>
          {failCount} event{failCount > 1 ? "s" : ""} failed to send
        </span>
      )}
      <button
        onClick={handleSimulate}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-sans font-medium transition-colors disabled:opacity-60"
        style={{
          backgroundColor: loading ? "#EA6D07" : "#F97316",
          color: "#fff",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? (
          <>
            <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Simulating…
          </>
        ) : (
          "Simulate Events"
        )}
      </button>
    </div>
  );
}
