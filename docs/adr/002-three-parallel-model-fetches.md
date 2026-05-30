---
tags:
  - adr
  - status/accepted
created: 2026-05-30
---

# ADR-002: Three parallel model fetches instead of one combined request

## Status
Accepted

## Context

Open-Meteo supports requesting multiple models in a single call using the `models` parameter, which suffixes response keys (e.g. `temperature_2m_ecmwf_ifs04`). Alternatively, each model can be fetched separately.

The model disagreement feature requires temperature from ECMWF IFS04 and GFS Seamless. The primary display needs the full variable set (pressure, humidity, wind, weather code, etc.) which is only reliably available from the default best-match model.

## Decision

Make three separate `fetch()` calls in `Promise.all()`:

1. **Default model** — all display variables (`FULL_HOURLY_VARS`)
2. **ECMWF IFS04** — `temperature_2m` + `precipitation` only
3. **GFS Seamless** — `temperature_2m` + `precipitation` only

The TypeScript contracts reflect this: the generic `OpenMeteoResponse<H extends BaseHourly>` ensures comparison models are typed as `BaseHourly` (subset) while the primary is `FullHourly`.

## Consequences

- Three HTTP requests fire in parallel on load — total latency is the slowest of the three, not their sum.
- The comparison requests are small (~2 KB each) because they fetch only two variables.
- If Open-Meteo changes how multi-model suffix naming works, we are unaffected.
- Adding a fourth model for comparison (e.g. ICON) is a one-line change in `fetchWeather()`.

## Related

- [[001-open-meteo-as-primary-weather-source|ADR-001]] — rationale for choosing Open-Meteo
- [[007-tanstack-query|ADR-007]] — how these fetches are managed at the React layer
