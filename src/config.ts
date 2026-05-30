import { config as loadEnv } from "dotenv";
import path from "node:path";
import type { SearchCriteria } from "./types/index.js";

loadEnv();

function parseList(value: string | undefined, fallback: string[]): string[] {
  if (!value?.trim()) return fallback;
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === "") return fallback;
  return value.toLowerCase() === "true" || value === "1";
}

export const appConfig = {
  port: Number(process.env.PORT ?? 3000),
  dataDir: path.resolve(process.env.DATA_DIR ?? "./data"),
  providers: parseList(process.env.JOB_PROVIDERS, ["mock"]) as Array<
    "remoteok" | "adzuna" | "mock"
  >,
  adzuna: {
    appId: process.env.ADZUNA_APP_ID ?? "",
    appKey: process.env.ADZUNA_APP_KEY ?? "",
    country: process.env.ADZUNA_COUNTRY ?? "us",
  },
  searchCron: process.env.SEARCH_CRON?.trim() || undefined,
  defaultCriteria: {
    keywords: parseList(process.env.DEFAULT_KEYWORDS, [
      "typescript",
      "node",
    ]),
    location: process.env.DEFAULT_LOCATION || undefined,
    remoteOnly: parseBool(process.env.DEFAULT_REMOTE_ONLY, false),
    minMatchScore: Number(process.env.MIN_MATCH_SCORE ?? 40),
  } satisfies SearchCriteria,
};
