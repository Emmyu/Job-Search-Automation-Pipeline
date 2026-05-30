import type { JobListing, SearchCriteria } from "../types/index.js";

export interface JobProvider {
  readonly id: string;
  readonly name: string;
  isConfigured(): boolean;
  fetchJobs(criteria: SearchCriteria): Promise<Omit<JobListing, "matchScore" | "discoveredAt">[]>;
}
