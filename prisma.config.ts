import { defineConfig, env } from "prisma/config";

const FALLBACK_DATABASE_URL =
  "postgresql://127.0.0.1:5432/dummy?schema=public";

const shouldUseFallbackDatasource =
  process.env.PRISMA_GENERATE_WITH_FALLBACK === "1";
const datasourceUrl =
  process.env.DIRECT_DATABASE_URL ??
  (shouldUseFallbackDatasource
    ? process.env.DATABASE_URL ?? FALLBACK_DATABASE_URL
    : env("DATABASE_URL"));

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: datasourceUrl,
  },
});
