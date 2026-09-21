import { initialIncidents, statusOptions } from "./practice-data";
import { createPracticeAlert } from "./practice-alert";
import type { Incident, IncidentStatus } from "./types";

export const STORAGE_KEY = "signaldesk.practice.v1";
const MAX_INCIDENTS = 23;
type SavedIncident = { id: string; status: IncidentStatus; completed: number[]; activity: string[] };
type SavedWorkspace = { version: 1; selectedId: string; incidents: SavedIncident[] };
export type PracticeState = {
  incidents: Incident[];
  selectedId: string;
  completed: Record<string, number[]>;
  ready: boolean;
  storageMessage: string;
};
type StorageAccess = () => Pick<Storage, "getItem" | "setItem">;

const fresh = (): SavedWorkspace => ({
  version: 1,
  selectedId: initialIncidents[0].id,
  incidents: initialIncidents.map(({ id, status }) => ({ id, status, completed: [], activity: [] })),
});

function scenario(id: string): Incident | undefined {
  return initialIncidents.find((incident) => incident.id === id) ??
    (/^PRACTICE-([1-9]|1[0-9]|20)$/.test(id) ? createPracticeAlert(id) : undefined);
}

export function parseWorkspace(raw: string): SavedWorkspace {
  if (raw.length > 100_000) throw new Error("Saved workspace is too large");
  const value = JSON.parse(raw);
  if (!value || value.version !== 1 || !Array.isArray(value.incidents) ||
      value.incidents.length < 3 || value.incidents.length > MAX_INCIDENTS) {
    throw new Error("Invalid saved workspace");
  }
  const ids = new Set<string>();
  for (const item of value.incidents) {
    const source = item && typeof item.id === "string" ? scenario(item.id) : undefined;
    if (!source || ids.has(item.id) || !statusOptions.slice(1).includes(item.status) ||
        !Array.isArray(item.completed) || item.completed.length > source.runbook.length ||
        new Set(item.completed).size !== item.completed.length ||
        !item.completed.every((step: unknown) => Number.isInteger(step) && Number(step) >= 0 && Number(step) < source.runbook.length) ||
        !Array.isArray(item.activity) || item.activity.length > 30 ||
        !item.activity.every((event: unknown) => typeof event === "string" && event.length <= 200)) {
      throw new Error("Invalid saved incident");
    }
    ids.add(item.id);
  }
  if (!initialIncidents.every((item) => ids.has(item.id)) || !ids.has(value.selectedId)) {
    throw new Error("Missing saved scenario");
  }
  return value;
}

export function createPracticeStore(storage: StorageAccess) {
  let saved = fresh();
  const listeners = new Set<() => void>();
  const render = (ready: boolean, storageMessage: string): PracticeState => ({
    ready, storageMessage, selectedId: saved.selectedId,
    incidents: saved.incidents.map((item) => {
      const source = scenario(item.id)!;
      return { ...source, status: item.status, timeline: [...item.activity, ...source.timeline] };
    }),
    completed: Object.fromEntries(saved.incidents.map((item) => [item.id, [...item.completed]])),
  });
  const serverSnapshot = render(false, "Loading your saved practice workspace…");
  let snapshot = serverSnapshot;
  const publish = (message: string) => {
    snapshot = render(true, message);
    listeners.forEach((listener) => listener());
  };
  const persist = () => {
    try {
      storage().setItem(STORAGE_KEY, JSON.stringify(saved));
      publish("Saved in this browser. No account or shared workspace.");
    } catch {
      publish("Browser storage is unavailable. Changes will last only for this visit.");
    }
  };
  const record = (item: SavedIncident, event: string) => {
    item.activity = [`${new Date().toLocaleString()}: ${event}`, ...item.activity].slice(0, 30);
  };
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (!snapshot.ready) {
        try {
          const raw = storage().getItem(STORAGE_KEY);
          if (raw) saved = parseWorkspace(raw);
          publish("Saved in this browser. No account or shared workspace.");
        } catch {
          publish("Saved data could not be loaded. Using the starting scenarios; your next change will save a fresh workspace if storage is available.");
        }
      }
      return () => { listeners.delete(listener); };
    },
    select(id: string) {
      if (!snapshot.ready || !saved.incidents.some((item) => item.id === id)) return;
      saved.selectedId = id;
      persist();
    },
    updateStatus(id: string, status: IncidentStatus) {
      const item = saved.incidents.find((item) => item.id === id);
      if (!snapshot.ready || !item || !statusOptions.slice(1).includes(status) || item.status === status) return;
      item.status = status;
      record(item, `Status changed to ${status}`);
      persist();
    },
    toggleStep(id: string, index: number) {
      const item = saved.incidents.find((item) => item.id === id);
      if (!snapshot.ready || !item || !Number.isInteger(index) || index < 0 || index >= scenario(id)!.runbook.length) return;
      const checked = !item.completed.includes(index);
      item.completed = checked ? [...item.completed, index] : item.completed.filter((step) => step !== index);
      record(item, `Runbook step ${index + 1} ${checked ? "completed" : "reopened"}`);
      persist();
    },
    addAlert() {
      if (!snapshot.ready || saved.incidents.length >= MAX_INCIDENTS) return;
      const id = Array.from({ length: 20 }, (_, index) => `PRACTICE-${index + 1}`)
        .find((candidate) => !saved.incidents.some((item) => item.id === candidate))!;
      saved.incidents.unshift({ id, status: "Investigating", completed: [], activity: [] });
      saved.selectedId = id;
      persist();
    },
    reset() {
      if (!snapshot.ready) return;
      saved = fresh();
      persist();
    },
  };
}
