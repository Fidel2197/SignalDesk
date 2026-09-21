import type { Incident, Service, ExternalSignal, ViewName } from "../lib/types";
import { statusLabel, externalStatusLabel } from "../lib/practice-data";
import type { ResponseStat } from "./response-stats";
import { ResponseStats } from "./response-stats";

type Props = {
  selectedIncident: Incident;
  selectedService: Service;
  dynamicResponseStats: ResponseStat[];
  signals: ExternalSignal[];
  signalSummary: string;
  openView: (view: ViewName) => void;
};

export function CommandView({ selectedIncident, selectedService, dynamicResponseStats, signals, signalSummary, openView }: Props) {
  return (
    <section className="app-view">
      <section className="hero-console compact-hero">
        <div className="hero-copy">
          <p className="eyebrow">Incident response practice</p>
          <h2>See what broke, where it is, and what to do next.</h2>
          <p>
            Work through realistic incident scenarios, save your response progress,
            and check current public provider status in one workspace.
          </p>
          <div className="info-summary" aria-label="Command shortcuts">
            <button onClick={() => openView("Incidents")} type="button">
              <strong>Incidents</strong>
              <span>Open the active queue and choose what to handle first.</span>
            </button>
            <button onClick={() => openView("Regions")} type="button">
              <strong>Regions</strong>
              <span>Switch between state, regional, and global impact.</span>
            </button>
            <button onClick={() => openView("Response")} type="button">
              <strong>Response</strong>
              <span>Review the selected incident and follow the runbook.</span>
            </button>
            <button onClick={() => openView("Signals")} type="button">
              <strong>Signals</strong>
              <span>Check public sources that may explain outside service risk.</span>
            </button>
          </div>
        </div>

        <div className="impact-dial" aria-label="Selected incident impact">
          <div className="dial-core">
            <span>{selectedIncident.severity}</span>
            <strong>{selectedIncident.confidence}%</strong>
            <p>scenario confidence</p>
          </div>
          <div className="dial-meta">
            <span>{selectedIncident.id}</span>
            <b>{selectedService.state}</b>
          </div>
        </div>
      </section>

      <ResponseStats stats={dynamicResponseStats} />

      <section className="command-cards">
        <article>
          <span className={`severity ${selectedIncident.severity.toLowerCase()}`}>
            {selectedIncident.severity}
          </span>
          <h2>{selectedIncident.title}</h2>
          <p>{selectedIncident.impact}</p>
          <button onClick={() => openView("Response")} type="button">
            Open response
          </button>
        </article>
        <article>
          <span className={`state-pill ${selectedService.status}`}>
            {statusLabel[selectedService.status]}
          </span>
          <h2>{selectedService.state}</h2>
          <p>
            {selectedService.name} is owned by {selectedService.owner} in{" "}
            {selectedService.region}.
          </p>
          <button onClick={() => openView("Regions")} type="button">
            Open regions
          </button>
        </article>
        <article>
          <span className={`external-pill ${signals[0]?.status ?? "unknown"}`}>
            {externalStatusLabel[signals[0]?.status ?? "unknown"]}
          </span>
          <h2>Outside sources</h2>
          <p>{signalSummary}</p>
          <button onClick={() => openView("Signals")} type="button">
            Open signals
          </button>
        </article>
      </section>
    </section>
  );
}
