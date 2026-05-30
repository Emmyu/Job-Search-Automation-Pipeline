export type JobSource = "remoteok" | "adzuna" | "mock";

export type ApplicationStatus =
  | "saved"
  | "applied"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export interface JobListing {
  id: string;
  externalId: string;
  source: JobSource;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  remote: boolean;
  postedAt?: string;
  tags: string[];
  matchScore: number;
  discoveredAt: string;
}

export interface SearchCriteria {
  keywords: string[];
  location?: string;
  remoteOnly?: boolean;
  minMatchScore?: number;
}

export interface SearchRun {
  id: string;
  startedAt: string;
  completedAt?: string;
  criteria: SearchCriteria;
  providersUsed: JobSource[];
  totalFetched: number;
  totalAfterFilter: number;
  newJobs: number;
  status: "running" | "completed" | "failed";
  error?: string;
}

export interface Application {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  notes?: string;
  appliedAt?: string;
  updatedAt: string;
  job?: JobListing;
}

export interface ProviderInfo {
  id: string;
  name: string;
  enabled: boolean;
  configured: boolean;
}

export interface PipelineResult {
  run: SearchRun;
  jobs: JobListing[];
}

export type Tab = "search" | "jobs" | "applications" | "history";
