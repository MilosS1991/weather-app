---
tags:
  - adr
  - status/accepted
created: 2026-05-30
---

# ADR-006: Vite pinned to v5

## Status
Accepted

## Context

The project was scaffolded with `create-vite`, which pulled in Vite 8. Vite 8 uses the `rolldown` bundler, whose native binding (`@rolldown/binding-darwin-arm64`) is distributed as an optional npm dependency. Due to a known npm bug ([npm/cli#4828](https://github.com/npm/cli/issues/4828)) with optional dependencies, the binding was not installed correctly, causing the build to fail with:

```
Error: Cannot find native binding.
```

Vite 8 also requires Node.js `>=22.12.0`. The environment runs Node `22.11.0`.

## Decision

Pin Vite to `^5` and `@vitejs/plugin-react` to `^4`. Vite 5 uses Rollup (pure JS, no native bindings) and supports Node `>=18`.

Tailwind CSS v4 with `@tailwindcss/vite` works correctly with Vite 5.

## Consequences

- Build is stable on the current Node version.
- Vite 5 is in maintenance but actively patched.
- To upgrade to Vite 8: update Node to `>=22.12.0`, then bump `vite` and `@vitejs/plugin-react` in `package.json`.
- No application code changes are needed for the upgrade — the Vite config is identical between v5 and v8.
