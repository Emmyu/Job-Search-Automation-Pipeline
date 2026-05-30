import { Router } from "express";

export function healthRouter(): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "job-search-automation",
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
