# SignalDesk

SignalDesk is an AI-assisted incident command center for engineering teams. It
turns service health, logs, severity, ownership, and customer impact into a
clear response briefing with runbook steps, blast-radius context, and resolution
tracking.

Live site: https://signaldesk-pink-two.vercel.app

## What It Does

- Tracks service posture across payments, authentication, inventory, messaging,
  and dependency services.
- Prioritizes active incidents by severity, owner, status, risk, and start time.
- Maps affected services in a topology-style blast-radius view.
- Generates a response brief with likely cause, customer impact, recommended
  action, and confidence.
- Calls a server-side triage endpoint at `/api/triage` to score incident
  evidence and return a response recommendation.
- Provides runbook steps, evidence logs, response timeline, and weekly severity
  reporting.
- Supports incident state changes for investigation, mitigation, monitoring, and
  resolution.

## Stack

- Next.js
- React
- TypeScript
- CSS
- Serverless API route
- Vercel

## Engineering Highlights

- Client-side incident workflow with selected incident state, filtering, alert
  intake, and response status updates.
- Server-side triage route that evaluates severity, service risk, and log
  evidence before returning a priority score and recommendation.
- Responsive command-center interface built for desktop review and mobile access.
- Product-focused README, deployment link, and production build workflow.

## Resume Bullet

Built SignalDesk, an AI-assisted incident command center using Next.js, React,
TypeScript, and a server-side triage endpoint to monitor service health,
classify production incidents, map blast radius, summarize evidence logs,
recommend response actions, and track resolution status.

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
