"use client";

import { useMemo, useState } from "react";

type ServiceStatus = "stable" | "watch" | "critical";
type IncidentStatus = "Investigating" | "Mitigating" | "Monitoring" | "Resolved";
type Severity = "Critical" | "High" | "Medium";
type CoverageScope = "U.S. States" | "U.S. Regions" | "Global";

type Service = {
  name: string;
  code: string;
  status: ServiceStatus;
  region: string;
  state: string;
  city: string;
  owner: string;
  latency: number;
  load: number;
  uptime: string;
  x: number;
  y: number;
};

type Incident = {
  id: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  service: string;
  owner: string;
  started: string;
  risk: string;
  confidence: number;
  impact: string;
  rootCause: string;
  nextAction: string;
  blastRadius: string[];
  tags: string[];
  logs: string[];
  runbook: string[];
  timeline: string[];
};

type ScopeRow = {
  place: string;
  status: ServiceStatus;
  detail: string;
};

const services: Service[] = [
  {
    name: "Checkout Payments",
    code: "PAY",
    status: "watch",
    region: "Central U.S.",
    state: "Texas",
    city: "Dallas",
    owner: "Platform Team",
    latency: 412,
    load: 78,
    uptime: "99.91%",
    x: 24,
    y: 38,
  },
  {
    name: "Login Service",
    code: "AUTH",
    status: "stable",
    region: "National",
    state: "All states",
    city: "Edge network",
    owner: "Security Team",
    latency: 128,
    load: 42,
    uptime: "99.99%",
    x: 52,
    y: 22,
  },
  {
    name: "Inventory Sync",
    code: "INV",
    status: "critical",
    region: "Eastern U.S.",
    state: "New York",
    city: "Newark",
    owner: "Commerce Team",
    latency: 860,
    load: 91,
    uptime: "98.72%",
    x: 72,
    y: 55,
  },
  {
    name: "Notifications",
    code: "MSG",
    status: "stable",
    region: "Western U.S.",
    state: "California",
    city: "San Jose",
    owner: "Growth Team",
    latency: 205,
    load: 57,
    uptime: "99.95%",
    x: 39,
    y: 72,
  },
  {
    name: "Tax Lookup",
    code: "TAX",
    status: "watch",
    region: "Central U.S.",
    state: "Illinois",
    city: "Chicago",
    owner: "Platform Team",
    latency: 522,
    load: 68,
    uptime: "99.82%",
    x: 15,
    y: 68,
  },
];

