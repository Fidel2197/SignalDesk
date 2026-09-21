export type ViewName =
  | "Command"
  | "Guide"
  | "Incidents"
  | "Response"
  | "Regions"
  | "Signals"
  | "Reports";
export type ServiceStatus = "stable" | "watch" | "critical";
export type IncidentStatus = "Investigating" | "Mitigating" | "Monitoring" | "Resolved";
export type Severity = "Critical" | "High" | "Medium";
export type CoverageScope = "U.S. States" | "U.S. Regions" | "Global";
export type ExternalStatus = "operational" | "degraded" | "incident" | "unknown";

export type Service = {
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

export type Incident = {
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
  logs: string[];
  runbook: string[];
  timeline: string[];
};

export type ScopeRow = {
  place: string;
  status: ServiceStatus;
  detail: string;
};

export type ExternalSignal = {
  provider: string;
  status: ExternalStatus;
  summary: string;
  affected: string[];
  focus: string;
  updatedAt: string | null;
  sourceUrl: string;
};

export type SignalsPayload = {
  generatedAt?: string;
  mode: "live" | "partial" | "fallback";
  attentionCount: number;
  summary: string;
  signals: ExternalSignal[];
};
