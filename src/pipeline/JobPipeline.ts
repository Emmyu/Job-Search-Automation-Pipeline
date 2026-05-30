import { randomUUID } from "node:crypto";
import { getEnabledProviders } from "../providers/index.js";
import type { JobListing, PipelineResult, SearchCriteria, SearchRun } from "../types/index.js";
import { applyMatchScores } from "./scorer.js";
import { dedupeJobs } from "./filters.js";
import type { JobStore } from "../storage/JobStore.js";

export class JobPipeline {
  constructor(private readonly store: JobStore) {}

  async run(criteria: SearchCriteria): Promise<PipelineResult> {
    const providers = getEnabledProviders();
    const run: SearchRun = {
      id: randomUUID(),
      startedAt: new Date().toISOString(),
      criteria,
      providersUsed: providers.map((p) => p.id as SearchRun["providersUsed"][number]),
      totalFetched: 0,
      totalAfterFilter: 0,
      newJobs: 0,
      status: "running",
    };

    await this.store.saveSearchRun(run);

    try {
      const discoveredAt = new Date().toISOString();
      const rawBatches = await Promise.allSettled(
        providers.map((p) => p.fetchJobs(criteria))
      );

      const fetched: Omit<JobListing, "matchScore" | "discoveredAt">[] = [];
      for (const batch of rawBatches) {
        if (batch.status === "fulfilled") {
          fetched.push(...batch.value);
        }
      }

      run.totalFetched = fetched.length;

      const scored = applyMatchScores(fetched, criteria, discoveredAt);
      const unique = dedupeJobs(scored);
      run.totalAfterFilter = unique.length;

      const { newJobs, allJobs } = await this.store.mergeJobs(unique);
      run.newJobs = newJobs;
      run.status = "completed";
      run.completedAt = new Date().toISOString();

      await this.store.saveSearchRun(run);

      return { run, jobs: allJobs.slice(0, 100) };
    } catch (err) {
      run.status = "failed";
      run.error = err instanceof Error ? err.message : String(err);
      run.completedAt = new Date().toISOString();
      await this.store.saveSearchRun(run);
      throw err;
    }
  }

  rescoreExisting(criteria: SearchCriteria): JobListing[] {
    const jobs = this.store.getAllJobs();
    const discoveredAt = new Date().toISOString();
    return applyMatchScores(
      jobs.map(({ matchScore: _m, discoveredAt: _d, ...rest }) => rest),
      criteria,
      discoveredAt
    );
  }
}