const initialIncidents: Incident[] = [
  {
    id: "INC-1048",
    title: "Checkout is slowing down",
    severity: "High",
    status: "Investigating",
    service: "Checkout Payments",
    owner: "Platform Team",
    started: "14 min ago",
    risk: "Revenue impact",
    confidence: 92,
    impact:
      "Customers can still check out, but payment confirmation is taking longer than normal.",
    rootCause:
      "A recent tax lookup change is slowing down the checkout path. Payments are still going through, so the first move is to reduce delay before it becomes an outage.",
    nextAction:
      "Move a small slice of checkout traffic back to the previous worker and compare confirmation speed for ten minutes.",
    blastRadius: ["Checkout confirmation", "Tax lookup", "Order receipts"],
    tags: ["checkout", "latency", "payments"],
    logs: [
      "17:06 Checkout latency reached 932 ms at peak",
      "17:07 Tax lookup timeout rate rose to 3.8%",
      "17:08 Texas checkout traffic moved to backup pool",
      "17:09 Recent tax cache change matched the slowdown",
    ],
    runbook: [
      "Compare current checkout speed with the last stable release.",
      "Move 20% of checkout traffic to the previous worker.",
      "Watch payment confirmation and tax lookup speed for 10 minutes.",
      "Roll back the new tax lookup change if delays stay high.",
    ],
    timeline: [
      "Checkout slowdown detected",
      "Platform Team assigned",
      "Tax lookup change matched to the timing",
    ],
  },
  {
    id: "INC-1047",
    title: "Inventory updates are falling behind",
    severity: "Critical",
    status: "Mitigating",
    service: "Inventory Sync",
    owner: "Commerce Team",
    started: "31 min ago",
    risk: "Order accuracy",
    confidence: 88,
    impact:
      "Some product pages may show old availability while delayed inventory updates catch up.",
    rootCause:
      "A worker setting cut the number of inventory jobs running at the same time during a busy order window.",
    nextAction:
      "Restore normal worker capacity, replay delayed inventory updates, and keep stale-stock warnings visible until the queue clears.",
    blastRadius: ["Warehouse events", "Product availability", "Stock checks"],
    tags: ["inventory", "queue", "orders"],
    logs: [
      "16:48 Inventory queue reached 18,422 waiting updates",
      "16:51 New York warehouse lag reached 18 minutes",
      "16:54 Worker capacity changed from 18 to 8",
      "17:02 Replay window prepared for delayed inventory updates",
    ],
    runbook: [
      "Restore inventory worker capacity to normal.",
      "Replay delayed updates from the waiting queue.",
      "Compare New York lag against the western warehouse baseline.",
      "Remove stale-stock warnings after lag drops under 90 seconds.",
    ],
    timeline: [
      "Critical inventory incident opened",
      "Commerce Team joined response",
      "Worker capacity rollback prepared",
    ],
  },
  {
    id: "INC-1046",
    title: "Notifications are delayed",
    severity: "Medium",
    status: "Monitoring",
    service: "Notifications",
    owner: "Growth Team",
    started: "52 min ago",
    risk: "Customer messaging delay",
    confidence: 76,
    impact: "Receipts and marketing notifications may arrive several minutes late.",
    rootCause:
      "A delivery provider started throttling messages. Internal workers are healthy and the waiting queue is shrinking.",
    nextAction:
      "Keep nonessential campaigns paused until provider limits normalize and receipt messages stay current.",
    blastRadius: ["Receipt messages", "Campaign sends", "Retry queue"],
    tags: ["notifications", "provider", "retry"],
    logs: [
      "16:15 Notification retry queue reached 2,180 messages",
      "16:24 Nonessential campaigns paused",
      "16:39 Provider throttle window reduced to 12%",
      "17:01 Retry queue down to 620 and still falling",
    ],
    runbook: [
      "Keep nonessential campaigns paused.",
      "Watch the retry queue until it keeps falling.",
      "Confirm receipts deliver before campaign traffic resumes.",
      "Resume scheduled sends after provider throttling clears.",
    ],
    timeline: [
      "Provider throttling detected",
      "Campaign traffic reduced",
      "Retry queue trending down",
    ],
  },
];

const statusOptions: Array<"All" | IncidentStatus> = [
  "All",
  "Investigating",
  "Mitigating",
  "Monitoring",
  "Resolved",
];

const navItems = [
  { label: "Command", target: "command" },
  { label: "Incidents", target: "incidents" },
  { label: "Response", target: "response" },
  { label: "Regions", target: "regions" },
  { label: "Reports", target: "reports" },
];

const responseStats = [
  { label: "Open incidents", value: "3", detail: "need attention" },
  { label: "Contained", value: "71%", detail: "risk reduced" },
  { label: "Avg fix time", value: "18m", detail: "today" },
  { label: "Clear evidence", value: "92%", detail: "enough to act" },
];

const priorityBars = [
  { label: "Critical", value: 32 },
  { label: "High", value: 64 },
  { label: "Medium", value: 46 },
  { label: "Noise", value: 22 },
];

const coverageOptions: CoverageScope[] = ["U.S. States", "U.S. Regions", "Global"];

