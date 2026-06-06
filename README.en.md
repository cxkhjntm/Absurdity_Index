# ABSURDITY INDEX

> A cyberpunk-inspired personal absurdity tracker that turns workplace friction, repetitive chores, and ritualized bureaucracy into a gamified logbook.

## Overview

ABSURDITY INDEX is a pure front-end single-page app with no build step. It lets you log absurd events, calculate absurdity scores, unlock achievements, generate weekly reports, and export them as images. It can also connect to an OpenAI-compatible API for AI-powered event analysis, achievement naming, and title generation.

## Key Features

- Dashboard: view total absurdity, current level, weekly trends, and recent events.
- Event logging: use AI analysis or quick predefined events.
- Achievements: automatically render unlocked achievements with rarity tiers.
- Weekly report: summarize the current or historical week, with charts and PNG export.
- Settings console: configure AI endpoints, edit prompts, import/export data, and clear local storage.

## Tech Stack

- HTML5
- Vanilla CSS
- Vanilla JavaScript
- localStorage
- Chart.js
- html2canvas
- OpenAI-compatible API

## Getting Started

### Option 1: Open directly

1. Clone or download the repository.
2. Open the root index.html in your browser.

### Option 2: Use a local static server

For a smoother development workflow, use VS Code Live Server or any static file server.

## First-Time Setup

1. Go to the Settings page and fill in the API Base URL, API Key, and model name if you want AI features.
2. If you do not configure AI, you can still use the quick events and local logging flow.
3. Use Settings to export, import, or clear local data.

## Data Storage

- All data is stored in browser localStorage by default.
- Events, achievements, levels, and weekly reports persist locally.
- You can export a JSON backup or import existing data from the Settings page.

## Project Structure

```
.
├── index.html
├── css/
├── js/
├── assets/
└── docs/
    └── project-introduction.md
```

## Documentation

- Chinese README: [README.md](README.md)
- Project introduction: [docs/project-introduction.md](docs/project-introduction.md)

## Notes

Chart.js and html2canvas are loaded from CDNs, so no extra build tooling is required.
