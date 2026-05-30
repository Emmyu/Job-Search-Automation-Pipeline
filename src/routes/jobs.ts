import { Router } from "express";
import type { JobStore } from "../storage/JobStore.js";

export function jobsRouter(store: JobStore): Router {
  const router = Router();

  router.get("/", (req, res) => {
    const minScore = req.query.minScore ? Number(req.query.minScore) : undefined;
    const source = req.query.source as string | undefined;
    const remote =
      req.query.remote === "true" ? true : req.query.remote === "false" ? false : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 50;

    const jobs = store.listJobs({ minScore, source, remote, limit });
    res.json({ count: jobs.length, jobs });
  });

  router.get("/:id", (req, res) => {
    const job = store.getJob(req.params.id);
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    res.json(job);
  });

  return router;
}
