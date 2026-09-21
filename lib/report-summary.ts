import type { Incident, Severity } from "./types";

export function priorityMix(incidents: Incident[]) {
  return (["Critical", "High", "Medium"] as Severity[]).map((label) => {
    const count = incidents.filter((item) => item.severity === label).length;
    return { label, count, value: incidents.length ? Math.round(count / incidents.length * 100) : 0 };
  });
}
