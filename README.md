# SignalDesk

[Open the app](https://signaldesk-pink-two.vercel.app) · [Automated checks](https://github.com/Fidel2197/SignalDesk/actions)

Practice an incident response: choose a scenario, review its evidence, follow a runbook, and record progress. SignalDesk also checks real public status reports from GitHub, Vercel, and Cloudflare.

**The incident scenarios are simulated.** Their owners, logs, times, confidence values, service loads, and geographic coverage are authored fixtures, not production telemetry. Public provider checks are a separate live integration and do not establish the cause of a scenario.

## Try the workflow

1. Open **Incidents** and select checkout, inventory, or notifications.
2. Open **Response**, change its status, and check off runbook steps.
3. Refresh the page: your status, checklist, selected scenario, and recent activity remain saved in this browser.
4. Open **Signals** to see provider-reported status. **Refresh public checks** requests a fresh check; sources are also checked on page load.
5. **Review incident** applies deterministic rules to the scenario evidence. It is not an AI diagnosis and performs no infrastructure changes.
6. **Add practice alert** adds a login scenario. **Reset practice** asks before restoring the starting workspace.

Reports calculate priority distribution and open/resolved totals from your saved queue. Service health and coverage maps remain explicitly labeled scenario baselines.

## Local setup

Use Node.js 22.13 or later and npm. No API keys, environment variables, database, or account setup are required.

```bash
git clone https://github.com/Fidel2197/SignalDesk.git
cd SignalDesk
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Network access is needed for the public status APIs; practice scenarios still work when those providers are unavailable.

```bash
npm run lint
npm test
npm run build
npm start
```

`npm start` serves the production build after `npm run build`. The GitHub Actions workflow runs a clean install, lint, tests, and a production build for pushes to `main` and pull requests.

## Architecture and data flow

- `app/page.tsx` composes seven focused views in `components/`: command, guide, incidents, response, regions, signals, and reports.
- `hooks/use-practice-workspace.ts` connects React to a versioned store in `lib/practice-store.ts` through `useSyncExternalStore`. Only known scenario IDs, validated statuses/checklists, selection, and bounded recent activity are persisted under `signaldesk.practice.v1`. Scenario content stays in `lib/practice-data.ts` and `lib/practice-alert.ts`.
- `GET /api/signals` requests a fixed allowlist of public Statuspage summary endpoints in parallel. Each request has a 3.5-second timeout covering the body read. HTTP failures and malformed responses become `unknown`, never healthy. The UI discards stale healthy results after a failed refresh and shows the check time.
- `POST /api/review` validates bounded JSON evidence and returns a rule-based priority score and recommendation. Unavailable public checks remain explicitly unknown. Provider issues do not increase the simulated incident's priority score. Review results are tied to their original incident and cleared on reset.
- No data is sent to an AI provider. Browser progress is not stored on the server. Review requests contain the displayed scenario evidence and latest public signal context.

The app uses Next.js App Router, React, TypeScript, CSS, and Vercel. There is no custom authentication or shared incident backend.

## Failure handling and tests

Vitest and React Testing Library cover:

- saved statuses, selection, checklist, and history after store recreation and React remount;
- explicit reset, bounded alert creation, corrupt snapshots, invalid steps, and unavailable browser storage;
- reports computed from the actual practice queue;
- healthy, degraded, unavailable, malformed, and timed-out provider responses;
- malformed/oversized review requests and missing provider context;
- review API failures, late results after reset, and clearing stale source status after a failed refresh.

Provider requests in tests are mocked: the suite verifies the application's handling, not continuous uptime of external services.

## Limits

- Progress stays in one browser profile. There are no accounts, cross-device sync, team collaboration, real alert ingestion, or live service telemetry. Multiple tabs do not synchronize automatically; the last saved change wins.
- Clearing site data removes progress. If storage is blocked or full, the app explains that changes only last for that visit. Invalid saved data falls back to starting scenarios and is replaced on the next change.
- Up to 20 additional login practice alerts and 30 recent activity entries per scenario are retained. The original scenario timeline remains available.
- Public checks are point-in-time provider reports, refreshed on load or by request. A successful fetch does not guarantee the provider's report is timely or complete.
- Rule-based reviews are temporary; they are recalculated on request and are not saved across page loads.

## Development note

Built with AI assistance, with the project scope and interface direction provided by Fidel Anyanwu. The repository exposes the scenario fixtures, scoring rules, persistence format, failure handling, and automated checks so those choices can be inspected rather than inferred from the interface. The September 2026 revision separated the original large page, corrected misleading live-data labels, added persistence, and introduced the test/CI workflow above.
