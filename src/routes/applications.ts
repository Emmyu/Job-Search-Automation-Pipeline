import { Router } from "express";
import type { JobStore } from "../storage/JobStore.js";
import {
  createApplicationSchema,
  updateApplicationSchema,
} from "../validation/schemas.js";

export function applicationsRouter(store: JobStore): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    const applications = store.getApplications().map((app) => ({
      ...app,
      job: store.getJob(app.jobId),
    }));
    res.json({ count: applications.length, applications });
  });

  router.post("/", (req, res) => {
    const parsed = createApplicationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }

    try {
      const app = store.createApplication(
        parsed.data.jobId,
        parsed.data.status ?? "saved",
        parsed.data.notes
      );
      res.status(201).json({ ...app, job: store.getJob(app.jobId) });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(404).json({ error: message });
    }
  });

  router.patch("/:id", (req, res) => {
    const parsed = updateApplicationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }

    try {
      const app = store.updateApplication(req.params.id, parsed.data);
      res.json({ ...app, job: store.getJob(app.jobId) });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(404).json({ error: message });
    }
  });

  return router;
}
