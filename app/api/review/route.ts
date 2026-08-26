import { NextResponse } from "next/server";

type ReviewRequest = {
  incidentId?: string;
  severity?: "Critical" | "High" | "Medium";
  service?: string;
  logs?: string[];
  risk?: string;
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

export async function POST(request: Request) {
  const body = (await request.json()) as ReviewRequest;
  const logs = body.logs ?? [];
  const severity = body.severity ?? "Medium";
  const evidenceScore = scoreEvidence(logs);
  const priorityScore = Math.min(evidenceScore + priorityWeight[severity], 100);
  const version = Math.floor(Date.now() / 1000);

  const recommendation =
    priorityScore >= 90
      ? `Treat ${body.service} as the top priority. The evidence points to ${body.risk?.toLowerCase() ?? "customer risk"}, so keep the response active and prepare rollback steps.`
      : priorityScore >= 70
        ? `Keep ${body.service} in active fix mode. There is enough evidence for owner follow-up, and the selected runbook is the right next move.`
        : `Keep ${body.service} in monitoring. The issue looks contained, so watch the trend before closing it.`;

  return NextResponse.json({
    version,
    priorityScore,
    recommendation,
    evidenceUsed: logs.slice(0, 4),
  });
}
