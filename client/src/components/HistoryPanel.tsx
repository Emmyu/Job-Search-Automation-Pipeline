import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import type { SearchRun } from "../types";

export function HistoryPanel() {
  const [runs, setRuns] = useState<SearchRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.searchRuns();
      setRuns(data.runs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="panel">
      <h2>Search history</h2>
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="empty">
          <span className="spinner" /> Loading…
        </div>
      ) : runs.length === 0 ? (
        <div className="empty">No search runs yet.</div>
      ) : (
        runs.map((run) => (
          <div
            key={run.id}
            className={`history-item${run.status === "failed" ? " failed" : ""}`}
          >
            <div>
              <strong>{run.criteria.keywords.join(", ")}</strong>
              {run.criteria.remoteOnly && " · remote"}
              {run.criteria.location && ` · ${run.criteria.location}`}
            </div>
            <div className="history-meta">
              {run.status} · fetched {run.totalFetched} · matched {run.totalAfterFilter} ·{" "}
              {run.newJobs} new · {new Date(run.startedAt).toLocaleString()}
              {run.error && ` · ${run.error}`}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
