import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import type { JobListing } from "../types";
import { JobCard } from "./JobCard";

export function JobsPanel() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(0);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [source, setSource] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.jobs({
        minScore: minScore || undefined,
        remote: remoteOnly ? true : undefined,
        source: source || undefined,
        limit: 50,
      });
      setJobs(data.jobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [minScore, remoteOnly, source]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="panel">
      <h2>Saved jobs</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters">
        <div className="field">
          <label htmlFor="filter-score">Min score</label>
          <input
            id="filter-score"
            type="number"
            min={0}
            max={100}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="filter-source">Source</label>
          <select id="filter-source" value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">All</option>
            <option value="mock">Mock</option>
            <option value="remoteok">RemoteOK</option>
            <option value="adzuna">Adzuna</option>
          </select>
        </div>
        <div className="checkbox-row">
          <input
            id="filter-remote"
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
          />
          <label htmlFor="filter-remote">Remote only</label>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={load}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="empty">
          <span className="spinner" /> Loading jobs…
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty">No jobs stored yet. Run a search first.</div>
      ) : (
        <div className="job-list">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
