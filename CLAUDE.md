# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Visual tag table editor for VRChat meetup organizers. Outputs JSON consumed by Unity's `YodoTagBuilder` in the [InfraWorld](https://github.com/a1678991/InfraWorld) VRChat world project. Deployed as a static SPA to GitHub Pages.

**Target users**: Non-developer meetup organizers who design colored tag button layouts, preview them, and hand off JSON to Unity engineers.

## Commands

```bash
bun run dev          # Dev server (localhost:5173)
bun run build        # Production build → build/
bun run lint         # oxlint (fast, TS/JS only) then eslint (Svelte-aware)
bun run lint:fix     # Auto-fix lint issues
bun run fmt          # Format with oxfmt
bun run fmt:check    # Check formatting
bun run test         # Playwright e2e tests (builds first, runs against preview server)
bun run test:ui      # Playwright interactive UI mode
bunx playwright test --grep "pattern"  # Run specific test
```

**Tools via mise**: `bun`, `node 24`, `pinact` (pin GitHub Actions to commit SHAs).

## Tech Stack

- **Svelte 5** with runes (`$state`, `$derived`, `$effect`, `$props`)
- **SvelteKit** with `adapter-static` (SPA mode, `ssr = false`, `prerender = true`)
- **Tailwind CSS 4** + **DaisyUI 5** (`dim` theme) — prefer utility classes over `<style>` blocks
- **Linting**: oxlint (categories: correctness/error, suspicious+perf/warn) + ESLint with `eslint-plugin-svelte` + `eslint-plugin-oxlint` (dedup, must be last in config)
- **Formatting**: oxfmt (printWidth 100, double quotes, semicolons, trailing commas)
- **Testing**: Playwright (Chromium only, tests build+preview then run)

## Architecture

### State Management (`src/lib/state.svelte.ts`)

Single module-level `$state` object holds all data. No stores, no context API.

- **Multi-set storage**: `StoredData = { sets: Record<string, TagTable>, activeSet: string }`
- **Cannot export `$derived` from `.svelte.ts` modules** — use getter functions (`getTable()`, `getTotalTags()`, etc.) instead
- **`$effect` at module scope requires `$effect.root()`** wrapper
- All mutations are plain exported functions that mutate the `$state` proxy directly
- Auto-saves to localStorage (v2 format) via debounced `$effect`

### JSON Schema (Unity target)

```json
{
  "column_width": 0.45,
  "columns": [
    {
      "width": 0.7,
      "cells": [{ "text": "...", "text_color": "#RRGGBB", "bg_color": "#RRGGBB" }]
    }
  ]
}
```

**Constraints**: Max 64 tags total (ulong bitmask in VRChat). Colors `#RRGGBB` or `#RRGGBBAA`. Per-column `width` is optional.

### Preview-First Editing

The preview panel is the primary editing surface — no separate editor panel needed by default:

- **Single-click** cell → color picker dropdown
- **Double-click** cell → inline text editing
- **Drag-and-drop** cells within and across columns
- **`+` buttons** for adding cells/columns, **`×`** for removing

### GitHub Pages Deployment

`paths.base` reads from `BASE_PATH` env var (set in CI to `/${{ github.event.repository.name }}`). Empty in dev mode via `process.argv.includes("dev")` check. Fallback is `404.html` (not `index.html`) to avoid conflict with prerendered homepage.

## Testing Requirements

- **New features must have Playwright tests** before the feature is considered complete. Add tests to the relevant journey section in `tests/app.test.ts`, or create a new journey section.
- **Large-scope edits** (refactors, CSS migrations, state architecture changes) must pass all existing tests (`bun run test`) before committing.
- Tests are organized by user journey (first visit, edit text, change colors, multiple sets, export, persistence, editor panel, undo/redo). Follow this pattern.
- Each test clears localStorage in `beforeEach` for isolation.

## Svelte 5 Gotchas

- **oxlint/oxfmt cannot parse `.svelte` files** — ESLint with `eslint-plugin-svelte` covers Svelte-specific linting
- Keep semantic CSS class names (`.preview-cell`, `.picker-dropdown`, `.set-tab`) alongside Tailwind classes for Playwright test selectors
- Minimal `<style>` blocks remain for oklch theme variables and `::-webkit-*` vendor prefixes that Tailwind can't express
