import type { Service, Incident, ViewName, IncidentStatus, CoverageScope, ScopeRow, ExternalSignal, ServiceStatus, ExternalStatus } from "./types";

export const services: Service[] = [
  {
    name: "Checkout Payments",
    code: "PAY",
    status: "watch",
    region: "Central U.S.",
    state: "Texas",
    city: "Dallas",
    owner: "Platform Team",
    latency: 412,
    load: 78,
    uptime: "99.91%",
    x: 24,
    y: 38,
  },
  {
    name: "Login Service",
    code: "AUTH",
    status: "stable",
    region: "National",
    state: "All states",
    city: "Edge network",
    owner: "Security Team",
    latency: 128,
    load: 42,
    uptime: "99.99%",
    x: 52,
    y: 22,
  },
  {
    name: "Inventory Sync",
    code: "INV",
    status: "critical",
    region: "Eastern U.S.",
    state: "New York",
    city: "New York City",
    owner: "Commerce Team",
    latency: 860,
    load: 91,
    uptime: "98.72%",
    x: 72,
    y: 55,
  },
  {
    name: "Notifications",
    code: "MSG",
    status: "stable",
    region: "Western U.S.",
    state: "California",
    city: "San Jose",
    owner: "Growth Team",
    latency: 205,
    load: 57,
    uptime: "99.95%",
    x: 39,
    y: 72,
  },
  {
    name: "Tax Lookup",
    code: "TAX",
    status: "watch",
    region: "Central U.S.",
    state: "Illinois",
    city: "Chicago",
    owner: "Platform Team",
    latency: 522,
    load: 68,
    uptime: "99.82%",
    x: 15,
    y: 68,
  },
];

export const initialIncidents: Incident[] = [
  {
    id: "INC-1048",
    title: "Checkout is slowing down",
    severity: "High",
    status: "Investigating",
    service: "Checkout Payments",
    owner: "Platform Team",
    started: "T+14 min",
    risk: "Revenue impact",
    confidence: 92,
    impact:
      "Customers can still check out, but payment confirmation is taking longer than normal.",
    rootCause:
      "A recent tax lookup change is slowing down checkout. Payments are still going through, so the first move is to reduce delay before it becomes an outage.",
    nextAction:
      "Move a small slice of checkout traffic back to the previous worker and compare confirmation speed for ten minutes.",
    blastRadius: ["Checkout confirmation", "Tax lookup", "Order receipts"],
    logs: [
      "17:06 Checkout latency reached 932 ms at peak",
      "17:07 Tax lookup timeout rate rose to 3.8%",
      "17:08 Texas checkout traffic moved to backup pool",
      "17:09 Recent tax cache change matched the slowdown",
    ],
    runbook: [
      "Compare checkout speed with the last stable release.",
      "Move 20% of checkout traffic to the previous worker.",
      "Watch payment confirmation and tax lookup speed for 10 minutes.",
      "Roll back the tax lookup change if delays stay high.",
    ],
    timeline: [
      "Checkout slowdown detected",
      "Platform Team assigned",
      "Tax lookup change matched to the timing",
    ],
  },
  {
    id: "INC-1047",
    title: "Inventory updates are falling behind",
    severity: "Critical",
    status: "Mitigating",
    service: "Inventory Sync",
    owner: "Commerce Team",
    started: "T+31 min",
    risk: "Order accuracy",
    confidence: 88,
    impact:
      "Some product pages may show old availability while delayed inventory updates catch up.",
    rootCause:
      "A worker setting cut the number of inventory jobs running at the same time during a busy order window.",
    nextAction:
      "Restore normal worker capacity, replay delayed inventory updates, and keep stale-stock warnings visible until the queue clears.",
    blastRadius: ["Warehouse events", "Product availability", "Stock checks"],
    logs: [
      "16:48 Inventory queue reached 18,422 waiting updates",
      "16:51 New York warehouse lag reached 18 minutes",
      "16:54 Worker capacity changed from 18 to 8",
      "17:02 Replay window prepared for delayed inventory updates",
    ],
    runbook: [
      "Restore inventory worker capacity to normal.",
      "Replay delayed updates from the waiting queue.",
      "Compare New York lag against the western warehouse baseline.",
      "Remove stale-stock warnings after lag drops under 90 seconds.",
    ],
    timeline: [
      "Critical inventory incident opened",
      "Commerce Team joined response",
      "Worker capacity rollback prepared",
    ],
  },
  {
    id: "INC-1046",
    title: "Notifications are delayed",
    severity: "Medium",
    status: "Monitoring",
    service: "Notifications",
    owner: "Growth Team",
    started: "T+52 min",
    risk: "Customer messaging delay",
    confidence: 76,
    impact: "Receipts and marketing notifications may arrive several minutes late.",
    rootCause:
      "A delivery provider started throttling messages. Internal workers are healthy and the waiting queue is shrinking.",
    nextAction:
      "Keep nonessential campaigns paused until provider limits normalize and receipt messages stay current.",
    blastRadius: ["Receipt messages", "Campaign sends", "Retry queue"],
    logs: [
      "16:15 Notification retry queue reached 2,180 messages",
      "16:24 Nonessential campaigns paused",
      "16:39 Provider throttle window reduced to 12%",
      "17:01 Retry queue down to 620 and still falling",
    ],
    runbook: [
      "Keep nonessential campaigns paused.",
      "Watch the retry queue until it keeps falling.",
      "Confirm receipts deliver before campaign traffic resumes.",
      "Resume scheduled sends after provider throttling clears.",
    ],
    timeline: [
      "Provider throttling detected",
      "Campaign traffic reduced",
      "Retry queue trending down",
    ],
  },
];

