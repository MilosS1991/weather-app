# Belgrade Weather

Personal weather dashboard for Serbia. Built with React, TypeScript, and Tailwind CSS. No API keys required.

## Features

- **Current conditions** — temperature, feels-like, humidity, wind speed
- **24-hour hourly forecast** — scrollable, with precipitation bar and wind
- **Barometric pressure alerts** — rate-of-change over 3h with rapid/moderate classification and 12h sparkline
- **Air quality index** — PM2.5 → US EPA AQI plus PM10, NO₂, O₃ readings from the nearest OpenAQ station
- **Model disagreement indicator** — compares ECMWF IFS04 vs GFS Seamless temperature forecasts hour-by-hour
- **7-day daily forecast** — hi/lo range bar, precipitation, UV index, sunrise/sunset
- **Browser push notifications** — fires when pressure crosses alert thresholds (tab must be open)

## Data sources

| Source | What | Auth |
|---|---|---|
| [Open-Meteo](https://open-meteo.com) | Weather forecast (3 models) + daily | None |
| [OpenAQ v2](https://docs.openaq.org) | Air quality measurements | None |

## Stack

- **React 18** + **TypeScript** (strict mode)
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **Vite 5** (pinned — see [ADR-006](docs/adr/006-vite-5-pin.md))

## Getting started

```bash
npm install
npm run dev
```

## Project structure

```
src/
  api/          # Fetch functions (openmeteo.ts, openaq.ts)
  components/   # UI components — one file per widget
  hooks/        # Data-fetching hooks + usePressureAlerts
  types/        # Shared TypeScript interfaces (single source of truth)
  utils/        # Pure functions: WMO codes, pressure maths, AQI formula
```

## Architecture decisions

See [`docs/adr/`](docs/adr/) for the reasoning behind non-obvious choices.
