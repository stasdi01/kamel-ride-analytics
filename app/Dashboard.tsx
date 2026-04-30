"use client";

import { useState, useCallback, useEffect } from "react";
import StatCard from "@/components/StatCard";
import SupplyDemandChart from "@/components/SupplyDemandChart";
import RouteBreakdownChart from "@/components/RouteBreakdownChart";
import CategoryDonutChart from "@/components/CategoryDonutChart";
import EventLog from "@/components/EventLog";
import SimulateButton from "@/components/SimulateButton";
import type {
  Event,
  DashboardStats,
  SupplyDemandPoint,
  RouteVolume,
  CategoryVolume,
} from "@/types/event";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function computeStats(events: Event[]): DashboardStats {
  const today = new Date().toISOString().slice(0, 10);

  const tripsPostedToday = events.filter(
    (e) => e.name === "trip_posted" && e.timestamp.slice(0, 10) === today
  ).length;

  const seatRequested = events.filter((e) => e.name === "seat_requested").length;
  const seatConfirmed = events.filter((e) => e.name === "seat_confirmed").length;
  const seatFillRate = seatRequested > 0 ? (seatConfirmed / seatRequested) * 100 : 0;

  const paymentEvents = events.filter((e) => e.category === "payments");
  const paymentFailed = events.filter((e) => e.name === "payment_failed").length;
  const paymentFailureRate =
    paymentEvents.length > 0 ? (paymentFailed / paymentEvents.length) * 100 : 0;

  const hourCounts: Record<number, number> = {};
  events
    .filter((e) => e.name === "seat_requested")
    .forEach((e) => {
      const hour = new Date(e.timestamp).getUTCHours();
      hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;
    });

  const peakRequestHour =
    Object.keys(hourCounts).length > 0
      ? Number(Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0][0])
      : null;

  return { tripsPostedToday, seatFillRate, paymentFailureRate, peakRequestHour };
}

function computeSupplyDemand(events: Event[]): SupplyDemandPoint[] {
  const counts: Record<string, { tripsPosted: number; seatRequested: number }> = {};
  DAYS.forEach((d) => { counts[d] = { tripsPosted: 0, seatRequested: 0 }; });

  events.forEach((e) => {
    const dow = new Date(e.timestamp).getUTCDay();
    const day = DAYS[dow === 0 ? 6 : dow - 1];
    if (!counts[day]) counts[day] = { tripsPosted: 0, seatRequested: 0 };
    if (e.name === "trip_posted") counts[day].tripsPosted++;
    if (e.name === "seat_requested") counts[day].seatRequested++;
  });

  return DAYS.map((day) => ({ day, ...counts[day] }));
}

function computeRouteVolumes(events: Event[]): RouteVolume[] {
  const counts: Record<string, number> = {};
  events.forEach((e) => {
    if (e.route) counts[e.route] = (counts[e.route] ?? 0) + 1;
  });
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([route, count]) => ({ route, count }));
}

function computeCategoryVolumes(events: Event[]): CategoryVolume[] {
  const counts: Record<string, number> = {};
  events.forEach((e) => {
    counts[e.category] = (counts[e.category] ?? 0) + 1;
  });
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([category, count]) => ({ category, count }));
}

function formatHour(h: number | null): string {
  if (h === null) return "—";
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}${suffix}`;
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      // First fetch to get the real total, then re-fetch with that exact count
      // so client-side aggregations are never silently truncated.
      const probe = await fetch("/api/events?limit=1");
      if (!probe.ok) {
        setFetchError(`Failed to load events (${probe.status})`);
        return;
      }
      const { total } = (await probe.json()) as { total: number };
      const limit = Math.min(Math.max(total, 1), 10000);

      const res = await fetch(`/api/events?limit=${limit}`);
      if (!res.ok) {
        setFetchError(`Failed to load events (${res.status})`);
        return;
      }
      const data = (await res.json()) as { events: Event[] };
      setEvents(data.events);
      setFetchError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  const stats = computeStats(events);
  const supplyDemand = computeSupplyDemand(events);
  const routeVolumes = computeRouteVolumes(events);
  const categoryVolumes = computeCategoryVolumes(events);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0F0F0F" }}>
      {/* Nav */}
      <nav
        className="sticky top-0 z-10 flex items-center justify-between px-8 py-4"
        style={{ backgroundColor: "#1A1A1A", borderBottom: "1px solid #2A2A2A" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🐪</span>
          <span className="font-sans font-semibold text-base" style={{ color: "#F5F5F5" }}>
            Kamel Ride
          </span>
          <span className="text-xs font-sans px-2 py-0.5 rounded ml-1" style={{ color: "#737373", backgroundColor: "#2A2A2A" }}>
            Analytics
          </span>
        </div>
        <SimulateButton onSimulated={fetchEvents} />
      </nav>

      <main className="px-8 py-8 max-w-7xl mx-auto space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 gap-3">
            <span className="inline-block w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#F97316", borderTopColor: "transparent" }} />
            <span className="text-sm font-sans" style={{ color: "#737373" }}>Loading dashboard…</span>
          </div>
        ) : fetchError ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-sm font-sans px-4 py-3 rounded-lg" style={{ color: "#F97316", backgroundColor: "#F9731618", border: "1px solid #F9731640" }}>
              {fetchError}
            </div>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard
                label="Trips Posted Today"
                value={String(stats.tripsPostedToday)}
                description="trip_posted events since midnight"
                accentColor="#F97316"
              />
              <StatCard
                label="Seat Fill Rate"
                value={`${stats.seatFillRate.toFixed(1)}%`}
                description="seat_confirmed ÷ seat_requested"
                accentColor="#60A5FA"
              />
              <StatCard
                label="Payment Failure Rate"
                value={`${stats.paymentFailureRate.toFixed(1)}%`}
                description="payment_failed ÷ all payment events"
                accentColor="#A78BFA"
              />
              <StatCard
                label="Peak Request Hour"
                value={formatHour(stats.peakRequestHour)}
                description="hour with most seat_requested events"
                accentColor="#34D399"
              />
            </div>

            {/* Supply vs Demand */}
            <SupplyDemandChart data={supplyDemand} />

            {/* Route + Category */}
            <div className="grid grid-cols-2 gap-4">
              <RouteBreakdownChart data={routeVolumes} />
              <CategoryDonutChart data={categoryVolumes} />
            </div>

            {/* Event Log */}
            <EventLog events={events} />
          </>
        )}
      </main>
    </div>
  );
}
