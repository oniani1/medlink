# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MedLink is a medical communication app for the Georgian market. It's a React SPA styled as a mobile phone frame, with role-based access for doctors, patients, and assistants. Built with Google AI Studio and uses the Gemini API.

## Development Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server on port 3000
npm run build     # Production build via Vite
npm run preview   # Preview production build
```

No test runner or linter is configured.

## Architecture

**Stack:** React 19 + TypeScript, Vite, Zustand (state), React Router v7 (HashRouter), Tailwind CSS (via CDN in index.html), date-fns, react-icons.

**Flat source layout** — no `src/` directory. All source files are at the root level:
- `App.tsx` — Route definitions and `ProtectedLayout` wrapper
- `store.ts` — Single Zustand store (`useStore`) with all app state and actions
- `types.ts` — All TypeScript interfaces (User, Doctor, Patient, Conversation, Message, etc.)
- `utils.ts` — Translation dictionaries (ka/en/ru), `isAfterHours()`, `formatCurrency()`, `generateId()`
- `index.tsx` — React entry point

**Key directories:**
- `features/` — Screen-level components: Auth, Inbox, Chat, Anamnesis, Doctor, Patient, Settings
- `components/` — Shared layout: `PhoneFrame`, `TopBar`, `BottomNav`, `RoleSwitcher` (Layout.tsx), reusable UI primitives (UI.tsx)
- `data/mockData.ts` — Seeds localStorage with mock doctors, patients, conversations, and messages

**State & Persistence:** All data is stored in localStorage under `medlink_*` keys. The Zustand store loads from localStorage on init and saves after mutations. Mock data is seeded on first load via `seedMockData()` with schema migration support.

**Routing:** Uses `HashRouter`. Auth routes (`/auth/login`, `/auth/role`) are public. All other routes go through `ProtectedLayout` which requires `currentUser` to be set.

**Roles:** Three user roles — `doctor`, `patient`, `assistant`. The `RoleSwitcher` component allows switching between mock users during development. Navigation items differ by role.

**i18n:** Inline translation dictionary in `utils.ts` with Georgian (ka) as primary language, English (en), and partial Russian (ru). Access via `translations[language]` pattern.

## Environment

Set `GEMINI_API_KEY` in `.env.local` for AI features. It's exposed to client code via Vite's `define` as `process.env.GEMINI_API_KEY`.

## Key Patterns

- Path alias: `@` maps to project root (configured in vite.config.ts)
- Currency is displayed in GEL (Georgian Lari)
- Doctor availability is determined by `workingHours` schedule + `isManuallyBusy` flag + exception dates
- Connection flow: patient sends request → doctor accepts/declines → acceptance auto-creates a Conversation
- After-hours messaging has paid urgent and free silent options
