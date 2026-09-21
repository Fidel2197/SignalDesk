import type { Incident } from "./types";

export function createPracticeAlert(id: string): Incident {
    return {
      id,
      title: "Mobile login retry spike",
      severity: "High",
      status: "Investigating",
      service: "Login Service",
      owner: "Security Team",
      started: "Added scenario",
      risk: "Login reliability",
      confidence: 81,
      impact: "Some mobile users may need to retry sign-in after reopening the app.",
      rootCause:
        "The newest mobile build is sending expired refresh tokens after app resume. Web login is not affected.",
      nextAction:
        "Limit repeated retries, alert the mobile release owner, and compare token refresh behavior with the previous build.",
      blastRadius: ["Mobile login", "Token refresh", "App resume"],
      logs: [
        "17:18 Mobile token refresh failures rose to 186",
        "17:18 Mobile build 8.14.2 matched the retry loop",
        "17:19 Web login success stayed at 99.8%",
      ],
      runbook: [
        "Confirm which mobile app version created the retry spike.",
        "Limit repeated token refresh retries.",
        "Notify the mobile release owner.",
        "Keep web login metrics separate from mobile retry noise.",
      ],
      timeline: ["New login alert added", "Owner assignment pending"],
    };
}
