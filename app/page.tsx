"use client";

import { useMemo, useState } from "react";

type ServiceStatus = "operational" | "degraded" | "critical";
type IncidentStatus = "Investigating" | "Mitigating" | "Monitoring" | "Resolved";
type Severity = "SEV-1" | "SEV-2" | "SEV-3";

type Service = {
  name: string;
  domain: string;
  status: ServiceStatus;
  latency: number;
  uptime: string;
  owner: string;
  region: string;
  change: string;
  load: number;
  spark: number[];
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
  customerImpact: string;
  summary: string;
  nextAction: string;
  tags: string[];
  logs: string[];
  timeline: string[];
};

const services: Service[] = [
  {
    name: "Payments API",
    domain: "Checkout",
    status: "degraded",
    latency: 412,
    uptime: "99.91%",
    owner: "Platform",
    region: "us-central",
    change: "Deploy 6f93c2",
    load: 78,
    spark: [32, 35, 38, 54, 61, 67, 78],
  },
  {
    name: "Auth Gateway",
    domain: "Identity",
    status: "operational",
    latency: 128,
    uptime: "99.99%",
    owner: "Security",
    region: "global",
    change: "No recent change",
    load: 42,
    spark: [41, 40, 42, 39, 41, 43, 42],
  },
  {
    name: "Inventory Sync",
    domain: "Orders",
    status: "critical",
    latency: 860,
    uptime: "98.72%",
    owner: "Commerce",
    region: "us-east",
    change: "Queue policy edit",
    load: 91,
    spark: [48, 52, 61, 69, 74, 83, 91],
  },
  {
    name: "Notification Worker",
    domain: "Messaging",
    status: "operational",
    latency: 205,
    uptime: "99.95%",
    owner: "Growth",
    region: "us-west",
    change: "Template refresh",
    load: 57,
    spark: [49, 51, 55, 54, 56, 58, 57],
  },
];

