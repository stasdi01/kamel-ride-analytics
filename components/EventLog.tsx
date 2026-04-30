"use client";

import { useState, useEffect } from "react";
import type { Event } from "@/types/event";

interface Props {
  events: Event[];
}

const PAGE_SIZE = 10;

const CATEGORY_COLORS: Record<string, string> = {
  trips: "#F97316",
  payments: "#60A5FA",
  engagement: "#A78BFA",
  users: "#34D399",
};

export default function EventLog({ events }: Props) {
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [events]);

  const totalPages = Math.ceil(events.length / PAGE_SIZE);
  const slice = events.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function formatTs(ts: string) {
    return new Date(ts).toISOString().replace("T", " ").slice(0, 19) + " UTC";
  }

  return (
    <div
      className="rounded-lg p-5"
      style={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A" }}
    >
      <h2 className="text-sm font-sans font-semibold mb-4" style={{ color: "#F5F5F5" }}>
        Recent Events
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm font-sans">
          <thead>
            <tr style={{ borderBottom: "1px solid #2A2A2A" }}>
              {["Event", "Category", "Route", "Timestamp"].map((h) => (
                <th
                  key={h}
                  className="text-left pb-2 pr-4 font-medium"
                  style={{ color: "#737373", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((ev) => (
              <tr
                key={ev.id}
                style={{ borderBottom: "1px solid #2A2A2A" }}
                className="hover:bg-[#222]"
              >
                <td className="py-2 pr-4 font-mono text-xs" style={{ color: "#F5F5F5" }}>
                  {ev.name}
                </td>
                <td className="py-2 pr-4">
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded"
                    style={{
                      color: CATEGORY_COLORS[ev.category] ?? "#737373",
                      backgroundColor: `${CATEGORY_COLORS[ev.category] ?? "#737373"}18`,
                    }}
                  >
                    {ev.category}
                  </span>
                </td>
                <td className="py-2 pr-4 text-xs" style={{ color: "#737373" }}>
                  {ev.route ?? "—"}
                </td>
                <td className="py-2 font-mono text-xs" style={{ color: "#737373" }}>
                  {formatTs(ev.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs font-sans" style={{ color: "#737373" }}>
            Page {page + 1} of {totalPages} &middot; {events.length} events
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-xs font-sans px-3 py-1 rounded transition-colors disabled:opacity-30"
              style={{ backgroundColor: "#2A2A2A", color: "#F5F5F5" }}
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="text-xs font-sans px-3 py-1 rounded transition-colors disabled:opacity-30"
              style={{ backgroundColor: "#2A2A2A", color: "#F5F5F5" }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
