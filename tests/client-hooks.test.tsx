// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useIncidentReview } from "../hooks/use-incident-review";
import { usePublicSignals } from "../hooks/use-public-signals";
import { usePracticeWorkspace } from "../hooks/use-practice-workspace";
import { initialIncidents } from "../lib/practice-data";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); localStorage.clear(); });

describe("client error and persistence behavior", () => {
  it("restores saved changes when the workspace hook mounts again", async () => {
    const first = renderHook(() => usePracticeWorkspace());
    await waitFor(() => expect(first.result.current.ready).toBe(true));
    act(() => { first.result.current.updateStatus("INC-1048", "Resolved"); first.result.current.toggleStep("INC-1048", 1); });
    first.unmount();
    const next = renderHook(() => usePracticeWorkspace());
    await waitFor(() => expect(next.result.current.incidents[0].status).toBe("Resolved"));
    expect(next.result.current.completed["INC-1048"]).toEqual([1]);
  });

  it("shows an explicit failed review instead of fabricating success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("failure", { status: 503 })));
    const hook = renderHook(() => useIncidentReview());
    await act(async () => { await hook.result.current.review(initialIncidents[0], []); });
    expect(hook.result.current.noteFor(initialIncidents[0].id)).toContain("No new recommendation was generated");
    expect(hook.result.current.reviewLoading).toBe(false);
    expect(hook.result.current.noteFor(initialIncidents[1].id)).not.toContain("No new recommendation");
  });

  it("keeps a late review result attached to its original incident and discards it after reset", async () => {
    let finish!: (response: Response) => void;
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => new Promise<Response>((resolve) => { finish = resolve; })));
    const hook = renderHook(() => useIncidentReview());
    let pending!: Promise<void>;
    act(() => { pending = hook.result.current.review(initialIncidents[0], []); });
    act(() => hook.result.current.clear());
    await act(async () => { finish(Response.json({ recommendation: "Old result" })); await pending; });
    expect(hook.result.current.noteFor(initialIncidents[0].id)).not.toBe("Old result");
  });

  it("clears stale healthy status when a refresh fails", async () => {
    const signals = ["GitHub", "Vercel", "Cloudflare"].map((provider) => ({ provider, status: "operational", summary: "Normal", affected: [], focus: "Status", sourceUrl: "https://example.com", updatedAt: null }));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(Response.json({ signals, mode: "live", summary: "Normal" })).mockRejectedValueOnce(new Error("offline")));
    const hook = renderHook(() => usePublicSignals());
    await waitFor(() => expect(hook.result.current.signalMode).toBe("live"));
    await act(async () => { await hook.result.current.refresh(); });
    expect(hook.result.current.signals.every((item) => item.status === "unknown")).toBe(true);
    expect(hook.result.current.checkedAt).toBeNull();
    expect(hook.result.current.signalSummary).toContain("could not be checked");
  });
});
