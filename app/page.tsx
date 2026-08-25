"use client";

import { useMemo, useState } from "react";

type ServiceStatus = "stable" | "watch" | "critical";
type IncidentStatus = "Investigating" | "Mitigating" | "Monitoring" | "Resolved";
type Severity = "SEV-1" | "SEV-2" | "SEV-3";

type Service = {
  name: string;
  code: string;
  status: ServiceStatus;
  region: string;
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

const services: Service[] = [
  {
    name: "Payments API",
    code: "PAY",
    status: "watch",
    region: "us-central",
    owner: "Platform",
    latency: 412,
    load: 78,
    uptime: "99.91%",
    x: 24,
    y: 38,
  },
  {
    name: "Auth Gateway",
    code: "AUTH",
    status: "stable",
    region: "global",
    owner: "Security",
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
    region: "us-east",
    owner: "Commerce",
    latency: 860,
    load: 91,
    uptime: "98.72%",
    x: 72,
    y: 55,
  },
  {
    name: "Notification Worker",
    code: "MSG",
    status: "stable",
    region: "us-west",
    owner: "Growth",
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
    region: "us-central",
    owner: "Platform",
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
    title: "Checkout latency above response threshold",
    severity: "SEV-2",
    status: "Investigating",
    service: "Payments API",
    owner: "Maya Chen",
    started: "14 min ago",
    risk: "Revenue impact",
    confidence: 92,
    impact: "Checkout remains available, but confirmation requests are waiting on the tax lookup path.",
    rootCause:
      "The latency increase lines up with deploy 6f93c2 and a tax-region cache change. Error rate is steady, which points to a slow dependency rather than an outage.",
    nextAction:
      "Shift a controlled slice of checkout traffic back to the previous worker and compare tax lookup timing across both pools.",
    blastRadius: ["Checkout confirmation", "Tax lookup", "Order receipt timing"],
    tags: ["api", "latency", "checkout"],
    logs: [
      "17:06:12 payments-api p95=412ms p99=932ms state=watch",
      "17:07:03 tax-lookup retry_count=124 timeout_rate=3.8%",
      "17:08:26 edge-router shifted checkout-us-central to pool-b",
      "17:09:44 deploy 6f93c2 enabled tax_region_cache",
    ],
    runbook: [
      "Compare checkout pool latency against last stable deployment.",
      "Route 20% of checkout traffic to the previous worker.",
      "Watch payment confirmation and tax lookup p95 for 10 minutes.",
      "Promote rollback if customer confirmation delay remains elevated.",
    ],
    timeline: [
      "Alert opened from checkout p95 threshold",
      "Deployment drift matched by response engine",
      "Platform owner paged",
    ],
  },
  {
    id: "INC-1047",
    title: "Inventory queue backlog increasing",
    severity: "SEV-1",
    status: "Mitigating",
    service: "Inventory Sync",
    owner: "Andre Patel",
    started: "31 min ago",
    risk: "Order accuracy",
    confidence: 88,
    impact: "A subset of product pages may show stale availability while delayed events replay.",
    rootCause:
      "A queue policy update reduced consumer concurrency during a high-volume order window. Backlog is concentrated in east-region warehouse events.",
    nextAction:
      "Restore worker concurrency to baseline, replay delayed inventory events, and keep stale availability banners active until lag clears.",
    blastRadius: ["Warehouse events", "Product availability", "Checkout stock checks"],
    tags: ["queue", "orders", "sync"],
    logs: [
      "16:48:01 inventory-sync queue_depth=18422 consumers=8",
      "16:51:20 warehouse-east lag=18m dead_letter=337",
      "16:54:12 policy update max_consumers 18 -> 8",
      "17:02:33 replay window prepared for delayed inventory events",
    ],
    runbook: [
      "Restore consumer concurrency to 18.",
      "Replay delayed events from the dead-letter queue.",
      "Compare warehouse-east lag with warehouse-west baseline.",
      "Close stale availability banner after lag drops under 90 seconds.",
    ],
    timeline: [
      "Incident escalated to SEV-1",
      "Commerce owner joined bridge",
      "Concurrency rollback prepared",
    ],
  },
  {
    id: "INC-1046",
    title: "Push notification delivery dip",
    severity: "SEV-3",
    status: "Monitoring",
    service: "Notification Worker",
    owner: "Nia Brooks",
    started: "52 min ago",
    risk: "Engagement delay",
    confidence: 76,
    impact: "Receipt and marketing notifications may arrive several minutes late.",
    rootCause:
      "External provider throttling increased retry volume. Internal workers are healthy and the queue is burning down.",
    nextAction:
      "Keep nonessential campaigns paused until provider rate limits normalize and retry volume stays below threshold.",
    blastRadius: ["Receipt notifications", "Campaign sends", "Provider retry queue"],
    tags: ["worker", "provider", "retry"],
    logs: [
      "16:15:44 notification-worker retry_queue=2180 provider=throttled",
      "16:24:18 campaign_scheduler paused nonessential sends",
      "16:39:02 provider throttle window reduced to 12%",
      "17:01:58 retry_queue=620 trend=down",
    ],
    runbook: [
      "Keep nonessential campaigns paused.",
      "Monitor retry queue burn-down.",
      "Verify receipts are delivered before campaign traffic resumes.",
      "Restore scheduled sends after provider throttling clears.",
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

const navItems = ["Command", "Incidents", "Response", "Telemetry", "Reports"];

const responseStats = [
  { label: "Active bridge", value: "3", detail: "teams engaged" },
  { label: "Containment", value: "71%", detail: "blast radius reduced" },
  { label: "MTTR trend", value: "18m", detail: "6m faster today" },
  { label: "Evidence score", value: "92", detail: "high signal quality" },
];

const severityBars = [
  { label: "SEV-1", value: 32 },
  { label: "SEV-2", value: 64 },
  { label: "SEV-3", value: 46 },
  { label: "Noise", value: 22 },
];

const statusLabel: Record<ServiceStatus, string> = {
  stable: "Stable",
  watch: "Watch",
  critical: "Critical",
};

export default function Home() {
  const [activeView, setActiveView] = useState("Command");
  const [filter, setFilter] = useState<(typeof statusOptions)[number]>("All");
  const [incidents, setIncidents] = useState(initialIncidents);
  const [selectedId, setSelectedId] = useState(initialIncidents[0].id);
  const [triageVersion, setTriageVersion] = useState(1);
  const [triageNote, setTriageNote] = useState(
    "Response engine standing by. Run triage to compare the selected incident against service logs, ownership, severity, and customer impact.",
  );
  const [triageLoading, setTriageLoading] = useState(false);

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

  function updateIncidentStatus(status: IncidentStatus) {
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === selectedIncident.id
          ? {
              ...incident,
              status,
              timeline: [
                `${status} state recorded by incident commander`,
                ...incident.timeline,
              ],
            }
          : incident,
      ),
    );
  }

  function ingestAlert() {
    const nextIncident: Incident = {
      id: `INC-${1049 + incidents.length}`,
      title: "Mobile auth retry burst",
      severity: "SEV-2",
      status: "Investigating",
      service: "Auth Gateway",
      owner: "Unassigned",
      started: "just now",
      risk: "Login reliability",
      confidence: 81,
      impact: "Some mobile users may need to retry sign-in after app resume.",
      rootCause:
        "Mobile build 8.14.2 is sending expired refresh tokens after resume. Web authentication is unaffected.",
      nextAction:
        "Rate-limit noisy retries, page mobile release ownership, and verify refresh token rotation in the latest build.",
      blastRadius: ["Mobile login", "Token refresh", "Session resume"],
      tags: ["auth", "mobile", "tokens"],
      logs: [
        "17:18:04 auth-gateway token_refresh failures=186 device=mobile",
        "17:18:21 mobile build 8.14.2 elevated retry loop",
        "17:18:59 web login success_rate=99.8%",
      ],
      runbook: [
        "Identify mobile app version tied to retry spike.",
        "Rate-limit repeated token refresh failures.",
        "Notify mobile release owner and compare against previous build.",
        "Keep web auth metrics separate from mobile retry noise.",
      ],
      timeline: ["Alert ingested from auth telemetry", "Owner assignment pending"],
    };

    setIncidents((current) => [nextIncident, ...current]);
    setSelectedId(nextIncident.id);
    setActiveView("Response");
  }

  async function regenerateTriage() {
    setTriageLoading(true);

    try {
      const response = await fetch("/api/triage", {
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
        throw new Error("Triage request failed");
      }

      const payload = (await response.json()) as {
        version: number;
        recommendation: string;
      };

      setTriageVersion(payload.version);
      setTriageNote(payload.recommendation);
    } catch {
      setTriageVersion((version) => version + 1);
      setTriageNote(
        "Local evidence review kept the current response action active while the selected service remains under watch.",
      );
    } finally {
      setTriageLoading(false);
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
              className={activeView === item ? "active" : ""}
              key={item}
              onClick={() => setActiveView(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="mission-status" aria-label="Current response status">
          <span>Live response</span>
          <strong>{openIncidentCount} open</strong>
        </div>
      </header>

      <section className="command-grid" id="command">
        <aside className="signal-rail" aria-label="Response roster">
          <div className="rail-block priority">
            <span className="eyebrow">Current commander</span>
            <strong>{selectedIncident.owner}</strong>
            <p>{selectedIncident.service}</p>
          </div>

          <div className="rail-block">
            <span className="eyebrow">Service posture</span>
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
            <span className="eyebrow">Hand-off packet</span>
            <p className="handoff-copy">
              {selectedIncident.severity} incident on {selectedIncident.service}.
              Risk: {selectedIncident.risk}. Status: {selectedIncident.status}.
            </p>
          </div>
        </aside>

        <section className="war-room">
          <section className="hero-console">
            <div className="hero-copy">
              <p className="eyebrow">AI incident command center</p>
              <h1>Detect the blast radius, brief the team, and move incidents to resolution.</h1>
              <p>
                SignalDesk turns service health, logs, severity, and ownership into a
                clear response plan for engineering teams handling production issues.
              </p>
              <div className="hero-actions">
                <button className="primary-action" onClick={regenerateTriage} type="button">
                  {triageLoading ? "Running triage" : `Run triage v${triageVersion}`}
                </button>
                <button className="secondary-action" onClick={ingestAlert} type="button">
                  Ingest alert
                </button>
              </div>
            </div>

            <div className="impact-dial" aria-label="Selected incident impact">
              <div className="dial-core">
                <span>{selectedIncident.severity}</span>
                <strong>{selectedIncident.confidence}%</strong>
                <p>confidence</p>
              </div>
              <div className="dial-meta">
                <span>{selectedIncident.id}</span>
                <b>{selectedIncident.risk}</b>
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

          <section className="operations-layout">
            <article className="topology-panel" aria-labelledby="topology-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Blast radius map</p>
                  <h2 id="topology-title">Service dependency view</h2>
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
                    <small>{service.latency}ms</small>
                  </button>
                ))}
              </div>

              <div className="radius-list" aria-label="Affected areas">
                {selectedIncident.blastRadius.map((area) => (
                  <span key={area}>{area}</span>
                ))}
              </div>
            </article>

            <article className="briefing-panel" aria-labelledby="briefing-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Response brief</p>
                  <h2 id="briefing-title">{selectedIncident.id}</h2>
                </div>
                <span className={`severity ${selectedIncident.severity.toLowerCase()}`}>
                  {selectedIncident.severity}
                </span>
              </div>

              <h3>{selectedIncident.title}</h3>
              <p className="impact-copy">{selectedIncident.impact}</p>

              <div className="brief-block">
                <span>Likely cause</span>
                <p>{selectedIncident.rootCause}</p>
              </div>

              <div className="brief-block action">
                <span>Recommended action</span>
                <p>{selectedIncident.nextAction}</p>
              </div>

              <div className="brief-block engine">
                <span>Response engine</span>
                <p>{triageNote}</p>
              </div>

              <div className="status-actions">
                <button onClick={() => updateIncidentStatus("Mitigating")} type="button">
                  Mitigate
                </button>
                <button onClick={() => updateIncidentStatus("Monitoring")} type="button">
                  Monitor
                </button>
                <button onClick={() => updateIncidentStatus("Resolved")} type="button">
                  Resolve
                </button>
              </div>
            </article>
          </section>

          <section className="workbench">
            <article className="incident-ledger" aria-labelledby="ledger-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Incident ledger</p>
                  <h2 id="ledger-title">Prioritized response queue</h2>
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
                {filteredIncidents.map((incident) => (
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
                      {incident.service} / {incident.owner} / {incident.started}
                    </small>
                    <b>{incident.status}</b>
                  </button>
                ))}
              </div>
            </article>

            <article className="runbook-panel" aria-labelledby="runbook-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Runbook</p>
                  <h2 id="runbook-title">Next response steps</h2>
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
                  <p className="eyebrow">Evidence terminal</p>
                  <h2 id="terminal-title">Signals used by triage</h2>
                </div>
              </div>
              <div className="terminal-lines">
                {selectedIncident.logs.map((log) => (
                  <code key={log}>{log}</code>
                ))}
              </div>
            </article>

            <article className="timeline-panel" aria-labelledby="timeline-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Timeline</p>
                  <h2 id="timeline-title">Response history</h2>
                </div>
              </div>
              <ol className="timeline-list">
                {selectedIncident.timeline.map((event) => (
                  <li key={event}>{event}</li>
                ))}
              </ol>
            </article>

            <article className="report-panel" aria-labelledby="report-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Severity report</p>
                  <h2 id="report-title">Weekly signal mix</h2>
                </div>
              </div>
              <div className="severity-report">
                {severityBars.map((bar) => (
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
