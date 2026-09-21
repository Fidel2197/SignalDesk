import type { Incident } from "../lib/types";
import type { ResponseStat } from "./response-stats";
import { ResponseStats } from "./response-stats";
import { priorityMix } from "../lib/report-summary";

type Props = {
  dynamicResponseStats: ResponseStat[];
  incidents: Incident[];
};

export function ReportsView({ dynamicResponseStats, incidents }: Props) {
  const priorityBars = priorityMix(incidents);
  const open = incidents.filter((item) => item.status !== "Resolved");
  const next = [...open].sort((a, b) => ["Critical", "High", "Medium"].indexOf(a.severity) - ["Critical", "High", "Medium"].indexOf(b.severity))[0];
  return (
    <section className="app-view">
      <ResponseStats stats={dynamicResponseStats} />

      <section className="reports-layout">
        <article className="report-panel" aria-labelledby="report-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Reports</p>
              <h2 id="report-title">Practice queue priority mix</h2>
              <p className="panel-note">
                Calculated from all {incidents.length} saved scenarios, including resolved ones.
              </p>
            </div>
          </div>
          <div className="severity-report">
            {priorityBars.map((bar) => (
              <div key={bar.label}>
                <span>{bar.label}</span>
                <i>
                  <b style={{ width: `${bar.value}%` }} />
                </i>
                <strong>{bar.value}%</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="report-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Takeaway</p>
              <h2>What this report says</h2>
              <p className="panel-note">
                {open.length} scenarios remain open; {incidents.length - open.length} have been marked resolved.
                These counts reflect your practice progress, not production incident statistics.
              </p>
            </div>
          </div>
          <div className="report-summary">
            <span>Best focus</span>
            <strong>{next?.title ?? "All practice incidents resolved"}</strong>
            <p>{next ? `Highest open priority: ${next.severity}. Review its runbook to continue.` : "Add a practice alert or reset the workspace to start again."}</p>
          </div>
        </article>
      </section>
    </section>
  );
}
