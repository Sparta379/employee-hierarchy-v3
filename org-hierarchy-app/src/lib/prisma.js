// src/lib/prisma.js
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? (typeof window === 'undefined' ? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
}) : null);

if (process.env.NODE_ENV !== "production" && typeof window === 'undefined') globalForPrisma.prisma = prisma;

export { prisma };

