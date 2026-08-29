import { defineConfig, env } from "prisma/config";

const FALLBACK_DATABASE_URL =
  "postgresql://127.0.0.1:5432/dummy?schema=public";

const isPrismaGenerateCommand = process.argv.some((arg) => arg === "generate");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env.DIRECT_DATABASE_URL ??
      process.env.DATABASE_URL ??
      (isPrismaGenerateCommand ? FALLBACK_DATABASE_URL : env("DATABASE_URL")),
  },
});
