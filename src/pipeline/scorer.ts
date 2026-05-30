import type { JobListing, SearchCriteria } from "../types/index.js";

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s+#.]/g, " ");
}

export function scoreJob(
  job: Omit<JobListing, "matchScore" | "discoveredAt">,
  criteria: SearchCriteria
): number {
  const haystack = normalize(
    `${job.title} ${job.company} ${job.description} ${job.tags.join(" ")}`
  );
  let score = 0;

  for (const keyword of criteria.keywords) {
    const kw = normalize(keyword);
    if (!kw) continue;
    if (job.title.toLowerCase().includes(kw)) score += 25;
    else if (haystack.includes(kw)) score += 12;
  }

  if (criteria.titleMustInclude?.length) {
    const title = job.title.toLowerCase();
    const allMatch = criteria.titleMustInclude.every((t) =>
      title.includes(t.toLowerCase())
    );
    if (!allMatch) return 0;
    score += 15;
  }

  if (criteria.remoteOnly && job.remote) score += 10;
  if (job.remote) score += 5;

  if (criteria.location) {
    const loc = criteria.location.toLowerCase();
    if (job.location.toLowerCase().includes(loc)) score += 10;
  }

  if (criteria.excludeCompanies?.some((c) => job.company.toLowerCase() === c.toLowerCase())) {
    return 0;
  }

  return Math.min(100, score);
}

export function applyMatchScores<T extends Omit<JobListing, "matchScore" | "discoveredAt">>(
  jobs: T[],
  criteria: SearchCriteria,
  discoveredAt: string
): JobListing[] {
  return jobs
    .map((job) => ({
      ...job,
      matchScore: scoreJob(job, criteria),
      discoveredAt,
    }))
    .filter((job) => job.matchScore >= (criteria.minMatchScore ?? 0))
    .sort((a, b) => b.matchScore - a.matchScore);
}
