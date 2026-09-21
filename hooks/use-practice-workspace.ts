import { useState, useSyncExternalStore } from "react";
import { createPracticeStore } from "../lib/practice-store";

export function usePracticeWorkspace() {
  const [store] = useState(() => createPracticeStore(() => window.localStorage));
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return { ...state, select: store.select, updateStatus: store.updateStatus,
    toggleStep: store.toggleStep, addAlert: store.addAlert, reset: store.reset };
}
