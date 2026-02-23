import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasources: {
    db: {
      url: env("DIRECT_URL"),
    },
  },
});
