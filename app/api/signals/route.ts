import { NextResponse } from "next/server";

type StatusValue = "operational" | "degraded" | "incident" | "unknown";

type StatusPageComponent = {
  name?: string;
  status?: string;
};

type StatusPageIncident = {
  name?: string;
  status?: string;
  impact?: string;
};

type StatusPagePayload = {
  page?: {
    updated_at?: string;
  };
  status?: {
    indicator?: string;
    description?: string;
  };
  components?: StatusPageComponent[];
  incidents?: StatusPageIncident[];
};

type SignalSource = {
  provider: string;
  url: string;
  sourceUrl: string;
  focus: string;
};

const sources: SignalSource[] = [
  {
    provider: "GitHub",
    url: "https://www.githubstatus.com/api/v2/summary.json",
    sourceUrl: "https://www.githubstatus.com",
    focus: "Code hosting, pull requests, actions, and repository access",
  },
  {
    provider: "Vercel",
    url: "https://www.vercel-status.com/api/v2/summary.json",
    sourceUrl: "https://www.vercel-status.com",
    focus: "Deployments, builds, hosting, and edge delivery",
  },
  {
    provider: "Cloudflare",
    url: "https://www.cloudflarestatus.com/api/v2/summary.json",
    sourceUrl: "https://www.cloudflarestatus.com",
    focus: "Network, DNS, edge traffic, and regional availability",
  },
];

function statusFromPayload(payload: StatusPagePayload): StatusValue {
  const activeIncidents = payload.incidents?.filter(
    (incident) => incident.status && incident.status !== "resolved",
  );

  if (activeIncidents?.length) {
    return "incident";
  }

  const affectedComponents = payload.components?.filter(
    (component) => component.status && component.status !== "operational",
  );

  if (affectedComponents?.length) {
    return "degraded";
  }

  if (payload.status?.indicator && payload.status.indicator !== "none") {
    return "degraded";
  }

  return "operational";
}

function summaryFor(
  source: SignalSource,
  payload: StatusPagePayload,
  status: StatusValue,
  affected: string[],
) {
  if (status === "operational") {
    return `${source.provider} is reporting normal service for ${source.focus.toLowerCase()}.`;
  }

  if (affected.length) {
    return `${source.provider} is reporting attention needed around ${affected
      .slice(0, 3)
      .join(", ")}.`;
  }

  return (
    payload.status?.description ??
    `${source.provider} is reporting a service issue that should be checked before closing related incidents.`
  );
}

async function fetchWithTimeout(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    return await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function readSource(source: SignalSource) {
  const response = await fetchWithTimeout(source.url);

  if (!response.ok) {
    throw new Error(`${source.provider} returned ${response.status}`);
  }

  const payload = (await response.json()) as StatusPagePayload;
  const status = statusFromPayload(payload);
  const affected = [
    ...(payload.components ?? [])
      .filter((component) => component.status && component.status !== "operational")
      .map((component) => component.name ?? "Unnamed component"),
    ...(payload.incidents ?? [])
      .filter((incident) => incident.status && incident.status !== "resolved")
      .map((incident) => incident.name ?? "Active incident"),
  ].slice(0, 5);

  return {
    provider: source.provider,
    status,
    summary: summaryFor(source, payload, status, affected),
    affected,
    focus: source.focus,
    updatedAt: payload.page?.updated_at ?? null,
    sourceUrl: source.sourceUrl,
  };
}

export async function GET() {
  const settled = await Promise.allSettled(sources.map((source) => readSource(source)));
  const signals = settled.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }

    const source = sources[index];

    return {
      provider: source.provider,
      status: "unknown" as const,
      summary: `${source.provider} could not be checked right now. Keep working from the local incident evidence and reopen the source if the issue looks connected.`,
      affected: [],
      focus: source.focus,
      updatedAt: null,
      sourceUrl: source.sourceUrl,
    };
  });

  const attentionCount = signals.filter((signal) =>
    ["degraded", "incident", "unknown"].includes(signal.status),
  ).length;
  const checkedCount = signals.filter((signal) => signal.status !== "unknown").length;

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    mode: checkedCount === signals.length ? "live" : checkedCount > 0 ? "partial" : "fallback",
    attentionCount,
    summary:
      attentionCount === 0
        ? "Public sources look normal. The selected incident can stay focused on internal evidence."
        : "One or more public sources need a quick check before the response is closed.",
    signals,
  });
}
