---
tags:
  - adr
  - status/accepted
created: 2026-05-30
---

# ADR-004: Browser Notifications API without Service Worker push

## Status
Accepted

## Context

Pressure-drop alerts need to reach the user without them actively watching the dashboard. Two approaches exist:

**Option A — Web Notifications API (main thread)**
- Call `new Notification(...)` directly from a `setInterval` in the React app.
- Works only while the tab is open.
- No backend required.

**Option B — Push API + Service Worker**
- Service Worker receives push messages from a server even when the tab is closed.
- Requires a push server (VAPID keys, subscription management), a persistent backend or serverless function, and Service Worker registration.
- True background delivery.

## Decision

Use Option A. This is a single-user personal app; the tab is typically open when the user is at their desk. The pressure monitoring use case ("warn me before a storm") is satisfied as long as the app is running — which is the normal usage pattern for a personal dashboard.

A push server would add significant infrastructure complexity (backend, key rotation, subscription storage) for marginal benefit.

## Consequences

- Notifications fire only while the browser tab is open.
- No backend, no VAPID keys, no Service Worker lifecycle management.
- The 15-minute polling interval (`POLL_MS`) and 90-minute deduplication window (`DEDUP_MS`) are constants in `hooks/usePressureAlerts.ts` and easy to adjust.
- If background delivery becomes important, the `check()` function in `usePressureAlerts` encapsulates all the alert logic and can be moved into a Service Worker with minimal changes.

## Related

- [[001-open-meteo-as-primary-weather-source|ADR-001]] — pressure data comes from Open-Meteo
