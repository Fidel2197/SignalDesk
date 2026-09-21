import { describe, expect, it } from "vitest";
import { createPracticeStore, parseWorkspace, STORAGE_KEY } from "../lib/practice-store";
import { priorityMix } from "../lib/report-summary";

function memoryStorage() {
  const data = new Map<string, string>();
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
}
function loaded(storage = memoryStorage()) {
  const store = createPracticeStore(() => storage);
  store.subscribe(() => {});
  return store;
}

describe("saved practice workspace", () => {
  it("restores status, selection, checklist, and activity after a new page load", () => {
    const storage = memoryStorage();
    const first = loaded(storage);
    first.select("INC-1047");
    first.updateStatus("INC-1047", "Resolved");
    first.toggleStep("INC-1047", 2);
    const reloaded = loaded(storage).getSnapshot();
    expect(reloaded.selectedId).toBe("INC-1047");
    expect(reloaded.incidents.find((item) => item.id === "INC-1047")?.status).toBe("Resolved");
    expect(reloaded.completed["INC-1047"]).toEqual([2]);
    expect(reloaded.incidents.find((item) => item.id === "INC-1047")?.timeline[0]).toContain("Runbook step 3 completed");
  });

  it("keeps added alerts on reload and resets all saved progress explicitly", () => {
    const storage = memoryStorage();
    const store = loaded(storage);
    store.addAlert(); store.updateStatus("PRACTICE-1", "Monitoring");
    expect(loaded(storage).getSnapshot().incidents[0].status).toBe("Monitoring");
    store.reset();
    const reloaded = loaded(storage).getSnapshot();
    expect(reloaded.incidents).toHaveLength(3);
    expect(reloaded.selectedId).toBe("INC-1048");
    expect(reloaded.completed["INC-1048"]).toEqual([]);
  });

  it("rejects corrupt, invalid-version, duplicated, and invalid-step saved data", () => {
    const storage = memoryStorage();
    const store = loaded(storage); store.select("INC-1048");
    const valid = JSON.parse(storage.getItem(STORAGE_KEY)!);
    expect(() => parseWorkspace("{" )).toThrow();
    expect(() => parseWorkspace(JSON.stringify({ ...valid, version: 99 }))).toThrow();
    expect(() => parseWorkspace(JSON.stringify({ ...valid, incidents: [valid.incidents[0], valid.incidents[0], valid.incidents[2]] }))).toThrow();
    valid.incidents[0].completed = [99];
    expect(() => parseWorkspace(JSON.stringify(valid))).toThrow();
    storage.setItem(STORAGE_KEY, "corrupt");
    const restored = loaded(storage).getSnapshot();
    expect(restored.incidents).toHaveLength(3);
    expect(restored.storageMessage).toContain("could not be loaded");
  });

  it("keeps the app usable when browser storage rejects writes", () => {
    const store = loaded({ getItem: () => null, setItem: () => { throw new Error("quota"); } });
    store.updateStatus("INC-1048", "Resolved");
    expect(store.getSnapshot().incidents[0].status).toBe("Resolved");
    expect(store.getSnapshot().storageMessage).toContain("only for this visit");
  });

  it("ignores invalid mutations and duplicate statuses, and bounds alerts", () => {
    const store = loaded();
    const before = store.getSnapshot();
    store.toggleStep("INC-1048", -1); store.select("missing");
    store.updateStatus("INC-1048", "Investigating");
    expect(store.getSnapshot()).toBe(before);
    for (let index = 0; index < 25; index++) store.addAlert();
    expect(store.getSnapshot().incidents).toHaveLength(23);
    expect(new Set(store.getSnapshot().incidents.map((item) => item.id)).size).toBe(23);
  });

  it("calculates reports from the current queue instead of fixed percentages", () => {
    const store = loaded();
    expect(priorityMix(store.getSnapshot().incidents).map((item) => item.count)).toEqual([1, 1, 1]);
    store.addAlert();
    expect(priorityMix(store.getSnapshot().incidents).find((item) => item.label === "High")?.value).toBe(50);
    expect(priorityMix([]).every((item) => item.value === 0)).toBe(true);
  });
});
