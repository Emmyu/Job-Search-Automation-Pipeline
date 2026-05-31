import { appConfig } from "./config.js";
import cors from "cors";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import path from "node:path";
import { applicationsRouter } from "./routes/applications.js";
import { healthRouter } from "./routes/health.js";
import { jobsRouter } from "./routes/jobs.js";
import { searchRouter } from "./routes/search.js";
import { SearchService } from "./services/SearchService.js";
import { JobStore } from "./storage/JobStore.js";

const publicDir = path.join(process.cwd(), "public");

export function createApp(): Express {
  const app = express();
  const store = new JobStore();
  const searchService = new SearchService(store);

  app.use(cors());
  app.use(express.json());

  app.use(healthRouter());
  app.get("/favicon.ico", (_req, res) => res.status(204).end());
  app.get("/favicon.png", (_req, res) => res.status(204).end());
  app.use("/api/search", searchRouter(store, searchService));
  app.use("/api/jobs", jobsRouter(store));
  app.use("/api/applications", applicationsRouter(store));

  // Static UI is served by Netlify/Vercel CDN; only attach locally
  if (!appConfig.isServerless) {
    app.use(express.static(publicDir));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path === "/health") {
        return next();
      }
      res.sendFile(path.join(publicDir, "index.html"), (err) => {
        if (err) next();
      });
    });
  }

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
