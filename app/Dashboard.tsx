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

type TimeRange = "24h" | "7 days" | "30 days" | "Quarter";

const TIME_SEGMENTS: TimeRange[] = ["24h", "7 days", "30 days", "Quarter"];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SPARKS = {
  trips: {
    color: "#F39C3D",
    line: "M0,22 L10,18 L22,21 L34,14 L46,16 L58,10 L70,12 L82,5 L92,3",
    area: "M0,22 L10,18 L22,21 L34,14 L46,16 L58,10 L70,12 L82,5 L92,3 L92,30 L0,30 Z",
  },
  fillRate: {
    color: "#2F9E6B",
    line: "M0,20 L12,22 L24,17 L36,18 L48,13 L60,14 L72,9 L84,11 L92,7",
    area: "M0,20 L12,22 L24,17 L36,18 L48,13 L60,14 L72,9 L84,11 L92,7 L92,30 L0,30 Z",
  },
  failRate: {
    color: "#D2503B",
    line: "M0,8 L10,14 L22,11 L34,16 L46,13 L58,18 L70,16 L82,21 L92,22",
    area: "M0,8 L10,14 L22,11 L34,16 L46,13 L58,18 L70,16 L82,21 L92,22 L92,30 L0,30 Z",
  },
};

function getRangeCutoff(range: TimeRange): Date {
  const now = new Date();
  switch (range) {
    case "24h":
      return new Date(now.getTime() - 24 * 3600 * 1000);
    case "7 days": {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - 6);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    }
    case "30 days": {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - 29);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    }
    case "Quarter": {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - 89);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    }
  }
}

function getRangeSubtitle(range: TimeRange): string {
  const now = new Date();
  const fmt = (d: Date) =>
    d.toLocaleString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  switch (range) {
    case "24h":     return "Last 24 hours";
    case "7 days": {
      const from = new Date(now);
      from.setUTCDate(from.getUTCDate() - 6);
      return `${fmt(from)} – ${fmt(now)}`;
    }
    case "30 days": return "Last 30 days";
    case "Quarter": return "Last 90 days";
  }
}

const TRIPS_LABEL: Record<TimeRange, string> = {
  "24h":     "Trips posted (24h)",
  "7 days":  "Trips posted (7d)",
  "30 days": "Trips posted (30d)",
  "Quarter": "Trips posted (quarter)",
};

const TRIPS_CONTEXT: Record<TimeRange, string> = {
  "24h":     "trip_posted in the last 24 hours",
  "7 days":  "trip_posted in the last 7 days",
  "30 days": "trip_posted in the last 30 days",
  "Quarter": "trip_posted in the last 90 days",
};

// XAxis tick density per range
const TICK_INTERVAL: Record<TimeRange, number> = {
  "24h":     3,   // every 4 hours → 6 visible labels across 24 pts
  "7 days":  0,   // show all 7
  "30 days": 4,   // every 5 days → 6 visible labels across 30 pts
  "Quarter": 1,   // every 2 weeks → 7 visible labels across 13 pts
};

