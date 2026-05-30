import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import type { Application, ApplicationStatus } from "../types";

const STATUSES: ApplicationStatus[] = [
  "saved",
  "applied",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];

export function ApplicationsPanel() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.applications();
      setApplications(data.applications);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: ApplicationStatus) {
    setUpdating(id);
    try {
      const updated = await api.updateApplication(id, { status });
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="panel">
      <h2>Application tracker</h2>
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="empty">
          <span className="spinner" /> Loading…
        </div>
      ) : applications.length === 0 ? (
        <div className="empty">
          No tracked applications. Save jobs from search results to track them here.
        </div>
      ) : (
        applications.map((app) => (
          <div key={app.id} className="app-row">
            <div>
              <strong>{app.job?.title ?? app.jobId}</strong>
              <div className="job-meta">
                {app.job?.company ?? "Unknown company"}
                {app.appliedAt && ` · Applied ${new Date(app.appliedAt).toLocaleDateString()}`}
              </div>
              {app.job?.url && (
                <a href={app.job.url} target="_blank" rel="noopener noreferrer">
                  View posting
                </a>
              )}
            </div>
            <select
              value={app.status}
              disabled={updating === app.id}
              onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ))
      )}
    </div>
  );
}
