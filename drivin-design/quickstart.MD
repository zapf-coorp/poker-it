# Quickstart — Stack, Testing & Getting Started

This document describes the **technology stack**, **testing tools**, and how to run and test the project. It supports the spec-driven, TDD-first workflow defined in `configuration.MD` and the product described in `spec.MD`.

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

## 2. Testing Stack

Testing is **mandatory and test-first**. No production code is written before a failing test exists. See `configuration.MD` §3 for the full TDD mandate.

### 2.1 Testing Tools

| Tool | Used in | Purpose |
|------|---------|---------|
| **Vitest** | web, server | Fast unit and integration test runner; compatible with Vite. |
| **React Testing Library** | web | Component and integration tests; tests behavior, not implementation. |
| **@testing-library/user-event** | web | Simulates real user interactions (click, type, keyboard). |
| **@testing-library/jest-dom** | web | Custom matchers for DOM assertions (`toBeInTheDocument`, `toHaveValue`, etc.). |
| **msw (Mock Service Worker)** | web, shared | Intercepts HTTP requests in tests; no real network calls. |
| **supertest** | server | HTTP integration tests for Express/Fastify routes. |
| **@vitest/coverage-v8** | web, server | Code coverage reports; enforces coverage thresholds. |
| **Playwright** *(post-MVP)* | E2E | Full browser E2E tests for critical user flows. |

### 2.2 Version reference (testing)

| Dependency | Version | Notes |
|------------|---------|--------|
| vitest | 2.x | Use `vitest` and `@vitest/coverage-v8`. |
| @testing-library/react | 16.x | Requires React 18+. |
| @testing-library/user-event | 14.x | Use `userEvent.setup()` pattern. |
| @testing-library/jest-dom | 6.x | Import in `setupTests.ts`. |
| msw | 2.x | Use `http` and `HttpResponse` from `msw`; set up `server` with `setupServer`. |
| supertest | 7.x | Import as `import request from 'supertest'`. |
| @vitest/coverage-v8 | 2.x | Same version as vitest. |

### 2.3 Test File Conventions

- Test files live **next to the file they test** or in a `__tests__/` folder at the same level.
- Naming: `ComponentName.test.tsx`, `hookName.test.ts`, `routeName.test.ts`.
- Each test file imports only what it needs; mock external dependencies (API, WebSocket, storage).
- Tests must be deterministic: no random data, no real network calls, no real timers unless explicitly tested.
- Use `describe` blocks to group tests by scenario; use `it` or `test` with a clear behavior description.

### 2.4 Test Structure Pattern

```
// 1. Arrange — set up mocks, render component, prepare data
// 2. Act — trigger user interaction or call the function
// 3. Assert — verify the expected outcome
```

### 2.5 msw Setup Pattern (web)

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/rooms', () => {
    return HttpResponse.json({ room: { id: '123', name: 'Test Room' }, participant: { id: 'p1' }, shareableLink: '/room/123' });
  }),
];

// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
export const server = setupServer(...handlers);

// vitest.setup.ts
import { server } from './src/mocks/server';
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 2.6 React Testing Library Pattern

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateRoom } from './CreateRoom';

it('shows error when room name is empty', async () => {
  const user = userEvent.setup();
  render(<CreateRoom />);
  await user.click(screen.getByRole('button', { name: /create room/i }));
  expect(screen.getByText(/room name is required/i)).toBeInTheDocument();
});
```

### 2.7 supertest Pattern (server)

```typescript
import request from 'supertest';
import { app } from '../src/app';