// ── Compute functions ──────────────────────────────────────────────────────
function computeStats(events: Event[]): DashboardStats {
  const tripsPostedToday = events.filter((e) => e.name === "trip_posted").length;

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

function computeSupplyDemand(events: Event[], range: TimeRange): SupplyDemandPoint[] {
  const now = new Date();

  if (range === "24h") {
    // 24 hourly buckets, newest last
    const buckets: SupplyDemandPoint[] = Array.from({ length: 24 }, (_, i) => {
      const h = (now.getUTCHours() - 23 + i + 24) % 24;
      return { day: `${h}h`, tripsPosted: 0, seatRequested: 0 };
    });
    events.forEach((e) => {
      const ts = new Date(e.timestamp);
      const hoursAgo = Math.floor((now.getTime() - ts.getTime()) / 3600000);
      if (hoursAgo >= 0 && hoursAgo < 24) {
        const idx = 23 - hoursAgo;
        if (e.name === "trip_posted")   buckets[idx].tripsPosted++;
        if (e.name === "seat_requested") buckets[idx].seatRequested++;
      }
    });
    return buckets;
  }

  if (range === "7 days") {
    const counts: Record<string, { tripsPosted: number; seatRequested: number }> = {};
    DAYS.forEach((d) => { counts[d] = { tripsPosted: 0, seatRequested: 0 }; });
    events.forEach((e) => {
      const dow = new Date(e.timestamp).getUTCDay();
      const day = DAYS[dow === 0 ? 6 : dow - 1];
      if (e.name === "trip_posted")    counts[day].tripsPosted++;
      if (e.name === "seat_requested") counts[day].seatRequested++;
    });
    return DAYS.map((day) => ({ day, ...counts[day] }));
  }

  if (range === "30 days") {
    // 30 daily buckets, oldest first
    const buckets: SupplyDemandPoint[] = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - (29 - i));
      d.setUTCHours(0, 0, 0, 0);
      const label = d.toLocaleString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
      return { day: label, tripsPosted: 0, seatRequested: 0 };
    });
    events.forEach((e) => {
      const ts = new Date(e.timestamp);
      ts.setUTCHours(0, 0, 0, 0);
      const daysAgo = Math.round((now.getTime() - ts.getTime()) / 86400000);
      if (daysAgo >= 0 && daysAgo < 30) {
        const idx = 29 - daysAgo;
        if (e.name === "trip_posted")    buckets[idx].tripsPosted++;
        if (e.name === "seat_requested") buckets[idx].seatRequested++;
      }
    });
    return buckets;
  }

  // Quarter: 13 weekly buckets, oldest first
  const buckets: SupplyDemandPoint[] = Array.from({ length: 13 }, (_, i) => {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - (12 - i) * 7);
    const label = d.toLocaleString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    return { day: label, tripsPosted: 0, seatRequested: 0 };
  });
  events.forEach((e) => {
    const ts = new Date(e.timestamp);
    const weeksAgo = Math.floor((now.getTime() - ts.getTime()) / (7 * 86400000));
    if (weeksAgo >= 0 && weeksAgo < 13) {
      const idx = 12 - weeksAgo;
      if (e.name === "trip_posted")    buckets[idx].tripsPosted++;
      if (e.name === "seat_requested") buckets[idx].seatRequested++;
    }
  });
  return buckets;
}

function computeRouteVolumes(events: Event[]): RouteVolume[] {
  const counts: Record<string, number> = {};
  events.forEach((e) => {
    if (e.route && e.route.includes(" → ")) {
      counts[e.route] = (counts[e.route] ?? 0) + 1;
    }
  });
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
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

function formatPeakHour(h: number | null): { value: string; unit: string } {
  if (h === null) return { value: "—", unit: "" };
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const next = (h + 1) % 24;
  const nextAmpm = next >= 12 ? "PM" : "AM";
  const next12 = next % 12 === 0 ? 12 : next % 12;
  const unit =
    ampm === nextAmpm ? `–${next12} ${ampm}` : `${ampm}–${next12} ${nextAmpm}`;
  return { value: String(h12), unit };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Server returned non-JSON response");
  }
}

const NAV_LINKS = ["Analytics", "Rides", "Riders", "Payments", "Logs"] as const;

