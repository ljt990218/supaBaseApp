# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Development Server**: `pnpm dev`
- **Build**: `pnpm build` (includes type checking via `vue-tsc`)
- **Preview Build**: `pnpm preview`
- **Type Check**: `vue-tsc -b`

## Architecture & Structure

- **Framework**: Vue 3 with Composition API (`<script setup lang="ts">`) and Vite.
- **Language**: TypeScript.
- **Styling**: Tailwind CSS v4 configured via `@tailwindcss/vite`. Global styles in `src/style.css`.
- **UI Library**: Uses `shadcn-vue` components located in `src/components/ui`.
- **Backend**: Supabase integration.
  - Client initialized in `src/lib/supabase.ts`.
  - Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables.
- **Package Manager**: pnpm.

## Path Aliases

- `@/*` maps to `src/*`.
- `components/*` maps to `src/components/*`.
- `lib/*` maps to `src/lib/*`.
- `ui/*` maps to `src/components/ui/*`.
