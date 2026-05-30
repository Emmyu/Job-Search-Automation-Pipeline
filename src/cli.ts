/**
 * Run a one-off search from the command line:
 *   npm run search -- --keywords typescript,node --remote
 */
import { SearchService } from "./services/SearchService.js";
import { JobStore } from "./storage/JobStore.js";

function parseArgs(argv: string[]) {
  const opts: {
    keywords?: string[];
    location?: string;
    remoteOnly?: boolean;
    minMatchScore?: number;
  } = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--keywords" && argv[i + 1]) {
      opts.keywords = argv[++i].split(",").map((s) => s.trim());
    } else if (arg === "--location" && argv[i + 1]) {
      opts.location = argv[++i];
    } else if (arg === "--remote") {
      opts.remoteOnly = true;
    } else if (arg === "--min-score" && argv[i + 1]) {
      opts.minMatchScore = Number(argv[++i]);
    }
  }

  return opts;
}

async function main() {
  const overrides = parseArgs(process.argv.slice(2));
  const store = new JobStore();
  const searchService = new SearchService(store);

  console.log("Running job search pipeline...");
  const result = await searchService.runSearch(overrides);

  console.log("\n--- Search complete ---");
  console.log(`Run ID:     ${result.run.id}`);
  console.log(`Fetched:    ${result.run.totalFetched}`);
  console.log(`Matched:    ${result.run.totalAfterFilter}`);
  console.log(`New jobs:   ${result.run.newJobs}`);
  console.log(`Providers:  ${result.run.providersUsed.join(", ")}`);

  console.log("\nTop matches:");
  for (const job of result.jobs.slice(0, 10)) {
    console.log(`  [${job.matchScore}] ${job.title} @ ${job.company} (${job.source})`);
    console.log(`       ${job.url}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
