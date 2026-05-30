---
tags:
  - adr
  - index
---

# Architecture Decision Records

Decisions are recorded here when the choice was non-obvious, has a meaningful trade-off, or would surprise a future contributor. Routine choices (use React, use TypeScript) are not recorded.

| # | Title | Status |
|---|---|---|
| [[001-open-meteo-as-primary-weather-source\|ADR-001]] | Open-Meteo as primary weather source | Accepted |
| [[002-three-parallel-model-fetches\|ADR-002]] | Three parallel model fetches instead of one combined request | Accepted |
| [[003-separate-daily-and-hourly-requests\|ADR-003]] | Separate daily and hourly requests | Accepted (amended) |
| [[004-browser-notifications-without-service-worker-push\|ADR-004]] | Browser Notifications API without Service Worker push | Accepted |
| [[005-openaq-v2-over-v3\|ADR-005]] | OpenAQ v2 over v3 | Accepted |
| [[006-vite-5-pin\|ADR-006]] | Vite pinned to v5 | Accepted |
| [[007-tanstack-query\|ADR-007]] | TanStack Query v5 for server state | Accepted |

## Format

Each ADR uses the [Michael Nygard format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions): **Status**, **Context**, **Decision**, **Consequences**. Statuses: `Proposed` → `Accepted` → `Deprecated` / `Superseded by ADR-NNN`.
