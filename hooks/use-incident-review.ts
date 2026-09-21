import { useRef, useState } from "react";
import type { ExternalSignal, Incident } from "../lib/types";

const INITIAL_NOTE = "Run a rule-based review of this scenario. Public provider status is context, not proof of the scenario's cause.";

export function useIncidentReview() {
  const [reviews, setReviews] = useState<Record<string, string>>({});
  const [reviewLoading, setReviewLoading] = useState(false);
  const sequence = useRef(0);
  async function review(incident: Incident, signals: ExternalSignal[]) {
    const request = ++sequence.current;
    setReviewLoading(true);
    let note: string;
    try {
      const response = await fetch("/api/review", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(12_000),
        body: JSON.stringify({ incidentId: incident.id, severity: incident.severity, service: incident.service,
          logs: incident.logs, risk: incident.risk, externalSignals: signals }),
      });
      if (!response.ok) throw new Error("Review request failed");
      const payload = await response.json();
      if (typeof payload.recommendation !== "string" || !payload.recommendation.trim()) throw new Error("Invalid review");
      note = payload.recommendation;
    } catch {
      note = "Review unavailable. No new recommendation was generated. The scenario's original runbook remains available; try the review again.";
    }
    if (request === sequence.current) {
      setReviews((current) => ({ ...current, [incident.id]: note }));
      setReviewLoading(false);
    }
  }
  function clear() {
    sequence.current += 1;
    setReviews({}); setReviewLoading(false);
  }
  return { reviewLoading, review, clear, noteFor: (id: string) => reviews[id] ?? INITIAL_NOTE };
}
