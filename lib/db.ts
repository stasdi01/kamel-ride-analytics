import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  // On Vercel the app directory is read-only; copy the seeded db to /tmp so
  // writes work. Set DATABASE_URL before constructing PrismaClient so it
  // picks up the correct path without needing a dashboard env var.
  if (process.env.VERCEL) {
    const tmpDb = "/tmp/dev.db";
    if (!fs.existsSync(tmpDb)) {
      const src = path.join(process.cwd(), "prisma", "dev.db");
      if (fs.existsSync(src)) fs.copyFileSync(src, tmpDb);
    }
    process.env.DATABASE_URL = `file:${tmpDb}`;
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
