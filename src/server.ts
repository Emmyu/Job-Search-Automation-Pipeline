import cors from "cors";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { appConfig } from "./config.js";
import { applicationsRouter } from "./routes/applications.js";
import { healthRouter } from "./routes/health.js";
import { jobsRouter } from "./routes/jobs.js";
import { searchRouter } from "./routes/search.js";
import { SearchService } from "./services/SearchService.js";
import { JobStore } from "./storage/JobStore.js";

export function createApp(): Express {
  const app = express();
  const store = new JobStore();
  const searchService = new SearchService(store);

  app.use(cors());
  app.use(express.json());

  app.use(healthRouter());
  app.use("/api/search", searchRouter(store, searchService));
  app.use("/api/jobs", jobsRouter(store));
  app.use("/api/applications", applicationsRouter(store));

  app.get("/", (_req, res) => {
    res.json({
      name: "Job Search Automation API",
      version: "1.0.0",
      endpoints: {
        health: "GET /health",
        runSearch: "POST /api/search/run",
        providers: "GET /api/search/providers",
        searchRuns: "GET /api/search/runs",
        jobs: "GET /api/jobs",
        job: "GET /api/jobs/:id",
        applications: "GET|POST /api/applications",
        updateApplication: "PATCH /api/applications/:id",
      },
    });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error(err);
    res.status(500).json({ error: message });
  });

  return app;
}

export function startServer(): void {
  const app = createApp();
  app.listen(appConfig.port, () => {
    console.log(`Job Search Automation API listening on http://localhost:${appConfig.port}`);
  });
}
