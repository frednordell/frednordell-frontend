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
- `bun run gallery:add <file> [caption]` — Upload one photo to the R2 gallery bucket

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
- **App.vue** — Shell: nav tabs, the active view, Footer
- **router.ts** — Minimal History API router (no vue-router). Two routes: `/` and `/gallery`; unknown paths fall back to home. `public/_redirects` gives Pages the SPA fallback so deep links work.
- **views/HomeView.vue** — Profile content
- **views/GalleryView.vue** — Fetches `/api/gallery`, owns loading/error state
- **components/GalleryGrid.vue** — Presentational grid, takes an `images` prop
- **components/Lightbox.vue** — Full-view overlay
- **Footer.vue** — Social links (GitHub, LinkedIn, CKA badge)
- **Styling:** Global styles in `src/style.css`, component-scoped styles via `<style scoped>`

## Gallery

Photos live in a Cloudflare R2 bucket, not in the repo.

- `scripts/gallery-add.ts` writes three objects per photo: `originals/` (private
  source), `photos/` (long edge capped at 1600px), `thumbs/` (600px). Only the
  derived copies are public, so 1600px is the most anyone can take from the site.
  `sharp` strips EXIF, so GPS data never reaches the public objects.
- Image dimensions ride along as R2 custom metadata and are what the grid uses
  to reserve space, so tiles do not reflow as thumbnails load.
- `functions/api/gallery.ts` is a Pages Function that lists `photos/` via an R2
  binding named `GALLERY` and returns JSON. Image bytes are served from the
  bucket's own custom domain (`IMAGE_BASE_URL`, default
  `https://img.frednordell.com`), not through the Function.
- The upload script needs two dependencies that the app itself does not:
  `bun add -d sharp @aws-sdk/client-s3`. Credentials go in a gitignored `.env`
  (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, optional
  `R2_BUCKET`).
- `wrangler.jsonc` declares the `GALLERY` binding and `IMAGE_BASE_URL`, for both
  local dev and deployments. Local dev against the real bucket: `bun run build`
  then `bunx wrangler pages dev`.

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

Pages configuration lives in `wrangler.jsonc` rather than the dashboard. Because
that file sets `pages_build_output_dir`, it is the **source of truth**: the same
fields are visible but not editable in the dashboard, and `compatibility_date`
must be set explicitly (there is no "Latest"). Deleting the file and deploying
again returns control to the dashboard, keeping the last deployed values.

The one thing still configured in Cloudflare is the R2 bucket itself: create
`frednordell-gallery` and bind a custom domain (`img.frednordell.com`) to it so
image bytes are served over the CDN. If the bucket is missing, `/api/gallery`
fails and the gallery page shows its error state.
