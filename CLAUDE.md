# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for frednordell.com. Vue 3 + TypeScript single-page application, built with Vite, deployed to Cloudflare Pages.

## Commands

Package manager is **Bun** (not npm/yarn).

- `bun run dev` — Start dev server
- `bun run build` — Type-check with vue-tsc then bundle with Vite
- `bun run test` — Run tests in watch mode
- `bun run test --no-watch` — Run tests once (CI mode)
- `bun run coverage` — Run tests with coverage
- `bun run preview` — Preview production build

Before running tests, Playwright WebKit must be installed:
```
bun playwright install webkit --with-deps
```

To run a single test file:
```
bun vitest run src/components/Footer.spec.ts
```

## Architecture

- **Entry:** `index.html` → `src/main.ts` → mounts Vue app to `#app`
- **Components:** Vue 3 single-file components using `<script setup lang="ts">` (Composition API)
- **App.vue** — Root component with profile content, imports Footer
- **Footer.vue** — Social links (GitHub, LinkedIn, CKA badge)
- **Styling:** Global styles in `src/style.css`, component-scoped styles via `<style scoped>`

## Testing

Tests use **Vitest with browser-mode** (Playwright/WebKit), not JSDOM. Test files live alongside components with `.spec.ts` suffix.

- Rendering: `vitest-browser-vue` (`render` function)
- Assertions: `@vitest/browser/matchers` (DOM queries like `getByText`, `getByAltText`)
- Snapshot tests are used for visual regression

## TypeScript

Strict mode is enabled with `noUnusedLocals` and `noUnusedParameters`. Three tsconfig files:
- `tsconfig.json` — Project references root
- `tsconfig.app.json` — App source (ES2020, DOM libs)
- `tsconfig.node.json` — Build tooling (ES2022)

## Deployment

CI/CD via GitHub Actions (`.github/workflows/`). Pushes to main build and deploy to Cloudflare Pages. PRs run tests only.
