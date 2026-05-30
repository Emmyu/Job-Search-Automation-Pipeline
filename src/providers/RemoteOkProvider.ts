import type { JobListing, SearchCriteria } from "../types/index.js";
import type { JobProvider } from "./JobProvider.js";

interface RemoteOkRaw {
  id?: string;
  position?: string;
  company?: string;
  location?: string;
  description?: string;
  url?: string;
  tags?: string[];
  date?: string;
  salary_min?: number;
  salary_max?: number;
}

export class RemoteOkProvider implements JobProvider {
  readonly id = "remoteok";
  readonly name = "RemoteOK";

  isConfigured(): boolean {
    return true;
  }

  async fetchJobs(
    criteria: SearchCriteria
  ): Promise<Omit<JobListing, "matchScore" | "discoveredAt">[]> {
    const query = criteria.keywords.join(" ").trim() || "developer";
    const url = `https://remoteok.com/api?tags=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: { "User-Agent": "job-search-automation/1.0" },
    });

    if (!response.ok) {
      throw new Error(`RemoteOK API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as RemoteOkRaw[];
    const listings = Array.isArray(data) ? data.slice(1) : [];

    return listings
      .filter((item) => item.position && item.company)
      .map((item) => {
        const tags = (item.tags ?? []).map(String);
        const salary =
          item.salary_min || item.salary_max
            ? `$${item.salary_min ?? "?"} - $${item.salary_max ?? "?"}`
            : undefined;

        return {
          id: `remoteok-${item.id ?? item.url}`,
          externalId: String(item.id ?? item.url ?? ""),
          source: "remoteok" as const,
          title: item.position!,
          company: item.company!,
          location: item.location ?? "Remote",
          description: (item.description ?? "").slice(0, 2000),
          url: item.url?.startsWith("http")
            ? item.url
            : `https://remoteok.com/remote-jobs/${item.id}`,
          salary,
          remote: true,
          postedAt: item.date,
          tags,
        };
      });
  }
}
