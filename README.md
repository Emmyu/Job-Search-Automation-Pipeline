# Job Search Automation Pipeline

TypeScript + Node.js pipeline that aggregates jobs from REST APIs, scores and filters them against your criteria, persists results, and exposes a REST API for searches and application tracking.

## Features

- **Multi-provider fetch** — RemoteOK (no key), Adzuna (API key), Mock (offline demo)
- **Pipeline** — fetch → score → dedupe → persist
- **REST API** — trigger searches, list jobs, track applications
- **CLI** — one-off searches from the terminal
- **Optional cron** — scheduled automatic searches

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

API: [http://localhost:3000](http://localhost:3000)

### Run a search (mock provider by default)

```bash
curl -X POST http://localhost:3000/api/search/run \
  -H "Content-Type: application/json" \
  -d "{\"keywords\":[\"typescript\",\"node\"],\"remoteOnly\":true,\"minMatchScore\":30}"
```

### CLI

```bash
npm run search -- --keywords typescript,node --remote --min-score 40
```

## REST API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/` | API index |
| POST | `/api/search/run` | Run the pipeline |
| GET | `/api/search/providers` | List job sources |
| GET | `/api/search/runs` | Recent search runs |
| GET | `/api/jobs` | List stored jobs (`?minScore=&source=&remote=&limit=`) |
| GET | `/api/jobs/:id` | Get one job |
| GET | `/api/applications` | List applications with job details |
| POST | `/api/applications` | Track a job (`jobId`, `status`, `notes`) |
| PATCH | `/api/applications/:id` | Update status/notes |

### Example: track an application

```bash
# After a search, copy a job id from GET /api/jobs
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -d "{\"jobId\":\"mock-0-abc12345\",\"status\":\"applied\",\"notes\":\"Tailored resume\"}"
```

## Configuration

Copy `.env.example` to `.env`:

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `3000`) |
| `DATA_DIR` | JSON store directory (default `./data`) |
| `JOB_PROVIDERS` | `remoteok`, `adzuna`, `mock` (comma-separated) |
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | [Adzuna API](https://developer.adzuna.com/) credentials |
| `SEARCH_CRON` | Cron expression for auto-search (e.g. `0 8 * * *`) |
| `DEFAULT_KEYWORDS` | Default comma-separated keywords |
| `MIN_MATCH_SCORE` | Minimum score 0–100 (default `40`) |

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  REST API   │────▶│  SearchService   │────▶│ JobPipeline │
└─────────────┘     └──────────────────┘     └──────┬──────┘
                                                    │
                    ┌───────────────────────────────┼───────────────────────────────┐
                    ▼                               ▼                               ▼
              RemoteOK API                    Adzuna API                         Mock
                    │                               │                               │
                    └───────────────────────────────┴───────────────────────────────┘
                                                    │
                                            score + dedupe
                                                    ▼
                                              JobStore (JSON)
```

## Frontend

React + Vite UI in `client/` with four tabs:

- **Search** — run the pipeline with keywords, filters, and view results
- **Jobs** — browse stored job listings
- **Applications** — track saved/applied jobs and update status
- **History** — past search runs

### Local development

```bash
# Terminal 1 — API
npm run dev

# Terminal 2 — frontend (proxies /api to :3000)
npm run dev:client
```

Open [http://localhost:5173](http://localhost:5173)

Or build and serve together:

```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with hot reload |
| `npm run dev:client` | Start React dev server (port 5173) |
| `npm run build` | Build frontend + compile backend |
| `npm start` | Run compiled server (serves UI + API) |
| `npm run search` | CLI one-off search |

## Deploy on Vercel

This project includes `api/index.ts` and `vercel.json` for serverless Express.

1. Import the GitHub repo in [Vercel](https://vercel.com)
2. Set **Environment Variables** (Project → Settings → Environment Variables):
   - `JOB_PROVIDERS` = `remoteok,mock` (or `mock` only for demo)
   - `DEFAULT_KEYWORDS` = `typescript,node`
   - `MIN_MATCH_SCORE` = `40`
   - Optional: `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`
3. Deploy — Vercel builds the React app into `public/` and serves it at `/`. API routes go to `api/index.ts`.

## Production notes

- Replace JSON `JobStore` with PostgreSQL or SQLite for concurrency.
- Add authentication before exposing the API publicly.
- Respect each provider’s rate limits and terms of service.

## License

MIT
