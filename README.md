# SignalDesk

SignalDesk is an incident response workspace for engineering teams. It shows
what broke, where customers are affected, who owns the response, and what the
team should do next. The home screen stays compact, and the top navigation opens
focused workspaces for incidents, response, regions, and reports.

Live site: https://signaldesk-pink-two.vercel.app

## What It Does

- Tracks active incidents across checkout, login, inventory, notifications, and
  dependency services.
- Uses separate app views instead of putting every dashboard section on the home
  screen.
- Lets teams switch the impact view between U.S. states, U.S. regions, and
  global coverage.
- Prioritizes incidents by owner, status, risk, customer impact, and start time.
- Maps affected services so teams can see where risk may spread.
- Reviews incident evidence and returns a plain-language response plan.
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
  intake, focused workspace navigation, coverage scope, and response status
  updates.
- Server-side incident review that evaluates priority, service risk, and
  evidence before returning a recommendation.
- Responsive command-center interface built for desktop review and mobile access.
- Product-focused README, deployment link, and production build workflow.

## Resume Bullet

Built SignalDesk, an incident response workspace using Next.js, React, and
TypeScript to track production incidents by service, owner, status, customer
impact, U.S./global coverage, blast radius, runbook steps, and resolution
history.

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
