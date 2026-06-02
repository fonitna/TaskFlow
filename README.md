<div align="center">

# TaskFlow

**Enterprise Team Task Management Workspace**

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite)
![JWT](https://img.shields.io/badge/JWT-Auth-FB015B?style=flat-square&logo=jsonwebtokens)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)

A full-stack, responsive project and task management application with Kanban boards, real-time collaboration, JWT authentication, a persistent SQLite backend, and Docker Compose deployment.

</div>

---

## Overview

TaskFlow is a modern team workspace built for managing projects, tasks, and collaboration across multiple users. It provides an interactive Kanban board interface, filterable list views, global search, and detailed task discussions — all backed by a RESTful API with JWT-secured authentication and a relational SQLite database.

The application is built as a React SPA frontend communicating with a Node.js + Express backend through a versioned REST API (`/api/v1`). All data is persisted in SQLite via Prisma ORM. The entire stack can be deployed with a single `docker compose up -d` command.

---

## Core Problem Solved

Teams typically track work across disconnected tools — spreadsheets for task lists, chat messages for status updates, and email threads for feedback. TaskFlow brings projects, tasks, assignees, due dates, priority levels, labels, and comments into a single coherent workspace. The Kanban board visualizes workflow stages at a glance, while the list view enables sorting and bulk operations for power users.

---

## Key Features

**Authentication & Users**
- JWT-based login with bcrypt password hashing (cost factor 12)
- User registration with name, email, password, role, and avatar color selection
- Persistent sessions restored from token on page reload via `GET /auth/me`
- Profile editing (name, avatar color) persisted to the database

**Project Management**
- Create, update, and delete projects with color-coded identifiers
- Assign team members per project
- Drag-and-drop project reordering
- Per-project progress tracking (percentage of tasks done)

**Task Management**
- Full CRUD for tasks with title, description, status, priority, assignee, due date, and labels
- Inline editing directly inside the task detail modal
- Drag-and-drop between Kanban columns (To Do → In Progress → In Review → Done)
- Kanban board view and sortable list view per project
- Overdue detection with real-time date comparison
- Bulk operations: move status, unassign, delete

**Comments & Collaboration**
- Threaded discussion on every task
- Relative time display ("2h ago", "3d ago")
- Character limit enforcement (2 000 chars)

**Search & Navigation**
- Global search modal (Ctrl+K / Cmd+K) across tasks, projects, and people
- Faceted filters on project boards: assignee, priority, status, keyword

**UI & Accessibility**
- Light / Dark mode toggle with localStorage persistence
- Fully responsive: sidebar on desktop, hamburger on tablet, bottom nav on mobile (< 480 px)
- Smooth animations powered by Motion (Framer Motion v12)
- Toast notification system (auto-dismiss after 3 s)
- Optimistic UI updates — mutations reflect instantly, revert on API error

---

## Technical Foundation

**Frontend**
- React 19 with TypeScript 5.8
- Vite 6 (dev server, HMR, production build)
- Tailwind CSS v4 (utility-first, custom brand tokens)
- React Router v7 (client-side SPA routing)
- Motion 12 (animations)
- Lucide React (icons)
- `@google/genai` SDK installed (AI features ready to wire up)

**Backend**
- Node.js + Express 4 with TypeScript
- Prisma 5 ORM with SQLite database
- `bcryptjs` for password hashing (cost factor 12)
- `jsonwebtoken` for JWT signing (1 h expiry)
- `cors` with full preflight support (`origin: true` in development)
- `ts-node-dev` for development with hot reload

**Docker**
- Multi-stage frontend build (Node → nginx)
- nginx reverse proxy: serves static SPA + forwards `/api/` to backend container
- Automatic database migration and first-run seed via entrypoint script
- Named volume for SQLite persistence across container restarts

**Architecture**
- Fully decoupled: frontend on port 3000, backend API on port 4000 (dev) / port 3500 combined (Docker)
- All state managed through a single React Context (`AppContext`) that calls the backend
- `src/lib/api.ts` — typed fetch client; reads JWT from `localStorage`, uses `VITE_API_URL` env var for the base URL (empty in Docker → relative `/api/v1` → nginx proxy)
- Optimistic UI updates for mutations (delete, move, update) with error revert via toast
- Async mutations (create task, create project, add comment) await the API response for canonical IDs

---

## Project Structure

```
TaskFlow/
├── src/                        # React frontend
│   ├── context/
│   │   └── AppContext.tsx       # Single source of truth — all API calls live here
│   ├── lib/
│   │   └── api.ts              # Typed fetch client + JWT token management
│   ├── pages/
│   │   ├── Dashboard.tsx       # Home: stats, overdue, project progress
│   │   ├── ProjectsIndex.tsx   # All projects list
│   │   ├── ProjectDetail.tsx   # Kanban board + list view per project
│   │   ├── GlobalSearchResults.tsx
│   │   ├── Profile.tsx         # User profile editor (calls PATCH /users/:id)
│   │   ├── Settings.tsx        # App settings
│   │   └── Login.tsx           # Sign in (card picker + password) + registration
│   ├── components/
│   │   ├── CreateTaskDrawer.tsx
│   │   ├── TaskDetailModal.tsx
│   │   ├── TaskCard.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── ToastContainer.tsx
│   ├── types.ts                # Shared TypeScript interfaces
│   └── App.tsx                 # Router + AppProvider wrapper
│
├── backend/                    # Express API
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (User, Project, Task, Comment, labels)
│   │   ├── seed.ts             # Initial data seeder (5 users, 3 projects, 10 tasks)
│   │   └── migrations/         # Prisma migration files
│   ├── src/
│   │   ├── index.ts            # Express entry point (port 4000)
│   │   ├── middleware/
│   │   │   └── auth.ts         # JWT authenticateToken middleware
│   │   ├── lib/
│   │   │   └── prisma.ts       # PrismaClient singleton
│   │   └── routes/
│   │       ├── auth.ts         # POST /auth/register, /login; GET /auth/me
│   │       ├── users.ts        # GET /users (public); PATCH /users/:id
│   │       ├── projects.ts     # Full CRUD + reorder
│   │       ├── tasks.ts        # Full CRUD + move + bulk ops
│   │       ├── comments.ts     # GET + POST /tasks/:taskId/comments
│   │       └── allComments.ts  # GET /comments (bulk fetch on login)
│   ├── Dockerfile              # Node 20 Alpine + OpenSSL + entrypoint
│   ├── entrypoint.sh           # migrate → seed (first run only) → start API
│   └── .env.example
│
├── Dockerfile.frontend         # Multi-stage: Node builds Vite → nginx serves + proxies
├── nginx.conf                  # SPA fallback + /api/ proxy to backend container
├── docker-compose.yml          # Frontend (port 3500) + Backend (internal) + data volume
└── .env.example
```

---

## Database Schema

The database uses SQLite with the following tables managed by Prisma:

| Table | Purpose |
|---|---|
| `User` | Registered users with hashed passwords, initials, and avatar color |
| `Project` | Named projects with hex color identity |
| `ProjectMember` | Junction table linking users to projects (many-to-many) |
| `Task` | Tasks belonging to a project, with status, priority, assignee, and due date |
| `TaskLabel` | Labels/tags attached to tasks (normalized junction table) |
| `Comment` | Discussion threads on tasks, authored by users |

Key relationships:
- A `Project` has many `Tasks` (cascade delete)
- A `Task` belongs to one `Project` and optionally one `User` (assignee, set null on delete)
- A `Task` has many `Comments` (cascade delete) and many `TaskLabels` (cascade delete)
- A `User` can be a member of many `Projects` via `ProjectMember`

---

## API Endpoints

Base URL (dev): `http://localhost:4000/api/v1`
Base URL (Docker): `http://localhost:3500/api/v1`

All endpoints except `POST /auth/register`, `POST /auth/login`, and `GET /users` require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create account, returns JWT + user |
| POST | `/auth/login` | Login, returns JWT + user |
| GET | `/auth/me` | Get current user from token |
| GET | `/users` | List all users (public — used by login page) |
| PATCH | `/users/:id` | Update own profile (name, role, color) |
| GET | `/projects` | List all projects |
| POST | `/projects` | Create project |
| PATCH | `/projects/reorder` | Reorder projects by index |
| GET | `/projects/:id` | Get single project |
| PATCH | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project (cascades tasks + comments) |
| GET | `/tasks` | List tasks (filter: projectId, status, priority, assigneeId) |
| POST | `/tasks` | Create task |
| DELETE | `/tasks/bulk` | Bulk delete tasks |
| PATCH | `/tasks/bulk/status` | Bulk move tasks to status |
| PATCH | `/tasks/bulk/unassign` | Bulk unassign tasks |
| GET | `/tasks/:id` | Get single task |
| PATCH | `/tasks/:id` | Update task fields |
| PATCH | `/tasks/:id/move` | Move task to new status (drag-and-drop) |
| DELETE | `/tasks/:id` | Delete task |
| GET | `/tasks/:taskId/comments` | Get comments for a task |
| POST | `/tasks/:taskId/comments` | Post a comment |
| GET | `/comments` | Get all comments (context hydration on login) |
| GET | `/health` | Health check |

---

## Getting Started

### Option A — Docker (Recommended)

Requires Docker Desktop. No Node.js installation needed.

```bash
docker compose up -d
```

Open **http://localhost:3500** — migrations run automatically, database seeded on first start.

To stop:
```bash
docker compose down
```

To reset everything including data:
```bash
docker compose down -v
```

---

### Option B — Local Development

#### Prerequisites

- Node.js 18 or higher
- npm

#### 1. Install dependencies

```bash
# Frontend
npm install

# Backend
cd backend && npm install
```

#### 2. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

#### 3. Initialize the database

```bash
cd backend
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
```

#### 4. Start both servers (two terminals)

**Terminal 1 — Backend**
```bash
cd backend
npm run dev
# → TaskFlow API running on http://localhost:4000
```

**Terminal 2 — Frontend**
```bash
npm run dev
# → http://localhost:3000
```

> If you see `EADDRINUSE: address already in use :::4000`, run `npm run dev:fresh` instead.

---

## Default Accounts

All seeded users share the password **`password123`**.

| Name | Email | Role |
|---|---|---|
| Alex Chen | alex@taskflow.dev | PM |
| Priya Sharma | priya@taskflow.dev | Developer |
| Jordan Lee | jordan@taskflow.dev | Designer |
| Marco Rossi | marco@taskflow.dev | Developer |
| Sara Kim | sara@taskflow.dev | QA |

---

## Available Scripts

### Frontend (root)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 3000 with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run lint` | TypeScript type-check (`tsc --noEmit`) |
| `npm run clean` | Remove `dist/` and `server.js` |

### Backend (`backend/`)

| Script | Description |
|---|---|
| `npm run dev` | Start API with ts-node-dev (hot reload) |
| `npm run dev:fresh` | Kill port 4000 then start fresh |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run start` | Run compiled production build |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database with initial data |
| `npm run db:studio` | Open Prisma Studio GUI |

### Docker

| Command | Description |
|---|---|
| `docker compose up -d` | Build images and start all containers |
| `docker compose down` | Stop and remove containers |
| `docker compose build` | Rebuild images after code changes |
| `docker compose logs -f` | Stream logs from all containers |
| `docker compose down -v` | Stop containers and delete data volume |

---

## Port Reference

| Service | Port | Context |
|---|---|---|
| Frontend dev server | 3000 | Local development |
| Backend API | 4000 | Local development |
| TaskFlow Docker (combined) | **3500** | Docker Compose |

Port 3500 was chosen to avoid conflicts with other projects (e.g. FITM Atlas uses 3000 + 8080).

---

## Styling

Tailwind CSS v4. Custom brand tokens defined in `src/index.css`:

| Token | Value | Usage |
|---|---|---|
| Primary | `#378ADD` | Buttons, active states, links |
| Background (light) | `#F1EFE8` | Page background |
| Background (dark) | `#121212` | Dark mode page background |
| Danger | `#E24B4A` | Delete actions, error states |
| Success | `#639922` | Done status, success toasts |
| Warning | `#BA7517` | High priority, in-review status |

Fonts: **Inter** (body), **JetBrains Mono** (monospace/IDs)

---

## Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| ≥ 768 px | Sidebar visible, collapsible |
| < 768 px | Sidebar hidden, toggled via hamburger |
| < 480 px | Sidebar replaced by fixed bottom navigation bar (5 tabs) |

---

## Environment Variables

### Frontend — `.env`

```env
GEMINI_API_KEY=    # Google Generative AI key (AI features not yet wired up)
VITE_API_URL=      # Leave blank for Docker (uses relative /api/v1 via nginx proxy)
                   # Defaults to http://localhost:4000 in local development
```

### Backend — `backend/.env`

```env
DATABASE_URL="file:./dev.db"         # SQLite file path
JWT_SECRET="..."                     # Secret for signing JWTs (keep long & random)
PORT=4000                            # API server port
FRONTEND_URL="http://localhost:3000" # Allowed CORS origin
```

---

## License

Apache 2.0 — see individual source files for SPDX headers.
