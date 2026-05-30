---
tags:
  - adr
  - status/accepted
created: 2026-05-30
---

# ADR-005: OpenAQ v2 over v3

## Status
Accepted

## Context

OpenAQ has two active API versions:

**v2** (`api.openaq.org/v2/latest`)
- Single request returns a list of nearby locations, each with an array of their latest measurements.
- Flat, self-contained response.

**v3** (`api.openaq.org/v3/...`)
- Separate endpoints for locations, sensors, and measurements.
- Getting the latest PM2.5 reading requires: find locations → get sensor IDs → fetch latest per sensor.
- More expressive but 3× the round trips for the same result.

## Decision

Use the v2 `/latest` endpoint. A single call with `?coordinates=lat,lon&radius=50000` returns everything needed: location names, parameter names, values, and units.

## Consequences

- One HTTP request instead of three for the AQ data.
- OpenAQ has signalled v2 is in maintenance mode; if it is retired, migration to v3 is isolated to `api/openaq.ts` and the `OpenAQLocation` / `OpenAQMeasurement` types.
- The `extractParam()` helper iterates over v2's flat measurement array — this would change under v3 but the component interface (`ParamReading`) stays the same.

## Related

- [[007-tanstack-query|ADR-007]] — the `useAirQuality` hook uses TanStack Query to manage this fetch
