import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Ensure Prisma config runs with environment variables from .env when spawned by the CLI
loadEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
