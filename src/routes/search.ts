import { Router } from "express";
import { listProviders } from "../providers/index.js";
import type { SearchService } from "../services/SearchService.js";
import type { JobStore } from "../storage/JobStore.js";
import { searchCriteriaSchema } from "../validation/schemas.js";

export function searchRouter(store: JobStore, searchService: SearchService): Router {
  const router = Router();

  router.get("/providers", (_req, res) => {
    res.json({ providers: listProviders() });
  });

  router.get("/runs", (_req, res) => {
    res.json({ runs: store.getSearchRuns() });
  });

  router.post("/run", async (req, res, next) => {
    try {
      const parsed = searchCriteriaSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid criteria", details: parsed.error.flatten() });
        return;
      }

      const body = parsed.data;
      const criteria = {
        ...body,
        keywords: body.keywords,
      };

      const result = await searchService.runSearch(criteria);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
