import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROUTES = [
  "Boston → New York",
  "Boston → New York",
  "Boston → New York",
  "Boston → New York",
  "Boston → New York",
  "New York → Boston",
  "New York → Boston",
  "Boston → Philadelphia",
  "Boston → Philadelphia",
  "New York → Philadelphia",
  "Boston → Providence",
];

function pickRoute(preferReturn = false): string {
  if (preferReturn) {
    const returnRoutes = ["New York → Boston", "New York → Boston", "New York → Boston", "Boston → New York"];
    return returnRoutes[Math.floor(Math.random() * returnRoutes.length)];
  }
  return ROUTES[Math.floor(Math.random() * ROUTES.length)];
}

function dateAt(dayOffset: number, hour: number, minute = 0): Date {
  const base = new Date("2026-04-20T00:00:00Z"); // Monday
  base.setUTCDate(base.getUTCDate() + dayOffset);
  base.setUTCHours(hour, minute, 0, 0);
  return base;
}

function jitter(date: Date, maxMinutes = 45): Date {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + Math.floor(Math.random() * maxMinutes));
  return d;
}

interface EventSpec {
  name: string;
  category: string;
  route?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

const events: EventSpec[] = [];

// ── Monday (day 0): Quiet. A few drivers post early, low seat requests ──────
for (let i = 0; i < 4; i++) {
  events.push({ name: "trip_posted", category: "trips", route: pickRoute(), timestamp: jitter(dateAt(0, 8 + i * 2)), metadata: { seats_available: 3 } });
}
for (let i = 0; i < 3; i++) {
  events.push({ name: "seat_requested", category: "trips", route: pickRoute(), timestamp: jitter(dateAt(0, 10 + i * 2)) });
}
for (let i = 0; i < 2; i++) {
  events.push({ name: "seat_confirmed", category: "trips", route: pickRoute(), timestamp: jitter(dateAt(0, 12 + i * 2)) });
}
events.push({ name: "payment_processed", category: "payments", route: pickRoute(), timestamp: jitter(dateAt(0, 13)) });
events.push({ name: "payment_processed", category: "payments", route: pickRoute(), timestamp: jitter(dateAt(0, 15)) });
events.push({ name: "user_signed_up", category: "users", timestamp: jitter(dateAt(0, 9)) });

// ── Tuesday (day 1): Still quiet, a few more trips ──────────────────────────
for (let i = 0; i < 5; i++) {
  events.push({ name: "trip_posted", category: "trips", route: pickRoute(), timestamp: jitter(dateAt(1, 7 + i * 2)), metadata: { seats_available: 2 + (i % 2) } });
}
for (let i = 0; i < 4; i++) {
  events.push({ name: "seat_requested", category: "trips", route: pickRoute(), timestamp: jitter(dateAt(1, 9 + i * 2)) });
}
for (let i = 0; i < 3; i++) {
  events.push({ name: "seat_confirmed", category: "trips", route: pickRoute(), timestamp: jitter(dateAt(1, 11 + i * 2)) });
}
for (let i = 0; i < 3; i++) {
  events.push({ name: "payment_processed", category: "payments", route: pickRoute(), timestamp: jitter(dateAt(1, 12 + i)) });
}
events.push({ name: "user_signed_up", category: "users", timestamp: jitter(dateAt(1, 10)) });

// ── Wednesday (day 2): Activity builds ──────────────────────────────────────
for (let i = 0; i < 8; i++) {
  events.push({ name: "trip_posted", category: "trips", route: pickRoute(), timestamp: jitter(dateAt(2, 7 + Math.floor(i * 1.5))), metadata: { seats_available: 3 } });
}
for (let i = 0; i < 10; i++) {
  events.push({ name: "seat_requested", category: "trips", route: pickRoute(), timestamp: jitter(dateAt(2, 9 + Math.floor(i * 1.2))) });
}
for (let i = 0; i < 7; i++) {
  events.push({ name: "seat_confirmed", category: "trips", route: pickRoute(), timestamp: jitter(dateAt(2, 10 + i)) });
}
for (let i = 0; i < 5; i++) {
  events.push({ name: "payment_processed", category: "payments", route: pickRoute(), timestamp: jitter(dateAt(2, 11 + i)) });
}
events.push({ name: "payment_failed", category: "payments", route: pickRoute(), timestamp: jitter(dateAt(2, 14)) });
events.push({ name: "review_submitted", category: "engagement", route: pickRoute(), timestamp: jitter(dateAt(2, 16)) });
events.push({ name: "user_signed_up", category: "users", timestamp: jitter(dateAt(2, 9)) });
events.push({ name: "user_signed_up", category: "users", timestamp: jitter(dateAt(2, 11)) });

// ── Thursday (day 3): Peak supply day ───────────────────────────────────────
for (let i = 0; i < 18; i++) {
  events.push({ name: "trip_posted", category: "trips", route: pickRoute(), timestamp: jitter(dateAt(3, 6 + Math.floor(i * 0.8))), metadata: { seats_available: 3 + (i % 2) } });
}
for (let i = 0; i < 22; i++) {
  events.push({ name: "seat_requested", category: "trips", route: pickRoute(), timestamp: jitter(dateAt(3, 8 + Math.floor(i * 0.7))) });
}
for (let i = 0; i < 16; i++) {
  events.push({ name: "seat_confirmed", category: "trips", route: pickRoute(), timestamp: jitter(dateAt(3, 9 + Math.floor(i * 0.8))) });
}
// First payment_failed → payment_processed retry sequences
for (let i = 0; i < 2; i++) {
  const failTime = jitter(dateAt(3, 10 + i * 3));
  events.push({ name: "payment_failed", category: "payments", route: pickRoute(), timestamp: failTime });
  const retryTime = new Date(failTime);
  retryTime.setMinutes(retryTime.getMinutes() + 8);
  events.push({ name: "payment_processed", category: "payments", route: pickRoute(), timestamp: retryTime });
}
for (let i = 0; i < 10; i++) {
  events.push({ name: "payment_processed", category: "payments", route: pickRoute(), timestamp: jitter(dateAt(3, 10 + i)) });
}
for (let i = 0; i < 4; i++) {
  events.push({ name: "review_submitted", category: "engagement", route: pickRoute(), timestamp: jitter(dateAt(3, 14 + i)) });
}

// ── Friday (day 4): Peak demand day ─────────────────────────────────────────
for (let i = 0; i < 14; i++) {
  events.push({ name: "trip_posted", category: "trips", route: pickRoute(), timestamp: jitter(dateAt(4, 6 + Math.floor(i * 1.1))), metadata: { seats_available: 3 } });
}
// seat_requested peaks — heavy afternoon volume
for (let i = 0; i < 30; i++) {
  const hour = i < 8 ? 8 + Math.floor(i * 0.5) : 12 + Math.floor((i - 8) * 0.4);
  events.push({ name: "seat_requested", category: "trips", route: pickRoute(), timestamp: jitter(dateAt(4, Math.min(hour, 20))) });
}
for (let i = 0; i < 20; i++) {
  events.push({ name: "seat_confirmed", category: "trips", route: pickRoute(), timestamp: jitter(dateAt(4, 9 + Math.floor(i * 0.6))) });
}
// Last-minute seat_declined as trips fill
for (let i = 0; i < 5; i++) {
  events.push({ name: "seat_declined", category: "trips", route: pickRoute(), timestamp: jitter(dateAt(4, 14 + i)) });
}
// Some trip_cancelled
for (let i = 0; i < 2; i++) {
  events.push({ name: "trip_cancelled", category: "trips", route: pickRoute(), timestamp: jitter(dateAt(4, 11 + i * 2)) });
}
// Most trip_departed events
for (let i = 0; i < 8; i++) {
  events.push({ name: "trip_departed", category: "trips", route: pickRoute(), timestamp: jitter(dateAt(4, 15 + Math.floor(i * 0.5))) });
}
for (let i = 0; i < 2; i++) {
  events.push({ name: "payment_failed", category: "payments", route: pickRoute(), timestamp: jitter(dateAt(4, 10 + i * 2)) });
}
for (let i = 0; i < 14; i++) {
  events.push({ name: "payment_processed", category: "payments", route: pickRoute(), timestamp: jitter(dateAt(4, 9 + i)) });
}
for (let i = 0; i < 2; i++) {
  events.push({ name: "promo_applied", category: "payments", route: pickRoute(), timestamp: jitter(dateAt(4, 10 + i)) });
}
for (let i = 0; i < 4; i++) {
  events.push({ name: "review_submitted", category: "engagement", route: pickRoute(), timestamp: jitter(dateAt(4, 18 + i)) });
}
events.push({ name: "user_signed_up", category: "users", timestamp: jitter(dateAt(4, 8)) });
events.push({ name: "user_signed_up", category: "users", timestamp: jitter(dateAt(4, 10)) });

// ── Saturday (day 5): Quiet. Return trips NYC → Boston ──────────────────────
for (let i = 0; i < 6; i++) {
  events.push({ name: "trip_posted", category: "trips", route: pickRoute(true), timestamp: jitter(dateAt(5, 9 + i * 2)), metadata: { seats_available: 3 } });
}
for (let i = 0; i < 8; i++) {
  events.push({ name: "seat_requested", category: "trips", route: pickRoute(true), timestamp: jitter(dateAt(5, 10 + i)) });
}
for (let i = 0; i < 5; i++) {
  events.push({ name: "seat_confirmed", category: "trips", route: pickRoute(true), timestamp: jitter(dateAt(5, 12 + i)) });
}
for (let i = 0; i < 5; i++) {
  events.push({ name: "payment_processed", category: "payments", route: pickRoute(true), timestamp: jitter(dateAt(5, 13 + i)) });
}
events.push({ name: "review_submitted", category: "engagement", route: pickRoute(), timestamp: jitter(dateAt(5, 16)) });
events.push({ name: "trip_completed", category: "trips", route: pickRoute(), timestamp: jitter(dateAt(5, 18)) });
events.push({ name: "user_signed_up", category: "users", timestamp: jitter(dateAt(5, 11)) });

// ── Sunday (day 6): Return rush — demand spike, supply gap ──────────────────
// Intentional imbalance: only 8 trips posted but 28 seat requests (5–9pm spike)
for (let i = 0; i < 8; i++) {
  events.push({ name: "trip_posted", category: "trips", route: pickRoute(true), timestamp: jitter(dateAt(6, 10 + i)), metadata: { seats_available: 3 } });
}
// seat_requested spikes 5–9pm (17–21h UTC)
for (let i = 0; i < 28; i++) {
  const hour = i < 8 ? 12 + Math.floor(i * 0.5) : 17 + Math.floor((i - 8) * 0.25);
  events.push({ name: "seat_requested", category: "trips", route: pickRoute(true), timestamp: jitter(dateAt(6, Math.min(hour, 21))) });
}
for (let i = 0; i < 18; i++) {
  events.push({ name: "seat_confirmed", category: "trips", route: pickRoute(true), timestamp: jitter(dateAt(6, 13 + Math.floor(i * 0.4))) });
}
for (let i = 0; i < 2; i++) {
  events.push({ name: "payment_failed", category: "payments", route: pickRoute(), timestamp: jitter(dateAt(6, 14 + i)) });
}
for (let i = 0; i < 12; i++) {
  events.push({ name: "payment_processed", category: "payments", route: pickRoute(true), timestamp: jitter(dateAt(6, 13 + i)) });
}
// trip_completed and review_submitted close out the week
for (let i = 0; i < 4; i++) {
  events.push({ name: "trip_completed", category: "trips", route: pickRoute(true), timestamp: jitter(dateAt(6, 19 + i)) });
}
for (let i = 0; i < 3; i++) {
  events.push({ name: "review_submitted", category: "engagement", route: pickRoute(true), timestamp: jitter(dateAt(6, 20 + i)) });
}
events.push({ name: "promo_applied", category: "payments", route: pickRoute(true), timestamp: jitter(dateAt(6, 15)) });
events.push({ name: "user_signed_up", category: "users", timestamp: jitter(dateAt(6, 12)) });

async function main() {
  await prisma.event.deleteMany();
  await prisma.event.createMany({
    data: events.map((e) => ({
      name: e.name,
      category: e.category,
      route: e.route ?? null,
      metadata: e.metadata ? JSON.stringify(e.metadata) : null,
      timestamp: e.timestamp,
    })),
  });
  console.log(`Seeded ${events.length} events.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
