import fs from "node:fs";
import path from "node:path";
import type {
  Application,
  ApplicationStatus,
  JobListing,
  SearchRun,
} from "../types/index.js";
import { appConfig } from "../config.js";

interface StoreData {
  jobs: Record<string, JobListing>;
  applications: Record<string, Application>;
  searchRuns: SearchRun[];
}

export class JobStore {
  private data: StoreData;
  private readonly filePath: string;

  constructor(dataDir = appConfig.dataDir) {
    fs.mkdirSync(dataDir, { recursive: true });
    this.filePath = path.join(dataDir, "store.json");
    this.data = this.load();
  }

  private load(): StoreData {
    if (!fs.existsSync(this.filePath)) {
      return { jobs: {}, applications: {}, searchRuns: [] };
    }
    try {
      const raw = JSON.parse(fs.readFileSync(this.filePath, "utf-8")) as StoreData;
      return {
        jobs: raw.jobs ?? {},
        applications: raw.applications ?? {},
        searchRuns: raw.searchRuns ?? [],
      };
    } catch {
      return { jobs: {}, applications: {}, searchRuns: [] };
    }
  }

  private persist(): void {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf-8");
  }

  getAllJobs(): JobListing[] {
    return Object.values(this.data.jobs).sort(
      (a, b) => b.matchScore - a.matchScore || b.discoveredAt.localeCompare(a.discoveredAt)
    );
  }

  getJob(id: string): JobListing | undefined {
    return this.data.jobs[id];
  }

  private findExisting(job: JobListing): JobListing | undefined {
    const byId = this.data.jobs[job.id];
    if (byId) return byId;
    return Object.values(this.data.jobs).find(
      (j) => j.source === job.source && j.externalId === job.externalId
    );
  }

  async mergeJobs(incoming: JobListing[]): Promise<{ newJobs: number; allJobs: JobListing[] }> {
    let newJobs = 0;
    for (const job of incoming) {
      const existing = this.findExisting(job);
      if (!existing) {
        newJobs++;
        this.data.jobs[job.id] = job;
      } else if (job.matchScore > existing.matchScore) {
        delete this.data.jobs[existing.id];
        this.data.jobs[job.id] = { ...existing, ...job, discoveredAt: existing.discoveredAt };
      }
    }
    this.persist();
    return { newJobs, allJobs: this.getAllJobs() };
  }

  listJobs(options?: {
    minScore?: number;
    source?: string;
    remote?: boolean;
    limit?: number;
  }): JobListing[] {
    let jobs = this.getAllJobs();
    if (options?.minScore !== undefined) {
      jobs = jobs.filter((j) => j.matchScore >= options.minScore!);
    }
    if (options?.source) {
      jobs = jobs.filter((j) => j.source === options.source);
    }
    if (options?.remote !== undefined) {
      jobs = jobs.filter((j) => j.remote === options.remote);
    }
    const limit = options?.limit ?? 50;
    return jobs.slice(0, limit);
  }

  async saveSearchRun(run: SearchRun): Promise<void> {
    const idx = this.data.searchRuns.findIndex((r) => r.id === run.id);
    if (idx >= 0) this.data.searchRuns[idx] = run;
    else this.data.searchRuns.unshift(run);
    this.data.searchRuns = this.data.searchRuns.slice(0, 50);
    this.persist();
  }

  getSearchRuns(limit = 20): SearchRun[] {
    return this.data.searchRuns.slice(0, limit);
  }

  getApplications(): Application[] {
    return Object.values(this.data.applications).sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    );
  }

  getApplication(id: string): Application | undefined {
    return this.data.applications[id];
  }

  createApplication(jobId: string, status: ApplicationStatus = "saved", notes?: string): Application {
    const job = this.data.jobs[jobId];
    if (!job) throw new Error(`Job not found: ${jobId}`);

    const now = new Date().toISOString();
    const app: Application = {
      id: `app-${jobId}`,
      jobId,
      status,
      notes,
      appliedAt: status === "applied" ? now : undefined,
      updatedAt: now,
    };
    this.data.applications[app.id] = app;
    this.persist();
    return app;
  }

  updateApplication(
    id: string,
    patch: Partial<Pick<Application, "status" | "notes">>
  ): Application {
    const app = this.data.applications[id];
    if (!app) throw new Error(`Application not found: ${id}`);

    const updated: Application = {
      ...app,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    if (patch.status === "applied" && !updated.appliedAt) {
      updated.appliedAt = updated.updatedAt;
    }
    this.data.applications[id] = updated;
    this.persist();
    return updated;
  }
}
