import { useEffect, useState } from "react";
import { api } from "./api";
import { ApplicationsPanel } from "./components/ApplicationsPanel";
import { HistoryPanel } from "./components/HistoryPanel";
import { JobsPanel } from "./components/JobsPanel";
import { SearchPanel } from "./components/SearchPanel";
import type { Tab } from "./types";

const TABS: { id: Tab; label: string }[] = [
  { id: "search", label: "Search" },
  { id: "jobs", label: "Jobs" },
  { id: "applications", label: "Applications" },
  { id: "history", label: "History" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("search");
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    api.health()
      .then(() => setOnline(true))
      .catch(() => setOnline(false));
  }, []);

  return (
    <div className="app-shell">
      <header className="header">
        <div className="brand">
          <div className="brand-icon">💼</div>
          <div>
            <h1>Job Search Automation</h1>
            <p>Pipeline · Score · Track applications</p>
          </div>
        </div>
        <span className={`status-pill ${online ? "online" : "offline"}`}>
          <span className="status-dot" />
          {online === null ? "Checking…" : online ? "API online" : "API offline"}
        </span>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main>
        {tab === "search" && <SearchPanel />}
        {tab === "jobs" && <JobsPanel />}
        {tab === "applications" && <ApplicationsPanel />}
        {tab === "history" && <HistoryPanel />}
      </main>
    </div>
  );
}
