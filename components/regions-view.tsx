import type { CoverageScope, Incident, Service } from "../lib/types";
import { coverageOptions, coverageRows, statusLabel, services } from "../lib/practice-data";

type Props = {
  coverageScope: CoverageScope;
  setCoverageScope: (scope: CoverageScope) => void;
  selectedIncident: Incident;
  selectedService: Service;
  incidents: Incident[];
  selectIncident: (id: string) => void;
};

export function RegionsView({ coverageScope, setCoverageScope, selectedIncident, selectedService, incidents, selectIncident }: Props) {
  return (
    <section className="app-view">
      <section className="scope-panel" aria-labelledby="regions-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Coverage scope</p>
            <h2 id="regions-title">Choose how wide the view should be</h2>
            <p className="panel-note">
              These are fixed scenario maps and simulated service health, not live
              telemetry. Marking a practice incident resolved does not change these baseline metrics.
            </p>
          </div>
          <div className="scope-tabs" aria-label="Coverage scope options">
            {coverageOptions.map((option) => (
              <button
                className={coverageScope === option ? "active" : ""}
                key={option}
                onClick={() => setCoverageScope(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="scope-grid">
          {coverageRows[coverageScope].map((row) => (
            <article className={`scope-card ${row.status}`} key={row.place}>
              <span className={`state-pill ${row.status}`}>
                {statusLabel[row.status]}
              </span>
              <strong>{row.place}</strong>
              <p>{row.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <article className="topology-panel" aria-labelledby="topology-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Service map</p>
            <h2 id="topology-title">What is affected</h2>
            <p className="panel-note">
              Click a service to open its response plan.
            </p>
          </div>
          <span className={`state-pill ${selectedService.status}`}>
            {statusLabel[selectedService.status]}
          </span>
        </div>

        <div className="topology-map" aria-label="Service topology map">
          <span className="route route-a" />
          <span className="route route-b" />
          <span className="route route-c" />
          <span className="route route-d" />
          {services.map((service) => {
            const linkedIncident = incidents.find(
              (incident) => incident.service === service.name,
            );

            return (
              <button
                className={`map-node ${service.status} ${
                  selectedService.name === service.name ? "active" : ""
                }`}
                key={service.name}
                onClick={() => {
                  if (linkedIncident) {
                    selectIncident(linkedIncident.id);
                  }
                }}
                style={{ left: `${service.x}%`, top: `${service.y}%` }}
                type="button"
              >
                <span>{service.code}</span>
                <small>{service.state}</small>
              </button>
            );
          })}
        </div>

        <div className="radius-list" aria-label="Affected areas">
          {selectedIncident.blastRadius.map((area) => (
            <span key={area}>{area}</span>
          ))}
        </div>
      </article>
    </section>
  );
}
