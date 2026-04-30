import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateEventSchema, GetEventsSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = CreateEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        name: parsed.data.name,
        category: parsed.data.category,
        route: parsed.data.route ?? null,
        metadata: parsed.data.metadata ? JSON.stringify(parsed.data.metadata) : null,
        ...(parsed.data.timestamp && { timestamp: new Date(parsed.data.timestamp) }),
      },
    });

    return NextResponse.json(
      { ...event, metadata: event.metadata ? JSON.parse(event.metadata) : null },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = {
      category: searchParams.get("category") ?? undefined,
      route: searchParams.get("route") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    };

    const parsed = GetEventsSchema.safeParse(query);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query params", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { category, route, from, to, limit } = parsed.data;

    const where = {
      ...(category && { category }),
      ...(route && { route }),
      ...(from || to
        ? {
            timestamp: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    };

    const [rawEvents, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    const events = rawEvents.map((e) => ({
      ...e,
      metadata: e.metadata ? JSON.parse(e.metadata) : null,
    }));

    return NextResponse.json({ events, total });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
