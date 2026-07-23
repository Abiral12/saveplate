import { config } from "dotenv";
import { defineConfig } from "prisma/config";

const result = config({
  path: ".env",
  override: true,
});

if (result.error) {
  throw result.error;
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is missing or empty in the root .env file."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: databaseUrl,
  },
});