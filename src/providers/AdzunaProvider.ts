import type { JobListing, SearchCriteria } from "../types/index.js";
import type { JobProvider } from "./JobProvider.js";
import { appConfig } from "../config.js";

interface AdzunaResult {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  created: string;
  salary_min?: number;
  salary_max?: number;
}

interface AdzunaResponse {
  results: AdzunaResult[];
}

export class AdzunaProvider implements JobProvider {
  readonly id = "adzuna";
  readonly name = "Adzuna";

  isConfigured(): boolean {
    return Boolean(appConfig.adzuna.appId && appConfig.adzuna.appKey);
  }

  async fetchJobs(
    criteria: SearchCriteria
  ): Promise<Omit<JobListing, "matchScore" | "discoveredAt">[]> {
    if (!this.isConfigured()) {
      throw new Error("Adzuna requires ADZUNA_APP_ID and ADZUNA_APP_KEY");
    }

    const what = criteria.keywords.join(" ") || "developer";
    const where = criteria.location ?? "";
    const country = appConfig.adzuna.country;
    const params = new URLSearchParams({
      app_id: appConfig.adzuna.appId,
      app_key: appConfig.adzuna.appKey,
      what,
      results_per_page: "50",
    });
    if (where) params.set("where", where);

    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as AdzunaResponse;

    return (data.results ?? []).map((item) => {
      const loc = item.location.display_name.toLowerCase();
      const remote =
        loc.includes("remote") ||
        item.title.toLowerCase().includes("remote") ||
        criteria.remoteOnly === true;

      const salary =
        item.salary_min || item.salary_max
          ? `${item.salary_min ?? "?"} - ${item.salary_max ?? "?"}`
          : undefined;

      return {
        id: `adzuna-${item.id}`,
        externalId: item.id,
        source: "adzuna" as const,
        title: item.title,
        company: item.company.display_name,
        location: item.location.display_name,
        description: item.description.slice(0, 2000),
        url: item.redirect_url,
        salary,
        remote,
        postedAt: item.created,
        tags: criteria.keywords,
      };
    });
  }
}
