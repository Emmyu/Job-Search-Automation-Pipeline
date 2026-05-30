import { useState } from "react";
import { api } from "../api";
import type { JobListing, PipelineResult } from "../types";
import { JobCard } from "./JobCard";

export function SearchPanel() {
  const [keywords, setKeywords] = useState("typescript, node, backend");
  const [location, setLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minScore, setMinScore] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.runSearch({
        keywords: keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        location: location || undefined,
        remoteOnly,
        minMatchScore: minScore,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(job: JobListing) {
    setSavingId(job.id);
    try {
      await api.createApplication(job.id, "saved");
      setSavedIds((prev) => new Set(prev).add(job.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="panel">
      <h2>Run job search</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSearch}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="keywords">Keywords (comma-separated)</label>
            <input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="typescript, react, remote"
            />
          </div>
          <div className="field">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="field">
            <label htmlFor="minScore">Min match score</label>
            <input
              id="minScore"
              type="number"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
            />
          </div>
          <div className="checkbox-row">
            <input
              id="remote"
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
            />
            <label htmlFor="remote">Remote only</label>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" /> Searching…
            </>
          ) : (
            "Run pipeline"
          )}
        </button>
      </form>

      {result && (
        <>
          <div className="stats-row">
            <div className="stat">
              <div className="stat-value">{result.run.totalFetched}</div>
              <div className="stat-label">Fetched</div>
            </div>
            <div className="stat">
              <div className="stat-value">{result.run.totalAfterFilter}</div>
              <div className="stat-label">Matched</div>
            </div>
            <div className="stat">
              <div className="stat-value">{result.run.newJobs}</div>
              <div className="stat-label">New</div>
            </div>
          </div>

          <div className="job-list">
            {result.jobs.length === 0 ? (
              <div className="empty">No jobs matched your criteria.</div>
            ) : (
              result.jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSave={handleSave}
                  saving={savingId === job.id}
                  saved={savedIds.has(job.id)}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
