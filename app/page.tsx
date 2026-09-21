"use client";

import { useState } from "react";
import { services, navItems, viewDescriptions } from "../lib/practice-data";
import type { ViewName, IncidentStatus, CoverageScope } from "../lib/types";
import { usePracticeWorkspace } from "../hooks/use-practice-workspace";
import { usePublicSignals } from "../hooks/use-public-signals";
import { useIncidentReview } from "../hooks/use-incident-review";
import { CommandView } from "../components/command-view";
import { GuideView } from "../components/guide-view";
import { IncidentsView } from "../components/incidents-view";
import { ResponseView } from "../components/response-view";
import { RegionsView } from "../components/regions-view";
import { SignalsView } from "../components/signals-view";
import { ReportsView } from "../components/reports-view";

export default function Home() {
  const [activeView, setActiveView] = useState<ViewName>("Command");
  const [filter, setFilter] = useState<"All" | IncidentStatus>("All");
  const [coverageScope, setCoverageScope] = useState<CoverageScope>("U.S. States");
  const workspace = usePracticeWorkspace();
  const { incidents, selectedId } = workspace;
  const { signals, signalSummary, signalMode, checkedAt, loading, refresh } = usePublicSignals();
  const review = useIncidentReview();
  const { reviewLoading } = review;
  const selectedIncident = incidents.find((item) => item.id === selectedId) ?? incidents[0];
  const selectedService = services.find((item) => item.name === selectedIncident.service) ?? services[0];
  const filteredIncidents = filter === "All" ? incidents : incidents.filter((item) => item.status === filter);
  const openIncidentCount = incidents.filter((item) => item.status !== "Resolved").length;
  const outsideAttentionCount = signals.filter((item) => item.status !== "operational").length;
  const dynamicResponseStats = [
    { label: "Open", value: String(openIncidentCount), detail: "practice incidents" },
    { label: "Resolved", value: String(incidents.length - openIncidentCount), detail: "practice incidents" },
    { label: "Checked", value: String(signals.filter((item) => item.status !== "unknown").length), detail: "public sources" },
    { label: "Attention", value: String(outsideAttentionCount), detail: "public sources / unknown" },
  ];
  function openView(view: ViewName) {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function selectIncident(id: string) { workspace.select(id); openView("Response"); }
  function updateIncidentStatus(status: IncidentStatus) { workspace.updateStatus(selectedIncident.id, status); }
  function ingestAlert() { workspace.addAlert(); openView("Response"); }
  function reviewIncident() { void review.review(selectedIncident, signals); openView("Response"); }

  return (
    <main className="command-shell">
      <header className="mission-bar">
        <button
          className="brand"
          onClick={() => openView("Command")}
          type="button"
          aria-label="Open SignalDesk command view"
        >
          <span>SD</span>
          <strong>SignalDesk</strong>
        </button>

        <nav className="mission-nav" aria-label="Primary sections">
          {navItems.map((item) => (
            <button
              className={activeView === item ? "active" : ""}
              key={item}
              onClick={() => openView(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="mission-status" aria-label="Current response status">
          <span>Practice workspace</span>
          <strong>{openIncidentCount} open</strong>
        </div>
      </header>

      <section className="practice-notice" aria-label="Workspace data and saving">
        <div><strong>Practice incidents. Real public status checks.</strong>
          <p>Incidents, owners, logs, service loads, and regional metrics are simulated. Status and checklist changes stay in this browser.</p>
          <small role="status">{workspace.storageMessage}</small>
        </div>
        <button className="secondary-action" disabled={!workspace.ready} onClick={() => {
          if (window.confirm("Reset all practice statuses, checklist steps, and activity in this browser?")) {
            workspace.reset(); review.clear(); setFilter("All"); openView("Command");
          }
        }} type="button">Reset practice</button>
      </section>
      <section className="command-grid">
        <aside className="signal-rail" aria-label="Response summary">
          <div className="rail-block priority">
            <span className="eyebrow">Response owner</span>
            <strong>{selectedIncident.owner}</strong>
            <p>
              Assigned team for {selectedIncident.service} in {selectedService.state}.
            </p>
          </div>

          <div className="rail-block">
            <span className="eyebrow">Simulated services</span>
            <div className="rail-services">
              {services.map((service) => {
                const linkedIncident = incidents.find(
                  (incident) => incident.service === service.name,
                );

                return (
                  <button
                    className={service.name === selectedIncident.service ? "selected" : ""}
                    key={service.name}
                    onClick={() => {
                      if (linkedIncident) {
                        selectIncident(linkedIncident.id);
                      } else {
                        openView("Regions");
                      }
                    }}
                    type="button"
                  >
                    <i className={service.status} />
                    <span>{service.code}</span>
                    <b>{service.load}%</b>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rail-block">
            <span className="eyebrow">Quick summary</span>
            <p className="handoff-copy">
              Priority: {selectedIncident.severity}. Risk: {selectedIncident.risk}.
              Status: {selectedIncident.status}.
            </p>
          </div>
        </aside>

        <section className="war-room">
          <section className="view-heading" aria-label={`${activeView} view`}>
            <div>
              <p className="eyebrow">{activeView}</p>
              <h1>{viewDescriptions[activeView]}</h1>
            </div>
            {activeView !== "Guide" && (
              <div className="view-actions">
                <button
                  className="primary-action"
                  disabled={reviewLoading || !workspace.ready}
                  onClick={reviewIncident}
                  type="button"
                >
                  {reviewLoading ? "Reviewing" : "Review incident"}
                </button>
                <button className="secondary-action" onClick={ingestAlert} disabled={!workspace.ready || incidents.length >= 23} type="button">
                  Add practice alert
                </button>
              </div>
            )}
          </section>

          {activeView === "Command" && (
            <CommandView selectedIncident={selectedIncident} selectedService={selectedService} dynamicResponseStats={dynamicResponseStats} signals={signals} signalSummary={signalSummary} openView={openView} />
          )}

          {activeView === "Guide" && (
            <GuideView openView={openView} />
          )}

          {activeView === "Incidents" && (
            <IncidentsView filter={filter} setFilter={setFilter} filteredIncidents={filteredIncidents} selectedIncident={selectedIncident} selectIncident={selectIncident} openView={openView} />
          )}

          {activeView === "Response" && (
            <ResponseView selectedIncident={selectedIncident} reviewNote={review.noteFor(selectedIncident.id)} updateIncidentStatus={updateIncidentStatus} completed={workspace.completed[selectedIncident.id] ?? []} toggleStep={(index) => workspace.toggleStep(selectedIncident.id, index)} ready={workspace.ready} />
          )}

          {activeView === "Regions" && (
            <RegionsView coverageScope={coverageScope} setCoverageScope={setCoverageScope} selectedIncident={selectedIncident} selectedService={selectedService} incidents={incidents} selectIncident={selectIncident} />
          )}

          {activeView === "Signals" && (
            <SignalsView signals={signals} signalMode={signalMode} outsideAttentionCount={outsideAttentionCount} signalSummary={signalSummary} selectedIncident={selectedIncident} checkedAt={checkedAt} loading={loading} refresh={refresh} />
          )}

          {activeView === "Reports" && (
            <ReportsView dynamicResponseStats={dynamicResponseStats} incidents={incidents} />
          )}
        </section>
      </section>
    </main>
  );
}