const coverageRows: Record<CoverageScope, ScopeRow[]> = {
  "U.S. States": [
    { place: "Texas", status: "watch", detail: "Checkout traffic is slower than normal." },
    { place: "New York", status: "critical", detail: "Inventory updates need immediate attention." },
    { place: "California", status: "stable", detail: "Notification workers are healthy." },
    { place: "Illinois", status: "watch", detail: "Tax lookup delay is being reviewed." },
  ],
  "U.S. Regions": [
    { place: "Central U.S.", status: "watch", detail: "Checkout and tax lookup are under review." },
    { place: "Eastern U.S.", status: "critical", detail: "Inventory replay is behind." },
    { place: "Western U.S.", status: "stable", detail: "No active customer impact." },
    { place: "National", status: "stable", detail: "Login traffic is normal." },
  ],
  Global: [
    { place: "North America", status: "watch", detail: "Checkout traffic has the only active slowdown." },
    { place: "Europe", status: "stable", detail: "No active incident reported." },
    { place: "Asia-Pacific", status: "stable", detail: "Normal traffic pattern." },
    { place: "South America", status: "stable", detail: "No customer impact reported." },
  ],
};

const statusLabel: Record<ServiceStatus, string> = {
  stable: "Stable",
  watch: "Watch",
  critical: "Critical",
};

