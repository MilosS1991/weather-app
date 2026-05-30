---
tags:
  - adr
  - status/accepted
created: 2026-05-30
---

# ADR-003: Separate daily and hourly requests

## Status
Accepted (amended — see below)

## Context

Open-Meteo's `/v1/forecast` endpoint returns both `hourly` and `daily` data in a single response when both parameters are supplied. The `forecast_days` parameter controls the window for both.

The hourly forecast only displays the next 24 hours (index `currentHour` to `currentHour + 24`), so `forecast_days=2` is enough — 48 hourly entries. The 7-day daily view requires `forecast_days=7`.

If both were combined in one request with `forecast_days=7`, the hourly array would grow from 48 to 168 entries — 3.5× larger — for data that is never read.

## Decision

Keep the primary hourly fetch separate from the daily fetch. Add a `fetchDaily()` call in `useDaily` that requests only the daily variables with `forecast_days=7`.

## Consequences

- One additional HTTP request on load (now 4 total, all parallel via [[007-tanstack-query|TanStack Query]]).
- The daily payload is tiny (7 rows × 9 variables).
- `useDaily` can independently show a skeleton/error state without affecting the hourly display.
- If the daily fetch fails, the rest of the app still renders correctly.

## Amendment — forecast_days bump

When clickable day expansion was added to the 7-day forecast (each daily row expanding to show that day's hourly breakdown), the hourly fetch was bumped from `forecast_days=2` to `forecast_days=7`. This means the hourly array is now 168 entries, but the main hourly component still only reads `currentIndex` to `currentIndex + 24`. The extra entries exist solely to support on-demand day expansion without an additional network request.

## Related

- [[001-open-meteo-as-primary-weather-source|ADR-001]] — data source rationale
- [[002-three-parallel-model-fetches|ADR-002]] — overall fetch strategy