// ── Component ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchGeneration, setFetchGeneration] = useState(0);
  const [selectedRange, setSelectedRange] = useState<TimeRange>("7 days");

  const fetchEvents = useCallback(async () => {
    setRefreshing(true);
    try {
      const { total } = await fetchJson<{ total: number }>("/api/events?limit=1");
      const limit = Math.min(Math.max(total, 1), 10000);
      const { events: fetched } = await fetchJson<{ events: Event[] }>(
        `/api/events?limit=${limit}`
      );
      setEvents(fetched);
      setFetchGeneration((g) => g + 1);
      setFetchError(null);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (!fetchError) return;
    const timer = setTimeout(() => void fetchEvents(), 10_000);
    return () => clearTimeout(timer);
  }, [fetchError, fetchEvents]);

  // Filter all events to the selected range before deriving any metric
  const cutoff = getRangeCutoff(selectedRange);
  const rangeEvents = events.filter((e) => new Date(e.timestamp) >= cutoff);

  const stats          = computeStats(rangeEvents);
  const supplyDemand   = computeSupplyDemand(rangeEvents, selectedRange);
  const routeVolumes   = computeRouteVolumes(rangeEvents);
  const categoryVolumes = computeCategoryVolumes(rangeEvents);
  const peak           = formatPeakHour(stats.peakRequestHour);

  return (
    <div style={{ backgroundColor: "#FBF7F0", minHeight: "100vh" }}>

      {/* ── Nav ── */}
      <header style={{ background: "#1A1611", borderBottom: "1px solid #000" }}>
        <div
          className="mx-auto flex items-center"
          style={{ maxWidth: 1440, padding: "0 40px", height: 64, gap: 40 }}
        >
          <a className="flex items-center gap-2.5 no-underline" href="#" aria-label="Kamel Ride home">
            <span
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{
                width: 30,
                height: 30,
                background: "linear-gradient(135deg, #F39C3D 0%, #E8862A 100%)",
                boxShadow: "0 0 0 1px rgba(255,255,255,.06) inset",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#1A1611" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }} aria-hidden="true">
                <path d="M3 18c0-3 1.5-5 3-5s2 1.2 2 3v2" />
                <path d="M8 18v-2c0-1.5.8-3 2.5-3s2.5 1 2.5 3" />
                <path d="M13 16c0-2 1-4 2.5-4S18 13 18 15" />
                <path d="M18 15c1 0 2 .8 2 2v1" />
                <path d="M15.5 12V8.5" />
                <circle cx="15.7" cy="7.6" r="1.1" />
                <path d="M16.6 7.2c.5-.2 1.1.1 1.1.6" />
              </svg>
            </span>
            <span className="font-display font-semibold" style={{ fontSize: 22, letterSpacing: "-0.01em", color: "#FFF3E4" }}>
              Kamel
            </span>
          </a>

          <nav className="flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                className="font-sans font-medium rounded-lg transition-colors no-underline"
                style={{
                  padding: "7px 12px",
                  fontSize: 13.5,
                  letterSpacing: "-0.005em",
                  color: link === "Analytics" ? "#FFF3E4" : "#BFB3A0",
                  background: link === "Analytics" ? "rgba(255,255,255,.06)" : "transparent",
                }}
              >
                {link}
              </a>
            ))}
          </nav>

          <div className="flex-1" />

          {refreshing && !loading && (
            <span className="flex items-center gap-1.5 font-sans" style={{ fontSize: 12, color: "#BFB3A0" }}>
              <span className="inline-block w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{ borderColor: "#BFB3A0", borderTopColor: "transparent" }} />
              Refreshing…
            </span>
          )}

          <span
            className="inline-flex items-center gap-2 font-mono rounded-full"
            style={{ padding: "5px 10px 5px 8px", fontSize: 12, color: "#C8BFAE", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#5BD296", boxShadow: "0 0 0 3px rgba(91,210,150,.18)" }} />
            production
          </span>

          <SimulateButton onSimulated={fetchEvents} />

          <div
            className="flex items-center justify-center rounded-full font-sans font-semibold flex-shrink-0"
            style={{ width: 30, height: 30, background: "linear-gradient(135deg, #FBC988, #E8862A)", color: "#1A1611", fontSize: 12, border: "1px solid rgba(255,255,255,.1)" }}
            aria-label="User avatar"
          >
            KR
          </div>
        </div>
      </header>

      {/* ── Page ── */}
      <main style={{ maxWidth: 1440, margin: "0 auto", padding: "32px 40px 64px" }}>

        {/* Page header */}
        <div className="flex items-end justify-between mb-7">
          <div>
            <h1
              className="font-display font-semibold"
              style={{ fontSize: 34, letterSpacing: "-0.02em", color: "#2A2520", margin: "0 0 4px", fontVariationSettings: '"opsz" 144' }}
            >
              Analytics overview
            </h1>
            <p className="font-sans" style={{ fontSize: 14, color: "#6B6660", margin: 0 }}>
              {getRangeSubtitle(selectedRange)} · {routeVolumes.length} active routes
            </p>
          </div>
          <div
            className="inline-flex rounded-xl"
            style={{ background: "#FFFFFF", border: "1px solid #ECE3D5", boxShadow: "0 1px 2px rgba(34,28,22,.04)", padding: 3 }}
            role="tablist"
            aria-label="Time range"
          >
            {TIME_SEGMENTS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={t === selectedRange}
                onClick={() => setSelectedRange(t)}
                className="font-sans font-medium rounded-lg transition-colors"
                style={{
                  padding: "6px 14px",
                  fontSize: 13,
                  color: t === selectedRange ? "#FFF3E4" : "#6B6660",
                  background: t === selectedRange ? "#1A1611" : "transparent",
                  border: 0,
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex items-center justify-center gap-3" style={{ height: 256 }}>
            <span className="inline-block w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#F39C3D", borderTopColor: "transparent" }} />
            <span className="font-sans" style={{ fontSize: 14, color: "#6B6660" }}>Loading dashboard…</span>
          </div>
        ) : fetchError ? (
          <div className="flex items-center justify-center" style={{ height: 256 }}>
            <div
              className="flex items-center gap-3 font-sans rounded-xl"
              style={{ padding: "12px 16px", fontSize: 14, color: "#C76A14", background: "#FCE8CD", border: "1px solid rgba(243,156,61,.3)" }}
            >
              <span>{fetchError}</span>
              <button type="button" onClick={() => void fetchEvents()} className="font-medium underline underline-offset-2" style={{ color: "#C76A14" }}>
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-5 mb-7">
              <StatCard
                label={TRIPS_LABEL[selectedRange]}
                value={String(stats.tripsPostedToday)}
                context={TRIPS_CONTEXT[selectedRange]}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                    <path d="M3 17h2l1.5-4h11L19 17h2" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /><path d="M5 13l1.5-5h11L19 13" />
                  </svg>
                }
                iconBg="#FCE8CD" iconColor="#C76A14"
                delta="+18.4%" deltaDir="up"
                sparkColor={SPARKS.trips.color} sparkLine={SPARKS.trips.line} sparkArea={SPARKS.trips.area}
              />
              <StatCard
                label="Seat fill rate"
                value={stats.seatFillRate.toFixed(1)} unit="%"
                context={`${(stats.seatFillRate / 100 * 3).toFixed(2)} of 3 seats avg`}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                    <circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.2" /><path d="M3 19c0-3 2.5-5 6-5s6 2 6 5" /><path d="M15 18c0-2.2 1.6-4 4-4" />
                  </svg>
                }
                iconBg="#E6F4EC" iconColor="#2F9E6B"
                delta="+4.1pp" deltaDir="up"
                sparkColor={SPARKS.fillRate.color} sparkLine={SPARKS.fillRate.line} sparkArea={SPARKS.fillRate.area}
              />
              <StatCard
                label="Payment failure rate"
                value={stats.paymentFailureRate.toFixed(1)} unit="%"
                context={`${rangeEvents.filter(e => e.name === "payment_failed").length} of ${rangeEvents.filter(e => e.category === "payments").length} attempts`}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                    <rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><path d="M16 14l4 4M20 14l-4 4" />
                  </svg>
                }
                iconBg="#FBE9E5" iconColor="#C13F26"
                delta="−0.6pp" deltaDir="down"
                sparkColor={SPARKS.failRate.color} sparkLine={SPARKS.failRate.line} sparkArea={SPARKS.failRate.area}
              />
              <StatCard
                label="Peak request hour"
                value={peak.value} unit={peak.unit}
                context="busiest hour for seat requests (UTC)"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                  </svg>
                }
                iconBg="#FCE8CD" iconColor="#C76A14"
              />
            </div>

            {/* Supply vs Demand */}
            <div role="img" aria-label="Supply vs Demand line chart" className="mb-6">
              <SupplyDemandChart data={supplyDemand} tickInterval={TICK_INTERVAL[selectedRange]} />
            </div>

            {/* Route + Category */}
            <div className="grid grid-cols-2 gap-5 mb-6">
              <div role="img" aria-label="Bar chart showing event volume by route">
                <RouteBreakdownChart data={routeVolumes} />
              </div>
              <div role="img" aria-label="Donut chart showing event distribution by category">
                <CategoryDonutChart data={categoryVolumes} />
              </div>
            </div>

            {/* Event log — key resets page when new data arrives */}
            <EventLog key={fetchGeneration} events={rangeEvents} />
          </>
        )}
      </main>
    </div>
  );
}
