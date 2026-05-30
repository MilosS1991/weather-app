---
tags:
  - adr
  - status/accepted
created: 2026-05-30
---

# ADR-001: Open-Meteo as primary weather source

## Status
Accepted

## Context

The app needs hourly forecast data, barometric pressure, and access to multiple numerical weather models (at minimum ECMWF and GFS) for the model disagreement feature. Candidates evaluated:

| Option | Cost | Key limit |
|---|---|---|
| Open-Meteo | Free, no key | Rate-limited at ~10k req/day per IP |
| OpenWeatherMap | Free tier + paid | No raw model selection; ECMWF/GFS not separately queryable |
| Tomorrow.io | Free tier | Model internals not exposed |
| Meteomatics | Paid | Expensive for personal use |
| ECMWF open data | Free | Raw GRIB files — significant parsing overhead |

## Decision

Use Open-Meteo for all weather data. It exposes individual model forecasts (`ecmwf_ifs04`, `gfs_seamless`, etc.) as named query parameters, is genuinely free with no API key, and returns clean JSON.

## Consequences

- No authentication setup or key rotation needed.
- The 10k req/day soft limit is irrelevant for a single-user personal app.
- Tied to a third-party service with no SLA; acceptable for personal use.
- ECMWF and GFS model names may change as Open-Meteo updates model versions — those strings live in `api/openmeteo.ts` and are easy to update.

## Related

- [[002-three-parallel-model-fetches|ADR-002]] — how the multiple models are fetched
- [[003-separate-daily-and-hourly-requests|ADR-003]] — request strategy for daily vs hourly data
