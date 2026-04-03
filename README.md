# Tag Table Editor

A visual editor for designing tag tables used in VRChat meetup worlds.

Meetup organizers design colored tag button layouts in the browser, preview how they'll look in VRChat, and export JSON for Unity engineers.

[日本語](README_ja.md)

## Features

- **Preview-first editing** — click cells to change colors, double-click to edit text
- **Drag and drop** — reorder cells within and across columns
- **Multiple tag sets** — manage several tag tables with named tabs
- **Undo / Redo** — Ctrl+Z / Ctrl+Shift+Z with 100-step history
- **Auto-save** — changes persist to localStorage automatically
- **JSON export** — copy to clipboard or download as `.json`
- **Validation** — warns when approaching the 64-tag limit
- **JSON Schema** — `tag-table.schema.json` for editor support

## Getting Started

### Prerequisites

- [mise](https://mise.jdx.dev/) (installs bun, node, and other tools)

### Setup

```bash
mise install
bun install
```

### Development

```bash
bun run dev       # Start dev server at localhost:5173
bun run build     # Production build
bun run test      # Run Playwright e2e tests
bun run lint      # Run oxlint + eslint
bun run fmt       # Format with oxfmt
```

## JSON Output Format

The editor outputs JSON compatible with Unity's [YodoTagBuilder](https://github.com/a1678991/InfraWorld):

```json
{
  "column_width": 0.45,
  "columns": [
    {
      "cells": [
        { "text": "Frontend", "text_color": "#FFFFFF", "bg_color": "#14505C" },
        { "text": "Backend", "text_color": "#FFFFFF", "bg_color": "#14505C" }
      ]
    }
  ]
}
```

Max 64 tags total. Colors in `#RRGGBB` or `#RRGGBBAA` format.

## Tech Stack

Svelte 5 / SvelteKit / Tailwind CSS 4 / DaisyUI 5 / Playwright / Bun

## License

[MIT](LICENSE)
