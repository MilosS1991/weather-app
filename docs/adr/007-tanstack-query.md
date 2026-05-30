---
tags:
  - adr
  - status/accepted
created: 2026-05-30
---

# ADR-007: TanStack Query v5 for server state

## Status
Accepted

## Context

The app makes 4 parallel HTTP requests on load (weather primary, ECMWF, GFS, daily) plus an air quality fetch. Initially these were managed with `useState` + `useEffect` per hook, each manually tracking `{ data, loading, error }`.

Problems with manual fetch hooks:
- No caching — every component mount re-fetched, even on tab switch.
- No deduplication — two components using the same hook triggered two requests.
- Retry logic and background refetch had to be hand-rolled.
- `loading` / `error` state resets were easy to get wrong (e.g. forgetting to reset error on new fetch).

## Decision

Replace all data-fetching hooks with TanStack Query v5 (`@tanstack/react-query`). Each hook becomes a `useQuery` call; the `QueryClient` is configured once in `main.tsx` with shared defaults.

```ts
// Global defaults in main.tsx
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000,   // weather data changes at most hourly
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})
```

Query keys encode the location so future multi-city support gets cache isolation for free: `['weather', lat, lon]`.

`usePressureAlerts` was intentionally left outside TanStack Query — it is a side-effect hook (fires browser notifications on a timer) with no rendered data, so the query model does not apply.

## Consequences

- Cached data survives tab switches for 15 minutes — no extra network traffic for normal usage.
- `isPending` (v5 term for "no cached data yet") replaces the hand-rolled `loading` boolean.
- `data` is `T | undefined` (not `T | null`) — updated component props accordingly.
- DevTools available via `@tanstack/react-query-devtools` if needed; not installed by default.

## Related

- [[002-three-parallel-model-fetches|ADR-002]] — the three weather fetches TanStack Query manages
- [[003-separate-daily-and-hourly-requests|ADR-003]] — daily fetch is a separate `useQuery`
- [[005-openaq-v2-over-v3|ADR-005]] — air quality fetch managed by `useAirQuality`
