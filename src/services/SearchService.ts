import { appConfig } from "../config.js";
import { JobPipeline } from "../pipeline/JobPipeline.js";
import type { JobStore } from "../storage/JobStore.js";
import type { PipelineResult, SearchCriteria } from "../types/index.js";

export class SearchService {
  private readonly pipeline: JobPipeline;

  constructor(private readonly store: JobStore) {
    this.pipeline = new JobPipeline(store);
  }

  mergeCriteria(overrides?: Partial<SearchCriteria>): SearchCriteria {
    return {
      ...appConfig.defaultCriteria,
      ...overrides,
      keywords: overrides?.keywords?.length
        ? overrides.keywords
        : appConfig.defaultCriteria.keywords,
    };
  }

  async runSearch(overrides?: Partial<SearchCriteria>): Promise<PipelineResult> {
    const criteria = this.mergeCriteria(overrides);
    return this.pipeline.run(criteria);
  }
}
