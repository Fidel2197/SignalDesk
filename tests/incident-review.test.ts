import { describe, expect, it } from "vitest";
import { POST } from "../app/api/review/route";
import { buildReview, parseReviewRequest } from "../lib/incident-review";

const valid = { severity: "High", service: "Checkout", risk: "Payment delays", logs: ["latency increased"] };
const request = (body: string) => new Request("http://localhost/api/review", { method: "POST", body });

describe("rule-based incident review", () => {
  it.each(["{", "null", JSON.stringify({ ...valid, logs: "not an array" }), JSON.stringify({ ...valid, severity: "unknown" }), JSON.stringify({ ...valid, externalSignals: [null] })])("rejects invalid API input without returning a recommendation", async (body) => {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect(await response.json()).not.toHaveProperty("recommendation");
  });

  it("rejects oversized bodies", async () => {
    expect((await POST(request(" ".repeat(33_000)))).status).toBe(413);
  });

  it("generates a bounded review and calls missing external checks unavailable", async () => {
    const response = await POST(request(JSON.stringify(valid)));
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.priorityScore).toBeLessThanOrEqual(100);
    expect(result.recommendation).toContain("Rule-based practice review");
    expect(result.externalSignalNote).toContain("unavailable or missing");
  });

  it("does not inflate scenario severity because an unrelated provider is down", () => {
    const base = parseReviewRequest(valid);
    const withIssue = parseReviewRequest({ ...valid, externalSignals: [{ provider: "GitHub", status: "incident" }] });
    expect(buildReview(withIssue).priorityScore).toBe(buildReview(base).priorityScore);
    expect(buildReview(withIssue).externalSignalNote).toContain("does not prove the cause");
  });
});
