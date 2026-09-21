import type { IncidentStatus, Incident, ViewName } from "../lib/types";
import { services, statusOptions } from "../lib/practice-data";

type Props = {
  filter: "All" | IncidentStatus;
  setFilter: (filter: "All" | IncidentStatus) => void;
  filteredIncidents: Incident[];
  selectedIncident: Incident;
  selectIncident: (id: string) => void;
  openView: (view: ViewName) => void;
};

export function IncidentsView({ filter, setFilter, filteredIncidents, selectedIncident, selectIncident, openView }: Props) {
  return (
    <section className="app-view">
      <article className="incident-ledger" aria-labelledby="ledger-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Incidents</p>
            <h2 id="ledger-title">Practice response queue</h2>
            <p className="panel-note">
              Click a row to open its response plan.
            </p>
          </div>
          <div className="filter-row" aria-label="Incident status filter">
            {statusOptions.map((option) => (
              <button
                className={filter === option ? "active" : ""}
                key={option}
                onClick={() => setFilter(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="ledger-list">
          {filteredIncidents.length === 0 && <p className="panel-note">No practice incidents match this status.</p>}
          {filteredIncidents.map((incident) => {
            const incidentService =
              services.find((service) => service.name === incident.service) ??
              services[0];

            return (
              <button
                className={selectedIncident.id === incident.id ? "selected" : ""}
                key={incident.id}
                onClick={() => selectIncident(incident.id)}
                type="button"
              >
                <span className={`severity ${incident.severity.toLowerCase()}`}>
                  {incident.severity}
                </span>
                <strong>{incident.title}</strong>
                <small>
                  {incident.service} / {incidentService.state} / {incident.started}
                </small>
                <b>{incident.status}</b>
              </button>
            );
          })}
        </div>
      </article>

      <section className="command-cards">
        <article>
          <h2>Selected incident</h2>
          <p>{selectedIncident.impact}</p>
          <button onClick={() => openView("Response")} type="button">
            Open response plan
          </button>
        </article>
        <article>
          <h2>Current owner</h2>
          <p>
            {selectedIncident.owner} owns this response for{" "}
            {selectedIncident.service}.
          </p>
          <button onClick={() => openView("Regions")} type="button">
            View location impact
          </button>
        </article>
      </section>
    </section>
  );
}
