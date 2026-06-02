# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on http://localhost:3000 (HMR enabled)
npm run build      # Production build → dist/
npm run preview    # Serve production build locally
npm run lint       # Type-check with tsc --noEmit (no test runner configured)
npm run clean      # Remove dist/ and server.js
```

There is no test suite. `npm run lint` runs TypeScript type-checking only.

## Architecture

**TaskFlow** is a fully client-side React + TypeScript + Vite SPA — no backend API. All data lives in `localStorage`.

### State & Data Flow

- [src/context/AppContext.tsx](src/context/AppContext.tsx) is the single source of truth. It exposes all state (users, projects, tasks, comments, theme, toasts) via a React Context and provides all mutation functions. Every component reads from and writes through this context.
- [src/data.ts](src/data.ts) seeds initial data and handles localStorage serialization. Keys: `taskflow_users`, `taskflow_projects`, `taskflow_tasks`, `taskflow_comments`, `taskflow_current_user`, `taskflow_theme`.
- [src/types.ts](src/types.ts) defines all shared TypeScript interfaces (`Task`, `Project`, `User`, `Comment`, `TaskStatus`, `TaskPriority`).

### Routing

[src/App.tsx](src/App.tsx) owns all routing via React Router v7. `AppContent` renders a `<Routes>` block; unauthenticated users are redirected to `Login`. Routes: `/` (Dashboard), `/projects`, `/projects/:projectId`, `/search`, `/profile`, `/settings`.

### Key Patterns

- **Task creation**: always goes through `CreateTaskDrawer` → `AppContext.addTask()`
- **Task editing**: inline via `TaskDetailModal` — title and description are editable in-place; other fields use dropdown controls
- **Kanban columns**: fixed set of four statuses — `todo | in_progress | in_review | done`
- **Toast notifications**: call `AppContext.addToast({ message, type })` — auto-dismiss after 3 s
- **Theme**: stored in localStorage as `taskflow_theme`; toggled via `AppContext.toggleTheme()`; dark-mode styles are CSS class overrides in [src/index.css](src/index.css)

### Responsive Layout

- ≥768 px: sidebar visible, collapsible
- <768 px: sidebar hidden by default, toggled via hamburger
- <480 px: sidebar replaced by a fixed bottom nav bar (5 tabs)

## Environment

Copy `.env.example` → `.env` and set:

```
GEMINI_API_KEY=   # Google Generative AI key (auto-injected on Google AI Studio)
```

The Gemini SDK (`@google/genai`) is installed but AI features are not yet wired up in components.

## Styling

Tailwind CSS v4. Custom brand tokens are declared in [src/index.css](src/index.css):
- Primary: `#378ADD`
- Background (light): `#F1EFE8` / (dark): `#121212`
- Fonts: Inter (body), JetBrains Mono (monospace)

Add new utility variants or component overrides in `index.css`; avoid inline styles.
