import { NextResponse } from "next/server";

type TriageRequest = {
  incidentId?: string;
  severity?: "SEV-1" | "SEV-2" | "SEV-3";
  service?: string;
  logs?: string[];
  risk?: string;
};

const severityWeight = {
  "SEV-1": 40,
  "SEV-2": 27,
  "SEV-3": 14,
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

export async function POST(request: Request) {
  const body = (await request.json()) as TriageRequest;
  const logs = body.logs ?? [];
  const severity = body.severity ?? "SEV-3";
  const evidenceScore = scoreEvidence(logs);
  const priorityScore = Math.min(evidenceScore + severityWeight[severity], 100);
  const version = Math.floor(Date.now() / 1000);

  const recommendation =
    priorityScore >= 90
      ? `Escalate ${body.incidentId} for ${body.service}. Evidence points to ${body.risk?.toLowerCase() ?? "customer risk"} with enough signal to keep a bridge active and prepare rollback steps.`
      : priorityScore >= 70
        ? `Keep ${body.incidentId} in active mitigation. The logs have enough signal for owner follow-up, but the response can stay focused on the selected runbook.`
        : `Keep ${body.incidentId} in monitoring. Current evidence suggests the issue is contained, so continue checking trend lines before closing.`;

  return NextResponse.json({
    version,
    priorityScore,
    recommendation,
    evidenceUsed: logs.slice(0, 4),
  });
}
