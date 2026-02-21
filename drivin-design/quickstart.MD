# Quickstart — Stack & Getting Started

This document describes the **technology stack** and how to run the project. It supports the spec-driven workflow defined in `configuration.MD` and the product described in `spec.MD`.

**Current focus:** Web app + server only. Mobile development is deferred until the web MVP is complete. Server uses in-memory data.

---

## 1. Stack Overview

| Layer | Technology | Notes |
|-------|------------|--------|
| **Web** | React | SPA; build with Vite. |
| **Mobile** | Expo (React Native) | Same React patterns; easy OTA and app-store builds. |
| **Monorepo** | npm workspaces (or pnpm) | `apps/web`, `apps/mobile`, `packages/shared`. |
| **Shared code** | TypeScript | API client, types, validation, business rules. |
| **Real-time** | WebSockets (e.g. Socket.io or native WS) | Rooms, votes, reveal; same API contract for web and mobile. |
| **Backend** | Node.js (Express or Fastify) + TypeScript | REST + WebSocket server; can run in same repo or separate. |
| **Data** | In-memory or SQLite for MVP; Postgres later | Persist rooms, sessions, votes; optional Redis for presence. |
| **Auth (post-MVP)** | JWT + HTTP-only cookies or Bearer | Out of scope for MVP; stack choice TBD. |

**Design choice:** React + Expo keeps one mental model and shared TypeScript (API, types, rules) so the app is **easily migrated to mobile** without a rewrite; most logic lives in `packages/shared`.

### Version reference (recommended)

| Dependency | Version | Notes |
|------------|---------|--------|
| React | 18.x | Used by both web and Expo. |
| Vite | 5.x | React template: `npm create vite@latest app-name -- --template react-ts`. |
| Expo SDK | 52 or 53 | Use same major across the monorepo; `npx expo install` keeps compat. |
| TypeScript | 5.x | Shared across web, mobile, and server. |
| Node (runtime) | 20 LTS or 22 LTS | Required by Expo/Vite tooling. |

---

## 2. Monorepo Layout (Target)

```
poker-plan-it/
├── apps/
│   ├── web/                 # React (Vite)
│   └── mobile/              # Expo (React Native)
├── packages/
│   └── shared/              # TypeScript: API client, types, validation, business rules
├── server/                  # Optional: Node backend (or in apps/backend)
├── drivin-design/           # Spec and config (this folder)
│   ├── spec.MD
│   ├── configuration.MD
│   └── quickstart.MD
├── package.json             # Workspace root
└── README.md
```

---

## 3. Prerequisites

| Tool | Version | Notes |
|------|---------|--------|
| **Node.js** | 20 LTS or 22+ (LTS) | Required for Vite, Expo, and backend. Use [nodejs.org](https://nodejs.org) or `nvm install --lts`. |
| **npm** | 10+ | Bundled with Node 20+; use for install and workspace scripts. |
| **pnpm** | 8+ or 9+ | Optional; recommended for monorepos. Enable with `corepack enable` then `corepack prepare pnpm@latest --activate`. |
| **Expo** | — | No global install. Use `npx expo start` in `apps/mobile`; optionally [EAS CLI](https://docs.expo.dev/build/setup/) for cloud builds. |
| **Git** | — | For version control. |

**Workspace package names:** For the commands below to work, set the `"name"` in each app/package `package.json` to: `web`, `mobile`, `shared`, `server` (e.g. `apps/web/package.json` → `"name": "web"`). npm/pnpm use these names to target workspaces.

---

## 4. Quick Commands (Once Repo Is Set Up)

Run all commands from the **repo root** (`poker-plan-it/`).

### Install

| Package manager | Command |
|----------------|--------|
| npm | `npm install` |
| pnpm | `pnpm install` |

### Run apps (dev)

| Task | npm | pnpm |
|------|-----|------|
| Web (Vite) | `npm run dev -w web` | `pnpm --filter web dev` |
| Mobile (Expo) | `npm run start -w mobile` | `pnpm --filter mobile start` |
| Backend | `npm run dev -w server` | `pnpm --filter server dev` |

*npm:* `-w` is short for `--workspace`; the value is the package `name` (e.g. `web`). You can use a path instead: `npm run dev -w apps/web`.  
*pnpm:* `--filter` accepts package name or path, e.g. `pnpm --filter ./apps/web dev`.

### Build (production)

| Task | npm | pnpm |
|------|-----|------|
| Web | `npm run build -w web` | `pnpm --filter web build` |
| Mobile | `npm run build -w mobile` or use EAS | `pnpm --filter mobile build` |
| Shared (typecheck) | `npm run typecheck -w shared` | `pnpm --filter shared typecheck` |

### All workspaces

| Task | npm | pnpm |
|------|-----|------|
| Install deps everywhere | (same as root `npm install`) | `pnpm install` |
| Run script in all packages | `npm run build --workspaces` | `pnpm run -r build` |
| Run in parallel (e.g. all dev servers) | — | `pnpm run --parallel -r dev` |

*(Exact script names — e.g. `dev`, `start`, `build` — depend on each package’s `package.json`.)*

---

## 5. Where to Put What

- **API client, types, validation, business rules** → `packages/shared` (used by both web and mobile).
- **UI and platform-specific code** → `apps/web` or `apps/mobile`.
- **Real-time events** (join room, vote, reveal) → same WebSocket API; shared types in `packages/shared`.
- **Spec and process** → `drivin-design/` (`spec.MD`, `configuration.MD`, this file).

---

## 6. Reference to Spec & Config

- **What to build:** `drivin-design/spec.MD`
- **How to build it (workflow, AI rules):** `drivin-design/configuration.MD`
- **Data structures:** `drivin-design/data-model.MD`
- **Implementation tasks:** `drivin-design/tasks.MD`
- **UI/UX (themes, breakpoints, screens):** `drivin-design/ui-definition.MD`
- **Stack and quickstart:** this file (`drivin-design/quickstart.MD`)

When prompting AI to implement a slice, use: *"Implement [User Story X.Y] from spec.MD. Tech stack: see quickstart.MD."*
