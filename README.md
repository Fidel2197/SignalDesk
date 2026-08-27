# SignalDesk

SignalDesk is an incident response workspace for engineering teams. It shows
what broke, where customers are affected, who owns the response, and what the
team should do next. The home screen stays compact, and the top navigation opens
focused workspaces for the guide, incidents, response, regions, and reports.

Live site: https://signaldesk-pink-two.vercel.app

## What It Does

- Tracks active incidents across checkout, login, inventory, notifications, and
  dependency services.
- Uses separate app views instead of putting every dashboard section on the home
  screen.
- Includes a Guide view that explains what the app does and how to move through
  the workflow.
- Lets teams switch the impact view between U.S. states, U.S. regions, and
  global coverage.
- Pulls public status signals from GitHub, Vercel, and Cloudflare so the team
  can see whether an outside service may affect the response.
- Prioritizes incidents by owner, status, risk, customer impact, and start time.
- Clarifies that the response owner is the assigned team for the selected issue,
  not a user account.
- Maps affected services so teams can see where risk may spread.
- Reviews incident evidence and returns a plain-language response plan.
- Blends public source checks into the response review instead of relying only
  on the local incident notes.
- Provides runbook steps, evidence notes, response history, and weekly priority
  reporting.
- Supports status updates for investigation, mitigation, monitoring, and
  resolution.

## Stack

- Next.js
- React
- TypeScript
- CSS
- Server-side incident review
- Vercel

## Engineering Highlights

- Client-side incident workflow with selected incident state, filtering, alert
  intake, guide navigation, coverage scope, and response status
  updates.
- Server-side incident review that evaluates priority, service risk, and
  evidence before returning a recommendation.
- Public signal intake route that reads status-page data, normalizes it into
  simple labels, and keeps the app usable when an outside source cannot be
  reached.
- Responsive command-center interface built for desktop review and mobile access.
- Product-focused README, deployment link, and production build workflow.

## Resume Bullet

Built SignalDesk, an incident response workspace using Next.js, React, and
TypeScript to track production incidents by service, owner, status, customer
impact, U.S./global coverage, public status signals, blast radius, runbook
steps, and resolution history.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
```
