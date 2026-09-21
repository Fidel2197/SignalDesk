import { useCallback, useEffect, useRef, useState } from "react";
import { fallbackSignals } from "../lib/practice-data";
import type { SignalsPayload } from "../lib/types";

export function usePublicSignals() {
  const [signals, setSignals] = useState(fallbackSignals);
  const [summary, setSummary] = useState("Checking public provider status pages…");
  const [mode, setMode] = useState<SignalsPayload["mode"]>("fallback");
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const sequence = useRef(0);
  const load = useCallback(async () => {
    const request = ++sequence.current;
    try {
      const response = await fetch("/api/signals", { cache: "no-store", signal: AbortSignal.timeout(12_000) });
      if (!response.ok) throw new Error("Public source check failed");
      const payload = await response.json() as SignalsPayload;
      if (!Array.isArray(payload.signals) || payload.signals.length !== 3 ||
          !["live", "partial", "fallback"].includes(payload.mode) || typeof payload.summary !== "string" ||
          !payload.signals.every((item) => item && typeof item.provider === "string" && typeof item.summary === "string" &&
            ["operational", "degraded", "incident", "unknown"].includes(item.status) && Array.isArray(item.affected))) {
        throw new Error("Invalid public source response");
      }
      if (request !== sequence.current) return;
      setSignals(payload.signals); setSummary(payload.summary); setMode(payload.mode);
      setCheckedAt(new Date().toISOString());
    } catch {
      if (request !== sequence.current) return;
      setSignals(fallbackSignals.map((item) => ({ ...item, summary: `${item.provider} could not be checked. Open the source to verify its current status.` })));
      setSummary("Public sources could not be checked. Their current status is unknown; practice incidents are still available.");
      setMode("fallback"); setCheckedAt(null);
    } finally {
      if (request === sequence.current) setLoading(false);
    }
  }, []);
  const refresh = useCallback(() => {
    setLoading(true);
    return load();
  }, [load]);
  useEffect(() => {
    let active = true;
    // Defer the initial request until mount completes; a Strict Mode cleanup
    // cancels the queued work before it can start a duplicate request.
    queueMicrotask(() => { if (active) void load(); });
    return () => { active = false; sequence.current += 1; };
  }, [load]);
  return { signals, signalSummary: summary, signalMode: mode, checkedAt, loading, refresh };
}
