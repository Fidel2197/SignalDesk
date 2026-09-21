import { afterEach, describe, expect, it, vi } from "vitest";
import { collectSignals, readSource, sources } from "../lib/public-signals";

const healthy = { status: { indicator: "none" }, components: [], incidents: [] };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
afterEach(() => vi.useRealTimers());

describe("public provider checks", () => {
  it("returns a live operational result only from valid healthy provider responses", async () => {
    const payload = await collectSignals(vi.fn<typeof fetch>().mockImplementation(async () => json(healthy)));
    expect(payload.mode).toBe("live"); expect(payload.attentionCount).toBe(0);
    expect(payload.signals.every((item) => item.status === "operational")).toBe(true);
  });

  it("normalizes active incidents and affected components", async () => {
    const payload = await readSource(sources[0], vi.fn<typeof fetch>().mockResolvedValue(json({
      ...healthy, incidents: [{ name: "Actions delay", status: "investigating" }],
      components: [{ name: "Actions", status: "degraded_performance" }],
    })));
    expect(payload.status).toBe("incident");
    expect(payload.affected).toEqual(["Actions", "Actions delay"]);
  });

  it("isolates provider failures and never treats invalid data as healthy", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(json(healthy))
      .mockResolvedValueOnce(json({ status: "broken" }))
      .mockResolvedValueOnce(json({}, 503));
    const payload = await collectSignals(fetcher);
    expect(payload.mode).toBe("partial"); expect(payload.attentionCount).toBe(2);
    expect(payload.signals.map((item) => item.status)).toEqual(["operational", "unknown", "unknown"]);
  });

  it.each([{}, { ...healthy, components: {} }, { ...healthy, incidents: [null] }])("falls back for malformed provider payload %j", async (payload) => {
    const result = await collectSignals(vi.fn<typeof fetch>().mockImplementation(async () => json(payload)));
    expect(result.mode).toBe("fallback"); expect(result.attentionCount).toBe(3);
  });

  it("aborts a slow provider and returns unknown while other providers remain usable", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (_url, options) => {
      return await new Promise<Response>((_resolve, reject) => {
        options?.signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
      });
    });
    const pending = collectSignals(fetcher);
    await vi.advanceTimersByTimeAsync(3501);
    expect((await pending).mode).toBe("fallback");
  });
});
