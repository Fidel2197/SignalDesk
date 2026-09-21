import type { ExternalStatus, Severity } from "./types";

type ReviewRequest = {
  severity: Severity;
  service: string;
  logs: string[];
  risk: string;
  externalSignals?: { provider: string; status: ExternalStatus }[];
};
const bounded = (value: unknown, limit: number): value is string => typeof value === "string" && value.trim().length > 0 && value.length <= limit;

export function parseReviewRequest(value: unknown): ReviewRequest {
  if (!value || typeof value !== "object") throw new Error("Invalid input");
  const body = value as ReviewRequest;
  if (!["Critical", "High", "Medium"].includes(body.severity) || !bounded(body.service, 120) || !bounded(body.risk, 240) ||
      !Array.isArray(body.logs) || body.logs.length > 30 || !body.logs.every((line) => bounded(line, 500))) {
    throw new Error("Invalid scenario evidence");
  }
  if (body.externalSignals !== undefined && (!Array.isArray(body.externalSignals) || body.externalSignals.length > 3 ||
      !body.externalSignals.every((item) => item && bounded(item.provider, 80) && ["operational", "degraded", "incident", "unknown"].includes(item.status)))) {
    throw new Error("Invalid public status context");
  }
  return body;
}

export function buildReview(body: ReviewRequest) {
  const logs = body.logs.join(" ").toLowerCase();
  const evidenceScore = Math.min(30 + (/timeout|latency/.test(logs) ? 18 : 0) +
    (/queue|dead_letter/.test(logs) ? 16 : 0) + (/deploy|policy/.test(logs) ? 12 : 0), 96);
  const priorityScore = Math.min(evidenceScore + { Critical: 40, High: 27, Medium: 14 }[body.severity], 100);
  const signals = body.externalSignals ?? [];
  const issueProviders = signals.filter((signal) => ["degraded", "incident"].includes(signal.status)).map((signal) => signal.provider);
  const unavailable = signals.length < 3 || signals.some((signal) => signal.status === "unknown");
  const externalSignalNote = (issueProviders.length ? `Public issue reports: ${issueProviders.join(", ")}. ` : "") +
    (unavailable ? "Some public status checks are unavailable or missing. " : issueProviders.length ? "" : "The checked providers report normal service. ") +
    "Provider status is separate context and does not prove the cause of this practice scenario.";
  const action = priorityScore >= 90 ? "Prioritize rollback preparation and owner follow-up" :
    priorityScore >= 70 ? "Follow the runbook and compare the evidence before changing status" :
    "Review the available evidence and monitor the scenario before closing it";
  return {
    priorityScore,
    recommendation: `Rule-based practice review for ${body.service}: ${action}. Scenario risk: ${body.risk.toLowerCase()}. ${externalSignalNote}`,
    evidenceUsed: body.logs.slice(0, 4), externalSignalNote,
  };
}
