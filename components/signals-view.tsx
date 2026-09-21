import type { ExternalSignal, SignalsPayload, Incident } from "../lib/types";
import { externalStatusLabel } from "../lib/practice-data";

type Props = {
  signals: ExternalSignal[];
  signalMode: SignalsPayload["mode"];
  outsideAttentionCount: number;
  signalSummary: string;
  selectedIncident: Incident;
  checkedAt: string | null;
  loading: boolean;
  refresh: () => void;
};

export function SignalsView({ signals, signalMode, outsideAttentionCount, signalSummary, selectedIncident, checkedAt, loading, refresh }: Props) {
  return (
    <section className="app-view">
      <section className="signals-hero" aria-labelledby="signals-title">
        <div>
          <p className="eyebrow">Public signals</p>
          <h2 id="signals-title">Current reports from public status pages.</h2>
          <p>
            These provider checks are real and separate from the simulated incidents.
            A provider issue does not establish the cause of a practice scenario.
            Refresh to check again; this page does not continuously poll.
          </p>
          <button className="secondary-action" disabled={loading} onClick={refresh} type="button">
            {loading ? "Checking sources…" : "Refresh public checks"}
          </button>
          <p className="panel-note" role="status">{checkedAt ? `Checked ${new Date(checkedAt).toLocaleString()}` : "No completed check yet."}</p>
        </div>
        <div className="signal-score">
          <span>{signalMode}</span>
          <strong>{outsideAttentionCount}</strong>
          <p>{outsideAttentionCount === 1 ? "source to check" : "sources to check"}</p>
        </div>
      </section>

      <section className="signal-grid" aria-label="Public source checks">
        {signals.map((signal) => (
          <article className={`signal-card ${signal.status}`} key={signal.provider}>
            <div className="signal-card-top">
              <span className={`external-pill ${signal.status}`}>
                {externalStatusLabel[signal.status]}
              </span>
              <strong>{signal.provider}</strong>
            </div>
            <p>{signal.summary}</p>
            <div className="signal-focus">
              <span>Why it matters</span>
              <p>{signal.focus}</p>
            </div>
            {signal.affected.length > 0 && (
              <div className="signal-tags" aria-label={`${signal.provider} affected areas`}>
                {signal.affected.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            )}
            <a href={signal.sourceUrl} rel="noreferrer" target="_blank">
              Open source
            </a>
          </article>
        ))}
      </section>

      <section className="reports-layout">
        <article className="report-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">How SignalDesk uses it</p>
              <h2>Public status stays separate from practice evidence.</h2>
              <p className="panel-note">
                These are provider-reported summaries, not monitoring of your
                infrastructure. A failed or malformed provider response is shown
                as unknown and never counted as a healthy service.
              </p>
            </div>
          </div>
          <div className="signal-checklist">
            <span>1. Review the selected incident.</span>
            <span>2. Check sources with Watch, Issue, or Check source.</span>
            <span>3. Run Review incident to include the source check.</span>
          </div>
        </article>

        <article className="report-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Selected practice incident</p>
              <h2>{selectedIncident.service}</h2>
              <p className="panel-note">
                {selectedIncident.title} is owned by {selectedIncident.owner}.
                This scenario is not connected to those providers. Public checks
                add context only and do not change its severity or metrics.
              </p>
            </div>
          </div>
          <div className="report-summary">
            <span>Current read</span>
            <strong>{outsideAttentionCount ? "Check outside status" : "Local issue focus"}</strong>
            <p>{signalSummary}</p>
          </div>
        </article>
      </section>
    </section>
  );
}
