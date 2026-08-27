import { NextResponse } from "next/server";

type ReviewRequest = {
  incidentId?: string;
  severity?: "Critical" | "High" | "Medium";
  service?: string;
  logs?: string[];
  risk?: string;
  externalSignals?: Array<{
    provider?: string;
    status?: "operational" | "degraded" | "incident" | "unknown";
    summary?: string;
  }>;
};

const priorityWeight = {
  Critical: 40,
  High: 27,
  Medium: 14,
};

function scoreEvidence(logs: string[]) {
  const joinedLogs = logs.join(" ").toLowerCase();
  let score = 30;

  if (joinedLogs.includes("timeout") || joinedLogs.includes("latency")) {
    score += 18;
  }

  if (joinedLogs.includes("queue") || joinedLogs.includes("dead_letter")) {
    score += 16;
  }

  if (joinedLogs.includes("deploy") || joinedLogs.includes("policy")) {
    score += 12;
  }

  return Math.min(score, 96);
}

function summarizeExternalSignals(signals: ReviewRequest["externalSignals"]) {
  const attentionSignals = (signals ?? []).filter(
    (signal) => signal.status && signal.status !== "operational",
  );

  if (!attentionSignals.length) {
    return {
      scoreBoost: 0,
      note:
        "Public status sources do not show a related outside disruption, so keep the response focused on the selected service.",
    };
  }

  const providers = attentionSignals
    .map((signal) => signal.provider)
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");

  return {
    scoreBoost: Math.min(attentionSignals.length * 6, 18),
    note: `Check ${providers} before closing this response because an outside service signal may affect the next step.`,
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as ReviewRequest;
  const logs = body.logs ?? [];
  const severity = body.severity ?? "Medium";
  const evidenceScore = scoreEvidence(logs);
  const externalSignal = summarizeExternalSignals(body.externalSignals);
  const priorityScore = Math.min(
    evidenceScore + priorityWeight[severity] + externalSignal.scoreBoost,
    100,
  );
  const version = Math.floor(Date.now() / 1000);

  const recommendation =
    priorityScore >= 90
      ? `Treat ${body.service} as the top priority. The evidence points to ${body.risk?.toLowerCase() ?? "customer risk"}, so keep the response active and prepare rollback steps. ${externalSignal.note}`
      : priorityScore >= 70
        ? `Keep ${body.service} in active fix mode. There is enough evidence for owner follow-up, and the selected runbook is the right next move. ${externalSignal.note}`
        : `Keep ${body.service} in monitoring. The issue looks contained, so watch the trend before closing it. ${externalSignal.note}`;

  return NextResponse.json({
    version,
    priorityScore,
    recommendation,
    evidenceUsed: logs.slice(0, 4),
    externalSignalNote: externalSignal.note,
  });
}
