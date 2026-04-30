# Kamel Ride — Analytics Dashboard

## 1. What it is

This is a marketplace health dashboard for Kamel Ride, a community-powered intercity carpooling platform connecting students across the Northeast. Unlike generic analytics tools, it's built around the specific operational challenge of a two-sided marketplace: are there enough drivers posting trips to meet passenger demand? The dashboard ingests platform events via a REST API and visualizes supply, demand, and conversion metrics at a glance — giving the Kamel Ride team the signal they need to make fast product decisions.

## 2. Live demo

> Deploy to Vercel and add your URL here.

```
vercel deploy --prod
```

## 3. Getting started

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Requirements:** Node 18+, no external database needed (SQLite is local). Copy `.env.example` to `.env` before running.

> The seed data covers Apr 20–26, 2026. Hit **Simulate Events** on first load to add today's events and populate the "Trips Posted Today" stat card.

## 4. Architecture decisions

**SQLite + Prisma** — SQLite requires zero infrastructure for a reviewer to run locally. Prisma adds type-safe query building and a clean migration story. The tradeoff is that SQLite doesn't support Prisma's native `Json` field type, so `metadata` is stored as a serialized JSON string and parsed at the API boundary — a small ergonomics cost with no user-facing impact.

**Zod** — Runtime validation at the API boundary means bad input is rejected with structured, field-level error messages (not vague 500s). The same schemas double as TypeScript type sources via `z.infer<>`, eliminating the "type says one thing, runtime says another" class of bug.

**Next.js App Router + Route Handlers** — One repository for the full stack. The API routes (`/app/api/events/route.ts`) use the native `NextRequest`/`NextResponse` primitives. The dashboard page is a client component that fetches from those same routes, so there's no separate backend process to run.

**Client-side data aggregation** — All chart computations (supply/demand grouping, route volumes, category breakdown) happen in the browser from a single `GET /api/events?limit=1000` call. This keeps the API simple (one general-purpose endpoint with filters) and avoids over-engineering aggregation queries for a dashboard of this scope. At scale, these would move to database-level aggregations.

## 5. Dashboard metrics explained

| Metric | Formula | Why it matters |
|---|---|---|
| **Trips Posted Today** | `count(trip_posted)` since midnight | The leading indicator of supply health. A drop here before a peak travel day is an early warning sign. |
| **Seat Fill Rate** | `seat_confirmed / seat_requested × 100` | The core marketplace conversion metric. Below ~60% means passengers can't find seats; above ~90% means supply is too thin and demand is being left unmet. |
| **Payment Failure Rate** | `payment_failed / all payment events × 100` | Revenue leakage. High rates indicate payment method issues or fraud friction that's costing completed rides. |
| **Peak Request Hour** | Hour with most `seat_requested` events | Demand concentration. Knowing when passengers are searching helps coordinate driver supply and push notification timing. |

## 6. Seed data narrative

The seed script (`prisma/seed.ts`) generates one full week of realistic platform activity, Monday through Sunday, anchored to the week of April 20–26, 2026.

**The story arc:**
- **Mon–Tue:** Quiet early-week. A handful of drivers post trips, minimal seat requests. The platform is idle.
- **Wed:** Activity builds. More `trip_posted` events. Students start planning weekend travel and requesting seats.
- **Thu:** Peak supply day. Drivers post aggressively. `seat_confirmed` events pick up. First `payment_failed → payment_processed` retry sequences appear.
- **Fri:** Peak demand day. Highest `seat_requested` volume of the week (30 events). Last-minute `seat_declined` as popular routes fill. Most `trip_departed` events fire in the afternoon.
- **Sat:** Quiet. A small wave of return trips posted on the NYC → Boston corridor.
- **Sun:** Return rush. `seat_requested` spikes again in the evening (17–21h UTC). `trip_completed` and `review_submitted` events close out the week.

**The intentional Sunday demand gap:**

Sunday 5–9pm sees 28 `seat_requested` events against only 8 `trip_posted` — the lowest supply-to-demand ratio of the week. This reflects a real marketplace dynamic: drivers don't want to make the return drive Sunday night. The Supply vs Demand line chart makes this imbalance visible: the blue demand line (seat requests) spikes on Sunday while the orange supply line (trips posted) stays flat. For the Kamel Ride team, this is an actionable signal — driver incentives or surge pricing on Sunday returns could close the gap.

## 7. What I'd build next

- **Real-time updates via SSE or WebSockets** — Replace the manual "Simulate" refresh pattern with server-sent events so the dashboard updates live as events arrive.
- **Per-campus funnel analytics** — Break down supply/demand by university (Cornell, BU, NYU) to identify which campuses are supply-constrained vs. demand-constrained.
- **Driver supply forecasting** — Use historical `trip_posted` patterns to predict supply for upcoming weekends and surface low-supply alerts to ops.
- **Retention cohorts** — Track whether passengers who had a `seat_declined` event return to request again, and at what rate — the key signal for demand leakage.
- **Route-level conversion funnel** — For each route, show the full funnel: `seat_requested → seat_confirmed → trip_departed → trip_completed → review_submitted`, with drop-off rates at each step.
