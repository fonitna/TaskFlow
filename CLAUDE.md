# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (root)
```bash
npm run dev        # Start Vite dev server on http://localhost:3000 (HMR enabled)
npm run build      # Production build → dist/
npm run preview    # Serve production build locally
npm run lint       # Type-check with tsc --noEmit (no test runner configured)
npm run clean      # Remove dist/ and server.js
```

### Backend (`backend/`)
```bash
npm run dev        # Start API with ts-node-dev hot-reload on http://localhost:4000
npm run dev:fresh  # Kill port 4000 then start fresh (use when EADDRINUSE)
npm run build      # Compile TypeScript → dist/
npm run db:migrate # Run Prisma migrations
npm run db:seed    # Seed database with initial data
npm run db:studio  # Open Prisma Studio GUI
```

### Docker
```bash
docker compose up -d        # Build images and start both containers
docker compose down         # Stop and remove containers
docker compose build        # Rebuild images after code changes
docker compose logs -f      # Tail logs from all containers
docker compose down -v      # Stop and delete the data volume (full reset)
```

There is no test suite. `npm run lint` runs TypeScript type-checking only.

## Architecture

**TaskFlow** is a full-stack application: a React + TypeScript + Vite SPA frontend communicating with a Node.js + Express + Prisma backend over a versioned REST API. All data is persisted in SQLite.

### State & Data Flow

- [src/context/AppContext.tsx](src/context/AppContext.tsx) is the single source of truth for all client state. On mount it restores the JWT session via `GET /auth/me`, then hydrates users/projects/tasks/comments from the API. Every mutation calls the backend — optimistic updates are applied locally first, with error toast on failure.
- [src/lib/api.ts](src/lib/api.ts) is the typed fetch client. It reads/writes the JWT from `localStorage` under key `taskflow_token` and prepends `VITE_API_URL ?? 'http://localhost:4000'` to every request path.
- [src/types.ts](src/types.ts) defines shared frontend TypeScript interfaces (`Task`, `Project`, `User`, `Comment`, `TaskStatus`, `TaskPriority`).
- [src/data.ts](src/data.ts) still exists for reference constants (`COLUMNS`), but is no longer used for state hydration.

### Backend

- Entry point: [backend/src/index.ts](backend/src/index.ts) — Express app on port 4000, CORS open (`origin: true`) for all origins in development.
- Auth: JWT signed with `JWT_SECRET` (1 h expiry). `authenticateToken` middleware in [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts) attaches `req.userId`.
- ORM: Prisma 5 with SQLite. Schema at [backend/prisma/schema.prisma](backend/prisma/schema.prisma). Tables: `User`, `Project`, `ProjectMember`, `Task`, `TaskLabel`, `Comment`.
- Routes under `backend/src/routes/`: `auth`, `users`, `projects`, `tasks`, `allComments`, `comments` (nested under tasks).
- `GET /users` is intentionally public (no auth) so the login page can show user cards before login.
- Bulk task routes (`/tasks/bulk`, `/tasks/bulk/status`, `/tasks/bulk/unassign`) are defined **before** `/:id` routes to prevent Express capturing them as IDs.

### Routing

[src/App.tsx](src/App.tsx) owns all routing via React Router v7. `AppContent` renders a `<Routes>` block; unauthenticated users are redirected to `Login`. Routes: `/` (Dashboard), `/projects`, `/projects/:projectId`, `/search`, `/profile`, `/settings`.

### Key Patterns

- **Auth flow**: `loginUser(email, password)` → POST `/auth/login` → store JWT → hydrate app data. `registerUser(name, email, password, role, color)` → POST `/auth/register` → same.
- **Task creation**: `CreateTaskDrawer` → `AppContext.addTask()` → POST `/tasks` → append to local state.
- **Task editing**: inline in `TaskDetailModal` — optimistic `updateTask()` → PATCH `/tasks/:id` in background.
- **Kanban drag-drop**: `moveTask(id, status)` → optimistic update → PATCH `/tasks/:id/move`.
- **Profile update**: `updateCurrentUser({ name, color })` → PATCH `/users/:id` → update `currentUser` + `users` list in state.
- **Toast notifications**: call `AppContext.showToast(message, type)` — auto-dismiss after 3 s.
- **Theme**: stored in `localStorage` as `taskflow_theme`; toggled via `AppContext.toggleTheme()`; dark-mode styles are CSS class overrides in [src/index.css](src/index.css).

### Responsive Layout

- ≥768 px: sidebar visible, collapsible
- <768 px: sidebar hidden by default, toggled via hamburger
- <480 px: sidebar replaced by a fixed bottom nav bar (5 tabs)

### Docker

- [Dockerfile.frontend](Dockerfile.frontend): multi-stage — Node builds Vite, nginx serves static files + proxies `/api/` to backend.
- [backend/Dockerfile](backend/Dockerfile): Node 20 Alpine + OpenSSL (required by Prisma) + entrypoint that runs migrations, seeds on first run, then starts API.
- [nginx.conf](nginx.conf): SPA fallback (`try_files`) + `location /api/` proxy to `http://backend:4000`.
- [docker-compose.yml](docker-compose.yml): frontend on host port **3500**, backend internal only. Named volume `taskflow-data` persists the SQLite file at `/data/taskflow.db`.
- Build arg `VITE_API_URL=""` makes the frontend use relative URL `/api/v1` so nginx can proxy it.

## Environment

### Frontend — `.env`
```
GEMINI_API_KEY=   # Google Generative AI key (AI features not yet wired up)
VITE_API_URL=     # Leave blank for Docker; default http://localhost:4000 for dev
```

### Backend — `backend/.env`
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="..."
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

## Styling

Tailwind CSS v4. Custom brand tokens are declared in [src/index.css](src/index.css):
- Primary: `#378ADD`
- Background (light): `#F1EFE8` / (dark): `#121212`
- Fonts: Inter (body), JetBrains Mono (monospace)

Add new utility variants or component overrides in `index.css`; avoid inline styles.
