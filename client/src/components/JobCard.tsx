import type { JobListing } from "../types";

interface JobCardProps {
  job: JobListing;
  onSave?: (job: JobListing) => void;
  saving?: boolean;
  saved?: boolean;
}

export function JobCard({ job, onSave, saving, saved }: JobCardProps) {
  return (
    <article className="job-card">
      <div className="job-card-header">
        <div>
          <h3>{job.title}</h3>
          <div className="job-meta">
            {job.company} · {job.location}
            {job.remote && " · Remote"}
            {job.salary && ` · ${job.salary}`}
          </div>
        </div>
        <span className="score-badge">{job.matchScore}</span>
      </div>

      <p className="job-desc">{job.description}</p>

      <div className="tags">
        <span className="tag">{job.source}</span>
        {job.tags.slice(0, 5).map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="job-actions">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm"
        >
          View posting
        </a>
        {onSave && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={saving || saved}
            onClick={() => onSave(job)}
          >
            {saved ? "Saved" : saving ? "Saving…" : "Track job"}
          </button>
        )}
      </div>
    </article>
  );
}
