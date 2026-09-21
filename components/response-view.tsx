import type { Incident, IncidentStatus } from "../lib/types";

type Props = {
  selectedIncident: Incident;
  reviewNote: string;
  updateIncidentStatus: (status: IncidentStatus) => void;
  completed: number[];
  toggleStep: (index: number) => void;
  ready: boolean;
};

export function ResponseView({ selectedIncident, reviewNote, updateIncidentStatus, completed, toggleStep, ready }: Props) {
  return (
    <section className="app-view">
      <section className="response-layout">
        <article className="briefing-panel" aria-labelledby="briefing-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Response plan</p>
              <h2 id="briefing-title">{selectedIncident.id}</h2>
              <p className="panel-note">
                Plain summary of the impact and next move.
              </p>
            </div>
            <span className={`severity ${selectedIncident.severity.toLowerCase()}`}>
              {selectedIncident.severity}
            </span>
          </div>

          <h3>{selectedIncident.title}</h3>
          <p className="impact-copy">{selectedIncident.impact}</p>

          <div className="brief-block">
            <span>What is happening</span>
            <p>{selectedIncident.rootCause}</p>
          </div>

          <div className="brief-block action">
            <span>Best next step</span>
            <p>{selectedIncident.nextAction}</p>
          </div>

          <div className="brief-block engine">
            <span>Rule-based review</span>
            <p role="status">{reviewNote}</p>
          </div>

          <div className="status-actions">
            <button disabled={!ready || selectedIncident.status === "Investigating"} onClick={() => updateIncidentStatus("Investigating")} type="button">
              Reopen investigation
            </button>
            <button disabled={!ready || selectedIncident.status === "Mitigating"} onClick={() => updateIncidentStatus("Mitigating")} type="button">
              Mark mitigating
            </button>
            <button disabled={!ready || selectedIncident.status === "Monitoring"} onClick={() => updateIncidentStatus("Monitoring")} type="button">
              Mark monitoring
            </button>
            <button disabled={!ready || selectedIncident.status === "Resolved"} onClick={() => updateIncidentStatus("Resolved")} type="button">
              Mark resolved
            </button>
          </div>
        </article>

        <article className="runbook-panel" aria-labelledby="runbook-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Runbook</p>
              <h2 id="runbook-title">Steps to follow</h2>
              <p className="panel-note">
                {completed.length} of {selectedIncident.runbook.length} complete. Practice progress is saved in this browser.
              </p>
            </div>
          </div>
          <ol className="runbook-list">
            {selectedIncident.runbook.map((step, index) => (
              <li key={step}><label className="runbook-check">
                <input type="checkbox" checked={completed.includes(index)} disabled={!ready} onChange={() => toggleStep(index)} />
                <span>{step}</span>
              </label></li>
            ))}
          </ol>
        </article>
      </section>

      <section className="telemetry-grid two-column">
        <article className="terminal-panel" aria-labelledby="terminal-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Evidence</p>
              <h2 id="terminal-title">Signals checked</h2>
              <p className="panel-note">
                Short notes that explain why the response plan was chosen.
              </p>
            </div>
          </div>
          <div className="evidence-list">
            {selectedIncident.logs.map((log) => (
              <p key={log}>{log}</p>
            ))}
          </div>
        </article>

        <article className="timeline-panel" aria-labelledby="timeline-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Timeline</p>
              <h2 id="timeline-title">Response history</h2>
              <p className="panel-note">
                What changed during the response.
              </p>
            </div>
          </div>
          <ol className="timeline-list">
            {selectedIncident.timeline.map((event, index) => (
              <li key={`${event}-${index}`}>{event}</li>
            ))}
          </ol>
        </article>
      </section>
    </section>
  );
}
