import type {
  Application,
  ApplicationStatus,
  JobListing,
  PipelineResult,
  ProviderInfo,
  SearchCriteria,
  SearchRun,
} from "./types";

const BASE = "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  health: () =>
    request<{ status: string; service: string; timestamp: string }>("/health"),

  providers: () =>
    request<{ providers: ProviderInfo[] }>("/api/search/providers"),

  runSearch: (criteria: SearchCriteria) =>
    request<PipelineResult>("/api/search/run", {
      method: "POST",
      body: JSON.stringify(criteria),
    }),

  searchRuns: () => request<{ runs: SearchRun[] }>("/api/search/runs"),

  jobs: (params?: { minScore?: number; source?: string; remote?: boolean; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.minScore !== undefined) q.set("minScore", String(params.minScore));
    if (params?.source) q.set("source", params.source);
    if (params?.remote !== undefined) q.set("remote", String(params.remote));
    if (params?.limit !== undefined) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request<{ count: number; jobs: JobListing[] }>(`/api/jobs${qs ? `?${qs}` : ""}`);
  },

  applications: () =>
    request<{ count: number; applications: Application[] }>("/api/applications"),

  createApplication: (jobId: string, status: ApplicationStatus = "saved", notes?: string) =>
    request<Application>("/api/applications", {
      method: "POST",
      body: JSON.stringify({ jobId, status, notes }),
    }),

  updateApplication: (id: string, patch: { status?: ApplicationStatus; notes?: string }) =>
    request<Application>(`/api/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
};
