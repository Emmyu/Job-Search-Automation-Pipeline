import type { JobListing, SearchCriteria } from "../types/index.js";

export function dedupeJobs(jobs: JobListing[]): JobListing[] {
  const seen = new Map<string, JobListing>();

  for (const job of jobs) {
    const key = `${job.company.toLowerCase()}::${job.title.toLowerCase()}`;
    const existing = seen.get(key);
    if (!existing || job.matchScore > existing.matchScore) {
      seen.set(key, job);
    }
  }

  return [...seen.values()];
}

export function filterByCriteria(jobs: JobListing[], criteria: SearchCriteria): JobListing[] {
  return jobs.filter((job) => {
    if (criteria.remoteOnly && !job.remote) return false;
    if (criteria.excludeCompanies?.some((c) => job.company.toLowerCase() === c.toLowerCase())) {
      return false;
    }
    if (criteria.titleMustInclude?.length) {
      const title = job.title.toLowerCase();
      if (!criteria.titleMustInclude.every((t) => title.includes(t.toLowerCase()))) {
        return false;
      }
    }
    return job.matchScore >= (criteria.minMatchScore ?? 0);
  });
}