const initialIncidents: Incident[] = [
  {
    id: "INC-1048",
    title: "Checkout latency above alert threshold",
    severity: "SEV-2",
    status: "Investigating",
    service: "Payments API",
    owner: "Maya Chen",
    started: "14 min ago",
    risk: "Revenue impact",
    confidence: 92,
    customerImpact: "Customers can still pay, but checkout confirmation is delayed.",
    summary:
      "Latency started after deploy 6f93c2. Error rate is stable, but p95 response time increased across checkout requests using the new tax lookup path.",
    nextAction:
      "Compare the tax lookup dependency latency against the last stable deploy, then route 20% of traffic back to the previous worker.",
    tags: ["api", "latency", "checkout"],
    logs: [
      "17:06:12 payments-api p95=412ms p99=932ms status=degraded",
      "17:07:03 tax-lookup retry_count=124 timeout_rate=3.8%",
      "17:08:26 edge-router shift checkout-us-central to pool-b",
      "17:09:44 deploy 6f93c2 introduced tax_region_cache=true",
    ],
    timeline: [
      "Alert opened from latency threshold",
      "AI triage matched deployment drift",
      "Owner paged: Platform",
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
    customerImpact: "Some users may see stale item availability during checkout.",
    summary:
      "Queue depth climbed after a policy edit reduced consumer concurrency. Backlog is concentrated in two warehouses with high order volume.",
    nextAction:
      "Restore worker concurrency to the previous baseline and replay delayed inventory events from the dead-letter queue.",
    tags: ["queue", "orders", "sync"],
    logs: [
      "16:48:01 inventory-sync queue_depth=18422 consumers=8",
      "16:51:20 warehouse-east lag=18m dead_letter=337",
      "16:54:12 policy update max_consumers 18 -> 8",
      "17:02:33 replay window prepared for delayed events",
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
    customerImpact: "Marketing and receipt notifications may arrive several minutes late.",
    summary:
      "Delivery dipped after provider throttling. Internal workers are healthy and retry volume is decreasing.",
    nextAction:
      "Continue monitoring retry burn-down and keep nonessential campaigns paused until provider rate limits normalize.",
    tags: ["worker", "provider", "retry"],
    logs: [
      "16:15:44 notification-worker retry_queue=2180 provider=throttled",
      "16:24:18 campaign_scheduler paused nonessential sends",
      "16:39:02 provider throttle window reduced to 12%",
      "17:01:58 retry_queue=620 trend=down",
    ],
    timeline: [
      "Provider throttling detected",
      "Campaign traffic reduced",
      "Retry queue trending down",
    ],
  },
];

const metricCards = [
  { label: "Open incidents", value: "3", note: "1 critical", tone: "rose" },
  { label: "Mean time to respond", value: "4m", note: "down 18%", tone: "teal" },
  { label: "Services monitored", value: "12", note: "4 shown", tone: "blue" },
  { label: "AI triage accuracy", value: "89%", note: "seeded demo", tone: "amber" },
];

const severityTrend = [
  { day: "Mon", sev1: 18, sev2: 42, sev3: 64 },
  { day: "Tue", sev1: 26, sev2: 38, sev3: 58 },
  { day: "Wed", sev1: 12, sev2: 44, sev3: 62 },
  { day: "Thu", sev1: 32, sev2: 48, sev3: 70 },
  { day: "Fri", sev1: 22, sev2: 36, sev3: 55 },
  { day: "Sat", sev1: 10, sev2: 24, sev3: 40 },
  { day: "Sun", sev1: 15, sev2: 28, sev3: 46 },
];

const navItems = ["Dashboard", "Incidents", "AI Triage", "Analytics", "Settings"];

const statusLabel: Record<ServiceStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  critical: "Critical",
};

const statusOptions: Array<"All" | IncidentStatus> = [
  "All",
  "Investigating",
  "Mitigating",
  "Monitoring",
  "Resolved",
];

export default function Home() {
  const [activeView, setActiveView] = useState("Dashboard");
  const [filter, setFilter] = useState<(typeof statusOptions)[number]>("All");
  const [incidents, setIncidents] = useState(initialIncidents);
  const [selectedId, setSelectedId] = useState(initialIncidents[0].id);
  const [triageVersion, setTriageVersion] = useState(1);
  const [triageNote, setTriageNote] = useState(
    "Server triage is ready. Regenerate to run the selected incident through the response endpoint.",
  );
  const [triageLoading, setTriageLoading] = useState(false);

  const filteredIncidents = useMemo(() => {
    if (filter === "All") {
      return incidents;
    }
    return incidents.filter((incident) => incident.status === filter);
  }, [filter, incidents]);

  const selectedIncident =
    incidents.find((incident) => incident.id === selectedId) ?? incidents[0];

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
                `${status} update recorded from command center`,
                ...incident.timeline,
              ],
            }
          : incident,
      ),
    );
  }

  function simulateIncident() {
    const nextIncident: Incident = {
      id: `INC-${1049 + incidents.length}`,
      title: "Auth error burst from mobile clients",
      severity: "SEV-2",
      status: "Investigating",
      service: "Auth Gateway",
      owner: "Unassigned",
      started: "just now",
      risk: "Login reliability",
      confidence: 81,
      customerImpact: "A small percentage of mobile users may need to retry sign-in.",
      summary:
        "A new mobile client build is sending expired refresh tokens after app resume. Web traffic remains normal.",
      nextAction:
        "Rate-limit noisy retries, notify mobile release owners, and confirm refresh token rotation in the latest build.",
      tags: ["auth", "mobile", "tokens"],
      logs: [
        "17:18:04 auth-gateway token_refresh failures=186 device=mobile",
        "17:18:21 mobile build 8.14.2 elevated retry loop",
        "17:18:59 web login success_rate=99.8%",
      ],
      timeline: ["Synthetic incident created", "Needs owner assignment"],
    };

    setIncidents((current) => [nextIncident, ...current]);
    setSelectedId(nextIncident.id);
    setActiveView("AI Triage");
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
        "Fallback triage used cached evidence and kept the current response recommendation active.",
      );
    } finally {
      setTriageLoading(false);
    }
  }

  return (
    <main className="signal-shell">
      <aside className="sidebar" aria-label="SignalDesk sections">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            SD
          </div>
          <div>
            <p>SignalDesk</p>
            <span>Incident response</span>
          </div>
        </div>

        <nav className="side-nav">
          {navItems.map((item) => (
            <button
              key={item}
              className={activeView === item ? "active" : ""}
              onClick={() => setActiveView(item)}
              type="button"
            >
              <span aria-hidden="true">{item.slice(0, 2)}</span>
              {item}
            </button>
          ))}
        </nav>

        <section className="response-summary" aria-label="Response summary">
          <p>Current response</p>
          <strong>{openIncidentCount} active incidents</strong>
          <span>Bridge owner: Platform team</span>
        </section>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="section-label">AI Incident Response Dashboard</p>
            <h1>Company service health, triage, and resolution tracking.</h1>
          </div>
          <div className="topbar-actions">
            <button className="ghost-button" type="button" onClick={() => setActiveView("Analytics")}>
              View metrics
            </button>
            <button className="primary-button" type="button" onClick={simulateIncident}>
              Simulate incident
            </button>
          </div>
        </header>

        <section className="metric-grid" aria-label="Operational metrics">
          {metricCards.map((metric) => (
            <article className={`metric-card ${metric.tone}`} key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.note}</p>
            </article>
          ))}
        </section>

        <section className="service-grid" aria-label="Service health cards">
          {services.map((service) => (
            <article className="service-card" key={service.name}>
              <div className="service-heading">
                <div>
                  <p>{service.domain}</p>
                  <h2>{service.name}</h2>
                </div>
                <span className={`status-pill ${service.status}`}>
                  {statusLabel[service.status]}
                </span>
              </div>
              <div className="service-stats">
                <span>
                  <strong>{service.latency}ms</strong>
                  Latency
                </span>
                <span>
                  <strong>{service.uptime}</strong>
                  Uptime
                </span>
              </div>
              <div className="sparkline" aria-label={`${service.name} load trend`}>
                {service.spark.map((height, index) => (
                  <i key={`${service.name}-${index}`} style={{ height: `${height}%` }} />
                ))}
              </div>
              <div className="service-meta">
                <span>{service.owner}</span>
                <span>{service.region}</span>
                <span>{service.change}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="main-grid">
          <article className="panel incident-panel">
            <div className="panel-heading">
              <div>
                <p className="section-label">Incident Queue</p>
                <h2>{activeView === "Incidents" ? "Filtered incident review" : "Highest priority work"}</h2>
              </div>
              <div className="filter-row" aria-label="Incident status filter">
                {statusOptions.map((option) => (
                  <button
                    key={option}
                    className={filter === option ? "active" : ""}
                    onClick={() => setFilter(option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="incident-table" role="table" aria-label="Incidents">
              <div className="incident-row table-head" role="row">
                <span>Incident</span>
                <span>Service</span>
                <span>Status</span>
                <span>Owner</span>
              </div>
              {filteredIncidents.map((incident) => (
                <button
                  className={`incident-row ${selectedIncident.id === incident.id ? "selected" : ""}`}
                  key={incident.id}
                  onClick={() => setSelectedId(incident.id)}
                  type="button"
                >
                  <span>
                    <strong>{incident.id}</strong>
                    {incident.title}
                  </span>
                  <span>{incident.service}</span>
                  <span>
                    <b className={`severity ${incident.severity.toLowerCase()}`}>{incident.severity}</b>
                    {incident.status}
                  </span>
                  <span>{incident.owner}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="panel triage-panel">
            <div className="panel-heading compact">
              <div>
                <p className="section-label">AI Triage</p>
                <h2>{selectedIncident.id}</h2>
              </div>
              <span className="confidence">{selectedIncident.confidence}% confidence</span>
            </div>

            <h3>{selectedIncident.title}</h3>
            <p className="impact-copy">{selectedIncident.customerImpact}</p>

            <div className="triage-block">
              <span>Likely cause</span>
              <p>{selectedIncident.summary}</p>
            </div>
            <div className="triage-block">
              <span>Recommended next action</span>
              <p>{selectedIncident.nextAction}</p>
            </div>
            <div className="triage-block server-note">
              <span>Server-side triage note</span>
              <p>{triageNote}</p>
            </div>

            <div className="tag-list" aria-label="Incident tags">
              {selectedIncident.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <div className="command-row">
              <button type="button" onClick={() => updateIncidentStatus("Mitigating")}>
                Mark mitigating
              </button>
              <button type="button" onClick={() => updateIncidentStatus("Monitoring")}>
                Monitor
              </button>
              <button type="button" onClick={() => updateIncidentStatus("Resolved")}>
                Resolve
              </button>
            </div>
            <button
              className="ghost-button full-width"
              type="button"
              onClick={regenerateTriage}
              disabled={triageLoading}
            >
              {triageLoading ? "Regenerating triage" : `Regenerate triage v${triageVersion}`}
            </button>
          </article>
        </section>

        <section className="lower-grid">
          <article className="panel log-panel">
            <div className="panel-heading compact">
              <div>
                <p className="section-label">Evidence Logs</p>
                <h2>Source signals used by triage</h2>
              </div>
            </div>
            <div className="log-stream" aria-label="Selected incident logs">
              {selectedIncident.logs.map((log) => (
                <code key={log}>{log}</code>
              ))}
            </div>
          </article>

          <article className="panel timeline-panel">
            <div className="panel-heading compact">
              <div>
                <p className="section-label">Timeline</p>
                <h2>Response history</h2>
              </div>
            </div>
            <ol className="timeline">
              {selectedIncident.timeline.map((event) => (
                <li key={event}>{event}</li>
              ))}
            </ol>
          </article>

          <article className="panel analytics-panel">
            <div className="panel-heading compact">
              <div>
                <p className="section-label">Analytics</p>
                <h2>Weekly severity mix</h2>
              </div>
            </div>
            <div className="bar-chart" aria-label="Weekly severity chart">
              {severityTrend.map((day) => (
                <div className="bar-group" key={day.day}>
                  <div className="stack">
                    <i className="sev3" style={{ height: `${day.sev3}%` }} />
                    <i className="sev2" style={{ height: `${day.sev2}%` }} />
                    <i className="sev1" style={{ height: `${day.sev1}%` }} />
                  </div>
                  <span>{day.day}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="settings-strip" aria-label="Project implementation details">
          <div>
            <p className="section-label">Portfolio angle</p>
            <h2>Built to show dashboard UI, incident state, response logic, realistic data, and AI-assisted reasoning.</h2>
          </div>
          <div className="settings-list">
            <span>Next.js</span>
            <span>React</span>
            <span>TypeScript</span>
            <span>Incident workflow</span>
            <span>AI triage simulation</span>
          </div>
        </section>
      </section>
    </main>
  );
}