it('POST /api/rooms returns 201 with room', async () => {
  const res = await request(app)
    .post('/api/rooms')
    .send({ name: 'Sprint 42', deckType: 'FIBONACCI' });
  expect(res.status).toBe(201);
  expect(res.body.room.name).toBe('Sprint 42');
});
```

---

## 3. Monorepo Layout (Target)

```
poker-plan-it/
├── apps/
│   ├── web/                 # React (Vite)
│   │   ├── src/
│   │   │   ├── components/  # Presentational components + *.test.tsx
│   │   │   ├── hooks/       # Custom hooks + *.test.ts
│   │   │   ├── pages/       # Page components + *.test.tsx
│   │   │   ├── mocks/       # msw handlers and server setup
│   │   │   └── ...
│   │   ├── vitest.config.ts
│   │   └── vitest.setup.ts
│   └── mobile/              # Expo (React Native)
├── packages/
│   └── shared/              # TypeScript: API client, types, validation, business rules
│       └── src/
│           ├── api.ts + api.test.ts
│           └── types.ts
├── server/                  # Node backend
│   ├── src/
│   │   ├── routes/          # Route handlers + *.test.ts
│   │   ├── services/        # Business logic + *.test.ts
│   │   └── ...
│   └── vitest.config.ts
├── drivin-design/           # Spec and config (this folder)
│   ├── spec.MD
│   ├── configuration.MD
│   ├── quickstart.MD
│   ├── tasks.MD
│   ├── ui-definition.MD
│   └── data-model.MD
├── package.json             # Workspace root
└── README.md
```

---

## 4. Prerequisites

| Tool | Version | Notes |
|------|---------|--------|
| **Node.js** | 20 LTS or 22+ (LTS) | Required for Vite, Expo, and backend. Use [nodejs.org](https://nodejs.org) or `nvm install --lts`. |
| **npm** | 10+ | Bundled with Node 20+; use for install and workspace scripts. |
| **pnpm** | 8+ or 9+ | Optional; recommended for monorepos. Enable with `corepack enable` then `corepack prepare pnpm@latest --activate`. |
| **Expo** | — | No global install. Use `npx expo start` in `apps/mobile`. |
| **Git** | — | For version control. |

**Workspace package names:** For the commands below to work, set the `"name"` in each app/package `package.json` to: `web`, `mobile`, `shared`, `server`.

---

## 5. Quick Commands (Once Repo Is Set Up)

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

### Test (TDD — run these first)

| Task | npm | pnpm |
|------|-----|------|
| All tests | `npm run test` | `pnpm run -r test` |
| Web tests | `npm run test -w web` | `pnpm --filter web test` |
| Server tests | `npm run test -w server` | `pnpm --filter server test` |
| Web tests (watch) | `npm run test:watch -w web` | `pnpm --filter web test:watch` |
| Server tests (watch) | `npm run test:watch -w server` | `pnpm --filter server test:watch` |
| Coverage (web) | `npm run test:coverage -w web` | `pnpm --filter web test:coverage` |
| Coverage (server) | `npm run test:coverage -w server` | `pnpm --filter server test:coverage` |

**TDD workflow:** Keep `test:watch` running in a terminal while developing. Write a failing test, then implement until it passes.

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

*(Exact script names — e.g. `dev`, `start`, `build`, `test` — depend on each package's `package.json`.)*

---

## 6. Where to Put What

- **API client, types, validation, business rules** → `packages/shared` (used by both web and mobile).
- **UI and platform-specific code** → `apps/web` or `apps/mobile`.
- **Real-time events** (join room, vote, reveal) → same WebSocket API; shared types in `packages/shared`.
- **Tests** → next to the file they test (e.g. `Button.tsx` + `Button.test.tsx`).
- **API mocks (msw)** → `apps/web/src/mocks/` (handlers + server setup).
- **Spec and process** → `drivin-design/` (`spec.MD`, `configuration.MD`, this file).

---

## 7. Reference to Spec & Config

- **What to build:** `drivin-design/spec.MD`
- **How to build it (TDD workflow, AI rules):** `drivin-design/configuration.MD`
- **Data structures:** `drivin-design/data-model.MD`
- **Implementation tasks (with TEST tasks):** `drivin-design/tasks.MD`
- **UI/UX (themes, breakpoints, screens):** `drivin-design/ui-definition.MD`
- **Stack and quickstart:** this file (`drivin-design/quickstart.MD`)

When prompting AI to implement a slice, use:
1. *"Write tests for [User Story X.Y] from spec.MD. Cover all success criteria and error paths. Do not write any production code yet."*
2. *"Now implement [User Story X.Y] to make those tests pass. Tech stack: see quickstart.MD."*
