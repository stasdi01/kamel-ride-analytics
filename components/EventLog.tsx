"use client";

import { useState } from "react";
import type { Event } from "@/types/event";

interface Props {
  events: Event[];
}

const PAGE_SIZE = 12;

const CATEGORY_CHIP: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  trips: { label: "Trip", color: "#C76A14", bg: "#FCE8CD" },
  payments: { label: "Payment", color: "#2F9E6B", bg: "#E6F4EC" },
  engagement: { label: "Engagement", color: "#6B5BCC", bg: "#ECEAF8" },
  users: { label: "User", color: "#2A2520", bg: "#ECE3D5" },
};

const CATEGORY_DOT: Record<string, string> = {
  trips: "#F39C3D",
  payments: "#2F9E6B",
  engagement: "#6B5BCC",
  users: "#2A2520",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "trips", label: "Trip", dot: "#F39C3D" },
  { key: "payments", label: "Payment", dot: "#2F9E6B" },
  { key: "engagement", label: "Engagement", dot: "#6B5BCC" },
  { key: "users", label: "User", dot: "#2A2520" },
] as const;

function formatTs(ts: string): string {
  const d = new Date(ts);
  const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const day = d.getUTCDate();
  const time = d.toISOString().slice(11, 19);
  return `${month} ${day} · ${time}`;
}

function relativeTime(ts: string): string {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(Math.max(diff, 0))}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function EventLog({ events }: Props) {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = events.filter((ev) => {
    if (filter !== "all" && ev.category !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        ev.name.toLowerCase().includes(q) ||
        (ev.route ?? "").toLowerCase().includes(q) ||
        ev.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const slice = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function changeFilter(key: string) {
    setFilter(key);
    setPage(0);
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #ECE3D5",
        boxShadow: "0 1px 2px rgba(34,28,22,.03)",
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ padding: "22px 28px 16px", borderBottom: "1px solid #ECE3D5" }}
      >
        <div>
          <h2
            className="font-display font-semibold"
            style={{
              fontSize: 20,
              color: "#2A2520",
              letterSpacing: "-0.015em",
              fontVariationSettings: '"opsz" 144',
              margin: 0,
            }}
          >
            Event log
          </h2>
          <p
            className="font-sans mt-0.5"
            style={{ fontSize: 13.5, color: "#6B6660", margin: 0 }}
          >
            {events.length.toLocaleString()} total events
          </p>
        </div>

        <div className="flex items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => changeFilter(f.key)}
              className="inline-flex items-center gap-1.5 font-sans font-medium rounded-full transition-colors"
              style={{
                padding: "5px 11px",
                fontSize: 12.5,
                border:
                  filter === f.key ? "1px solid #1A1611" : "1px solid #ECE3D5",
                backgroundColor: filter === f.key ? "#1A1611" : "#FFFFFF",
                color: filter === f.key ? "#FFF3E4" : "#6B6660",
                cursor: "pointer",
              }}
            >
              {"dot" in f && (
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: f.dot }}
                />
              )}
              {f.label}
            </button>
          ))}

          <div
            className="inline-flex items-center gap-2 rounded-lg"
            style={{
              padding: "0 12px",
              border: "1px solid #ECE3D5",
              background: "#FFF8EC",
              width: 220,
              height: 32,
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9A938B"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3-3" />
            </svg>
            <input
              type="text"
              placeholder="Filter events, routes…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="flex-1 bg-transparent border-0 outline-none font-sans"
              style={{ fontSize: 12.5, color: "#2A2520" }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr
            style={{ background: "#FFF8EC", borderBottom: "1px solid #ECE3D5" }}
          >
            {[
              { label: "Event", w: "32%" },
              { label: "Category", w: "14%" },
              { label: "Route", w: "30%" },
              { label: "Timestamp", w: "24%" },
            ].map(({ label, w }) => (
              <th
                key={label}
                scope="col"
                style={{
                  width: w,
                  textAlign: "left",
                  padding: "12px 28px",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#9A938B",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontFamily: "var(--font-instrument-sans)",
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slice.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="font-sans text-center"
                style={{
                  padding: "40px 28px",
                  color: "#9A938B",
                  fontSize: 13.5,
                }}
              >
                No events yet
              </td>
            </tr>
          )}
          {slice.map((ev) => {
            const chip = CATEGORY_CHIP[ev.category];
            const dot = CATEGORY_DOT[ev.category] ?? "#9A938B";
            const routeParts = ev.route?.split(" → ");
            return (
              <tr
                key={ev.id}
                style={{ borderBottom: "1px solid #F4ECDD", cursor: "default" }}
                className="hover:bg-[#FFFBF3] transition-colors"
              >
                <td style={{ padding: "14px 28px", verticalAlign: "middle" }}>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: dot }}
                    />
                    <div>
                      <div
                        className="font-sans font-medium"
                        style={{ fontSize: 13.5, color: "#2A2520" }}
                      >
                        {ev.name.replace(/_/g, " ")}
                      </div>
                      <div
                        className="font-mono"
                        style={{ fontSize: 11, color: "#9A938B", marginTop: 2 }}
                      >
                        {ev.id.slice(0, 14)}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 28px", verticalAlign: "middle" }}>
                  {chip ? (
                    <span
                      className="inline-flex items-center font-sans font-medium rounded-md"
                      style={{
                        fontSize: 12,
                        padding: "3px 9px",
                        color: chip.color,
                        background: chip.bg,
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {chip.label}
                    </span>
                  ) : (
                    <span
                      className="font-sans"
                      style={{ fontSize: 12.5, color: "#6B6660" }}
                    >
                      {ev.category}
                    </span>
                  )}
                </td>
                <td style={{ padding: "14px 28px", verticalAlign: "middle" }}>
                  {routeParts ? (
                    <span
                      className="inline-flex items-center gap-2 font-sans"
                      style={{ fontSize: 13, color: "#2A2520" }}
                    >
                      {routeParts[0]}
                      <span style={{ color: "#9A938B" }}>→</span>
                      {routeParts[1]}
                    </span>
                  ) : (
                    <span
                      className="font-sans"
                      style={{ fontSize: 13, color: "#9A938B" }}
                    >
                      —
                    </span>
                  )}
                </td>
                <td style={{ padding: "14px 28px", verticalAlign: "middle" }}>
                  <span
                    className="font-mono"
                    style={{ fontSize: 12, color: "#6B6660" }}
                  >
                    {formatTs(ev.timestamp)}
                    <span className="ml-1.5" style={{ color: "#9A938B" }}>
                      {relativeTime(ev.timestamp)}
                    </span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div
        className="flex items-center justify-between font-sans"
        style={{
          padding: "14px 28px",
          borderTop: "1px solid #ECE3D5",
          background: "#FFF8EC",
          fontSize: 12.5,
          color: "#6B6660",
        }}
      >
        <span>
          Showing {slice.length} of {filtered.length.toLocaleString()} events
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center justify-center rounded-lg border transition-colors disabled:opacity-30"
            style={{
              width: 28,
              height: 28,
              borderColor: "#ECE3D5",
              background: "#FFFFFF",
              color: "#6B6660",
              cursor: page === 0 ? "not-allowed" : "pointer",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center justify-center rounded-lg border transition-colors disabled:opacity-30"
            style={{
              width: 28,
              height: 28,
              borderColor: "#ECE3D5",
              background: "#FFFFFF",
              color: "#6B6660",
              cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
