import cron from "node-cron";
import { appConfig } from "./config.js";
import { startServer } from "./server.js";
import { SearchService } from "./services/SearchService.js";
import { JobStore } from "./storage/JobStore.js";

/** Local / long-running server only — Vercel uses api/index.ts */
if (!process.env.VERCEL) {
  startServer();
}

if (appConfig.searchCron && cron.validate(appConfig.searchCron)) {
  const store = new JobStore();
  const searchService = new SearchService(store);

  cron.schedule(appConfig.searchCron, async () => {
    console.log(`[cron] Running scheduled job search at ${new Date().toISOString()}`);
    try {
      const result = await searchService.runSearch();
      console.log(
        `[cron] Done: fetched=${result.run.totalFetched}, new=${result.run.newJobs}`
      );
    } catch (err) {
      console.error("[cron] Search failed:", err);
    }
  });

  console.log(`Scheduled search enabled: ${appConfig.searchCron}`);
}
