import type { JobListing, SearchCriteria } from "../types/index.js";
import type { JobProvider } from "./JobProvider.js";

const SAMPLE_JOBS = [
  {
    title: "Senior TypeScript Engineer",
    company: "Acme Labs",
    location: "Remote",
    description:
      "Build scalable Node.js APIs and microservices. TypeScript, Express, PostgreSQL.",
    remote: true,
    tags: ["typescript", "node", "api"],
  },
  {
    title: "Backend Developer (Node.js)",
    company: "Streamline Inc",
    location: "New York, NY",
    description: "REST APIs, event-driven architecture, AWS.",
    remote: false,
    tags: ["node", "rest", "aws"],
  },
  {
    title: "Full Stack Engineer",
    company: "Nova Systems",
    location: "Remote - US",
    description: "React, TypeScript, Node.js. CI/CD and observability.",
    remote: true,
    tags: ["typescript", "react", "node"],
  },
  {
    title: "Data Analyst",
    company: "Metrics Co",
    location: "Chicago, IL",
    description: "SQL, dashboards, Python. Not engineering-heavy.",
    remote: false,
    tags: ["sql", "python"],
  },
];

export class MockProvider implements JobProvider {
  readonly id = "mock";
  readonly name = "Mock (demo)";

  isConfigured(): boolean {
    return true;
  }

  async fetchJobs(
    criteria: SearchCriteria
  ): Promise<Omit<JobListing, "matchScore" | "discoveredAt">[]> {
    const keyword = criteria.keywords[0]?.toLowerCase() ?? "";
    const filtered = SAMPLE_JOBS.filter((job) => {
      const haystack = `${job.title} ${job.description} ${job.tags.join(" ")}`.toLowerCase();
      if (keyword && !haystack.includes(keyword)) return false;
      if (criteria.remoteOnly && !job.remote) return false;
      if (criteria.location) {
        const loc = criteria.location.toLowerCase();
        if (!job.location.toLowerCase().includes(loc) && !job.remote) return false;
      }
      return true;
    });

    return filtered.map((job, i) => {
      const externalId = `mock-${job.company}-${job.title}`.replace(/\s+/g, "-").toLowerCase();
      return {
      id: externalId,
      externalId,
      source: "mock" as const,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      url: `https://example.com/jobs/${i}`,
      remote: job.remote,
      tags: job.tags,
      postedAt: new Date().toISOString(),
    };
    });
  }
}