export const navItems: ViewName[] = [
  "Command",
  "Guide",
  "Incidents",
  "Response",
  "Regions",
  "Signals",
  "Reports",
];
export const statusOptions: Array<"All" | IncidentStatus> = [
  "All",
  "Investigating",
  "Mitigating",
  "Monitoring",
  "Resolved",
];

export const guideSteps: Array<{
  label: string;
  title: string;
  detail: string;
  view: ViewName;
}> = [
  {
    label: "1",
    title: "Start with Command",
    detail: "Use the home view to see the main issue, open count, service health, and assigned response team.",
    view: "Command",
  },
  {
    label: "2",
    title: "Open Incidents",
    detail: "Check the queue, filter by status, and click the issue your team should handle first.",
    view: "Incidents",
  },
  {
    label: "3",
    title: "Check Regions",
    detail: "Switch between U.S. states, U.S. regions, and global coverage to see who may be affected.",
    view: "Regions",
  },
  {
    label: "4",
    title: "Check Signals",
    detail: "Open outside status sources to see whether GitHub, Vercel, or network services may affect the response.",
    view: "Signals",
  },
  {
    label: "5",
    title: "Use Response",
    detail: "Read the impact, likely cause, best next step, evidence notes, and runbook actions.",
    view: "Response",
  },
  {
    label: "6",
    title: "Finish with Reports",
    detail: "Review the priority mix calculated from your current practice queue.",
    view: "Reports",
  },
];

export const coverageOptions: CoverageScope[] = ["U.S. States", "U.S. Regions", "Global"];

export const coverageRows: Record<CoverageScope, ScopeRow[]> = {
  "U.S. States": [
    { place: "Texas", status: "watch", detail: "Checkout traffic is slower than normal." },
    { place: "New York", status: "critical", detail: "Inventory updates need attention." },
    { place: "California", status: "stable", detail: "Notification workers are healthy." },
    { place: "Illinois", status: "watch", detail: "Tax lookup delay is being reviewed." },
  ],
  "U.S. Regions": [
    { place: "Central U.S.", status: "watch", detail: "Checkout and tax lookup are under review." },
    { place: "Eastern U.S.", status: "critical", detail: "Inventory replay is behind." },
    { place: "Western U.S.", status: "stable", detail: "No active customer impact." },
    { place: "National", status: "stable", detail: "Login traffic is normal." },
  ],
  Global: [
    { place: "North America", status: "watch", detail: "Checkout has the only active slowdown." },
    { place: "Europe", status: "stable", detail: "No active incident reported." },
    { place: "Asia-Pacific", status: "stable", detail: "Normal traffic pattern." },
    { place: "South America", status: "stable", detail: "No customer impact reported." },
  ],
};

export const fallbackSignals: ExternalSignal[] = [
  {
    provider: "GitHub",
    status: "unknown",
    summary:
      "GitHub status has not loaded yet. Check it if the incident involves repositories, actions, or releases.",
    affected: [],
    focus: "Code hosting, pull requests, actions, and repository access",
    updatedAt: null,
    sourceUrl: "https://www.githubstatus.com",
  },
  {
    provider: "Vercel",
    status: "unknown",
    summary:
      "Vercel status has not loaded yet. Check it if the incident involves builds, deploys, or the live site.",
    affected: [],
    focus: "Deployments, builds, hosting, and edge delivery",
    updatedAt: null,
    sourceUrl: "https://www.vercel-status.com",
  },
  {
    provider: "Cloudflare",
    status: "unknown",
    summary:
      "Cloudflare status has not loaded yet. Check it if the incident involves DNS, traffic, or regional access.",
    affected: [],
    focus: "Network, DNS, edge traffic, and regional availability",
    updatedAt: null,
    sourceUrl: "https://www.cloudflarestatus.com",
  },
];

export const statusLabel: Record<ServiceStatus, string> = {
  stable: "Stable",
  watch: "Watch",
  critical: "Critical",
};

export const externalStatusLabel: Record<ExternalStatus, string> = {
  operational: "Normal",
  degraded: "Watch",
  incident: "Issue",
  unknown: "Check source",
};

export const viewDescriptions: Record<ViewName, string> = {
  Command: "A simple overview for deciding what needs attention first.",
  Guide: "What SignalDesk does and how to use it.",
  Incidents: "Your practice queue, saved in this browser as you work.",
  Response: "The selected incident's impact, likely cause, next action, and runbook.",
  Regions: "Simulated service coverage across states, regions, and the world.",
  Signals: "Current public status reports, separate from the practice scenarios.",
  Reports: "A summary calculated from your saved practice queue.",
};

