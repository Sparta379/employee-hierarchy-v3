import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

try {
  await prisma.$connect()
  console.log("CONNECTED")

  const r = await prisma.$queryRawUnsafe("SELECT 1 as ok")
  console.log("RESULT:", r)
} catch (e) {
  console.error("ERROR:", e)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
