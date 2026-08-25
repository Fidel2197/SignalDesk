# SignalDesk

SignalDesk is an AI-assisted incident response dashboard built as a portfolio
project. It presents service health, active incidents, evidence logs, response
timelines, severity analytics, and a server-side triage endpoint in one polished
internal-tool interface.

## Why This Project Exists

Most of my earlier projects show public-facing websites, student tools, games,
and consumer app ideas. SignalDesk adds a stronger company-facing project: an
operational dashboard that feels closer to the software teams use to monitor,
debug, and resolve production problems.

## Features

- Service health cards with status, latency, uptime, ownership, region, recent
  change context, and trend visuals.
- Incident queue with severity labels, status filtering, owner assignment, and
  selected incident details.
- AI triage panel with likely cause, customer impact, recommended next action,
  confidence score, tags, and status commands.
- Server-side triage endpoint at `/api/triage` that scores submitted incident
  evidence and returns a response recommendation.
- Evidence log stream and response timeline for the selected incident.
- Analytics section with a weekly severity trend chart.
- Responsive layout designed for desktop and mobile review.

## Stack

- Next.js
- React
- TypeScript
- CSS
- Serverless API route
- Sites/Vinext scaffold

## Resume Bullet

Built SignalDesk, an AI-assisted incident response dashboard using Next.js,
React, TypeScript, and a server-side triage endpoint to monitor service health,
classify incidents, summarize evidence logs, recommend response actions, and
track resolution status.

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