export default function Home() {
  const [activeView, setActiveView] = useState("Command");
  const [filter, setFilter] = useState<(typeof statusOptions)[number]>("All");
  const [coverageScope, setCoverageScope] = useState<CoverageScope>("U.S. States");
  const [incidents, setIncidents] = useState(initialIncidents);
  const [selectedId, setSelectedId] = useState(initialIncidents[0].id);
  const [reviewNote, setReviewNote] = useState(
    "Run a review to turn the selected incident into a plain next step.",
  );
  const [reviewLoading, setReviewLoading] = useState(false);

  const selectedIncident =
    incidents.find((incident) => incident.id === selectedId) ?? incidents[0];

  const filteredIncidents = useMemo(() => {
    if (filter === "All") {
      return incidents;
    }

    return incidents.filter((incident) => incident.status === filter);
  }, [filter, incidents]);

  const selectedService =
    services.find((service) => service.name === selectedIncident.service) ??
    services[0];

  const openIncidentCount = incidents.filter(
    (incident) => incident.status !== "Resolved",
  ).length;

  const selectedPriority = selectedIncident.severity;

  function scrollToSection(label: string, target: string) {
    setActiveView(label);
    document.getElementById(target)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function updateIncidentStatus(status: IncidentStatus) {
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === selectedIncident.id
          ? {
              ...incident,
              status,
              timeline: [`Status changed to ${status}`, ...incident.timeline],
            }
          : incident,
      ),
    );
  }

  function ingestAlert() {
    const nextIncident: Incident = {
      id: `INC-${1049 + incidents.length}`,
      title: "Mobile login retry spike",
      severity: "High",
      status: "Investigating",
      service: "Login Service",
      owner: "Security Team",
      started: "just now",
      risk: "Login reliability",
      confidence: 81,
      impact: "Some mobile users may need to retry sign-in after reopening the app.",
      rootCause:
        "The newest mobile build is sending expired refresh tokens after app resume. Web login is not affected.",
      nextAction:
        "Limit repeated retries, alert the mobile release owner, and compare token refresh behavior with the previous build.",
      blastRadius: ["Mobile login", "Token refresh", "App resume"],
      tags: ["login", "mobile", "tokens"],
      logs: [
        "17:18 Mobile token refresh failures rose to 186",
        "17:18 Mobile build 8.14.2 matched the retry loop",
        "17:19 Web login success stayed at 99.8%",
      ],
      runbook: [
        "Confirm which mobile app version created the retry spike.",
        "Limit repeated token refresh retries.",
        "Notify the mobile release owner.",
        "Keep web login metrics separate from mobile retry noise.",
      ],
      timeline: ["New login alert added", "Owner assignment pending"],
    };

    setIncidents((current) => [nextIncident, ...current]);
    setSelectedId(nextIncident.id);
    requestAnimationFrame(() => scrollToSection("Response", "response"));
  }

  async function reviewIncident() {
    setReviewLoading(true);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId: selectedIncident.id,
          severity: selectedIncident.severity,
          service: selectedIncident.service,
          logs: selectedIncident.logs,
          risk: selectedIncident.risk,
        }),
      });

      if (!response.ok) {
        throw new Error("Review request failed");
      }

      const payload = (await response.json()) as {
        recommendation: string;
      };

      setReviewNote(payload.recommendation);
    } catch {
      setReviewNote(
        "Keep the current response plan active and watch the selected service until the trend improves.",
      );
    } finally {
      setReviewLoading(false);
    }
  }

  return (
    <main className="command-shell">
      <header className="mission-bar">
        <a className="brand" href="#command" aria-label="SignalDesk home">
          <span>SD</span>
          <strong>SignalDesk</strong>
        </a>

        <nav className="mission-nav" aria-label="Primary sections">
          {navItems.map((item) => (
            <button
              className={activeView === item.label ? "active" : ""}
              key={item.label}
              onClick={() => scrollToSection(item.label, item.target)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mission-status" aria-label="Current response status">
          <span>Live response</span>
          <strong>{openIncidentCount} open</strong>
        </div>
      </header>

      <section className="command-grid" id="command">
        <aside className="signal-rail" aria-label="Response summary">
          <div className="rail-block priority">
            <span className="eyebrow">On-call owner</span>
            <strong>{selectedIncident.owner}</strong>
            <p>
              {selectedIncident.service} / {selectedService.state}
            </p>
          </div>

          <div className="rail-block">
            <span className="eyebrow">Services</span>
            <div className="rail-services">
              {services.map((service) => (
                <button
                  className={service.name === selectedIncident.service ? "selected" : ""}
                  key={service.name}
                  onClick={() => {
                    const linkedIncident = incidents.find(
                      (incident) => incident.service === service.name,
                    );
                    if (linkedIncident) {
                      setSelectedId(linkedIncident.id);
                    }
                  }}
                  type="button"
                >
                  <i className={service.status} />
                  <span>{service.code}</span>
                  <b>{service.load}%</b>
                </button>
              ))}
            </div>
          </div>

          <div className="rail-block">
            <span className="eyebrow">Quick summary</span>
            <p className="handoff-copy">
              Priority: {selectedPriority}. Risk: {selectedIncident.risk}. Status:{" "}
              {selectedIncident.status}.
            </p>
          </div>
        </aside>

        <section className="war-room">
          <section className="hero-console">
            <div className="hero-copy">
              <p className="eyebrow">Incident response workspace</p>
              <h1>See what broke, where it is, and what to do next.</h1>
              <p>
                SignalDesk helps response teams track active incidents by service,
                location, customer risk, owner, and next step.
              </p>
              <div className="info-summary" aria-label="What SignalDesk does">
                <article>
                  <strong>Command</strong>
                  <span>Shows the main incident, affected service, owner, and risk at a glance.</span>
                </article>
                <article>
                  <strong>Regions</strong>
                  <span>Switches between U.S. states, U.S. regions, and global coverage.</span>
                </article>
                <article>
                  <strong>Response</strong>
                  <span>Turns evidence into a simple plan the team can follow and update.</span>
                </article>
              </div>
              <div className="hero-actions">
                <button
                  className="primary-action"
                  disabled={reviewLoading}
                  onClick={reviewIncident}
                  type="button"
                >
                  {reviewLoading ? "Reviewing" : "Review incident"}
                </button>
                <button className="secondary-action" onClick={ingestAlert} type="button">
                  Add incoming alert
                </button>
              </div>
            </div>

            <div className="impact-dial" aria-label="Selected incident impact">
              <div className="dial-core">
                <span>{selectedPriority}</span>
                <strong>{selectedIncident.confidence}%</strong>
                <p>clear evidence</p>
              </div>
              <div className="dial-meta">
                <span>{selectedIncident.id}</span>
                <b>{selectedService.state}</b>
              </div>
            </div>
          </section>

          <section className="stat-strip" aria-label="Response metrics">
            {responseStats.map((stat) => (
              <article key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <p>{stat.detail}</p>
              </article>
            ))}
          </section>

          <section className="scope-panel" id="regions" aria-labelledby="regions-title">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Coverage scope</p>
                <h2 id="regions-title">Choose how wide the incident view should be</h2>
                <p className="panel-note">
                  Use states for local impact, regions for routing decisions, and global for worldwide service health.
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
                  <span className={`state-pill ${row.status}`}>{statusLabel[row.status]}</span>
                  <strong>{row.place}</strong>
                  <p>{row.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="operations-layout">
            <article className="topology-panel" aria-labelledby="topology-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">What is affected</p>
                  <h2 id="topology-title">Service map</h2>
                  <p className="panel-note">
                    Shows the systems connected to the selected incident and where risk can spread.
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
                {services.map((service) => (
                  <button
                    className={`map-node ${service.status} ${
                      selectedService.name === service.name ? "active" : ""
                    }`}
                    key={service.name}
                    onClick={() => {
                      const linkedIncident = incidents.find(
                        (incident) => incident.service === service.name,
                      );
                      if (linkedIncident) {
                        setSelectedId(linkedIncident.id);
                      }
                    }}
                    style={{ left: `${service.x}%`, top: `${service.y}%` }}
                    type="button"
                  >
                    <span>{service.code}</span>
                    <small>{service.state}</small>
                  </button>
                ))}
              </div>

              <div className="radius-list" aria-label="Affected areas">
                {selectedIncident.blastRadius.map((area) => (
                  <span key={area}>{area}</span>
                ))}
              </div>
            </article>

            <article className="briefing-panel" id="response" aria-labelledby="briefing-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Response plan</p>
                  <h2 id="briefing-title">{selectedIncident.id}</h2>
                  <p className="panel-note">
                    Plain summary of what is wrong, who owns it, and what should happen next.
                  </p>
                </div>
                <span className={`severity ${selectedIncident.severity.toLowerCase()}`}>
                  {selectedPriority}
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
                <span>Review result</span>
                <p>{reviewNote}</p>
              </div>

              <div className="status-actions">
                <button onClick={() => updateIncidentStatus("Mitigating")} type="button">
                  Mark mitigating
                </button>
                <button onClick={() => updateIncidentStatus("Monitoring")} type="button">
                  Mark monitoring
                </button>
                <button onClick={() => updateIncidentStatus("Resolved")} type="button">
                  Mark resolved
                </button>
              </div>
            </article>
          </section>

          <section className="workbench">
            <article className="incident-ledger" id="incidents" aria-labelledby="ledger-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Incidents</p>
                  <h2 id="ledger-title">Active response queue</h2>
                  <p className="panel-note">
                    Click an incident to update the service map, response plan, runbook, and evidence notes.
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
                {filteredIncidents.map((incident) => {
                  const incidentService =
                    services.find((service) => service.name === incident.service) ??
                    services[0];

                  return (
                    <button
                      className={selectedIncident.id === incident.id ? "selected" : ""}
                      key={incident.id}
                      onClick={() => setSelectedId(incident.id)}
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

            <article className="runbook-panel" aria-labelledby="runbook-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Runbook</p>
                  <h2 id="runbook-title">Steps to follow</h2>
                  <p className="panel-note">
                    Concrete actions the assigned team can take right now.
                  </p>
                </div>
              </div>
              <ol className="runbook-list">
                {selectedIncident.runbook.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>
          </section>

          <section className="telemetry-grid">
            <article className="terminal-panel" aria-labelledby="terminal-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Evidence</p>
                  <h2 id="terminal-title">Signals checked</h2>
                  <p className="panel-note">
                    Short evidence notes that explain why the response plan was chosen.
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
                    Records what changed as the team investigates, fixes, watches, and closes the incident.
                  </p>
                </div>
              </div>
              <ol className="timeline-list">
                {selectedIncident.timeline.map((event) => (
                  <li key={event}>{event}</li>
                ))}
              </ol>
            </article>

            <article className="report-panel" id="reports" aria-labelledby="report-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Reports</p>
                  <h2 id="report-title">Weekly priority mix</h2>
                  <p className="panel-note">
                    Shows whether the team is mostly handling critical work, normal issues, or low-value noise.
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
          </section>
        </section>
      </section>
    </main>
  );
}
