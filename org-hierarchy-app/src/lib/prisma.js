// src/lib/prisma.js
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Build PrismaClient options per Prisma v7 requirements. Provide an `adapter` using
// `DATABASE_URL` at runtime so the client can connect in server environments.
const prismaOptions = {};
if (process.env.DATABASE_URL) {
  prismaOptions.adapter = { url: process.env.DATABASE_URL };
}
prismaOptions.log = process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'];

const prisma = globalForPrisma.prisma ?? (typeof window === 'undefined' ? new PrismaClient(prismaOptions) : null);

if (process.env.NODE_ENV !== "production" && typeof window === 'undefined') globalForPrisma.prisma = prisma;

export { prisma };

