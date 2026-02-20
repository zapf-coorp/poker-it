# Tasks — Spec-Driven Implementation

This file lists **implementation tasks** derived from the spec-driven workflow (`configuration.MD`), the product spec (`.spec.MD`), the data model (`data-model.MD`), and the stack (`quickstart.MD`). Tasks are grouped by phase; complete **Phase 1 (Architecture)** before starting feature slices.

---

## Phase 1: Create and Configure the Architecture

These tasks establish the monorepo, shared package, web app, mobile app, and server with no feature logic—only structure, tooling, and types. All choices must align with `quickstart.MD` and `data-model.MD`.

**Definition of done for Phase 1:** From repo root, `npm install` (or `pnpm install`) runs successfully; `npm run dev -w web`, `npm run start -w mobile`, and `npm run dev -w server` start each app; `npm run typecheck -w shared` passes; and the shared package exports types that match the data model.

---

### 1.1 Monorepo root

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 1.1.1 | Create repo root `package.json` with workspaces | `"workspaces": ["apps/*", "packages/*", "server"]` (or `server` in `apps/server` if preferred). Private root; no main entry. | quickstart.MD §2 |
| 1.1.2 | Add root scripts for install and workspace targets | Scripts (or docs) so that `npm run dev -w web`, `npm run start -w mobile`, `npm run dev -w server`, `npm run typecheck -w shared` work once packages exist. | quickstart.MD §4 |
| 1.1.3 | Add `.gitignore` at root | Ignore `node_modules`, `.env*`, build outputs, IDE, OS files, and any local DB files (e.g. `*.sqlite`). | — |
| 1.1.4 | Add root `README.md` | Short description of the project, link to `drivin-design/.spec.MD` and `drivin-design/quickstart.MD`, and “Quick start” section with install + run commands. | quickstart.MD |

---

### 1.2 Shared package (`packages/shared`)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 1.2.1 | Create `packages/shared` with `package.json` | Name: `"shared"`. TypeScript; `main`/`types` (or `exports`) point to built output; no React/Node-specific deps in shared. | quickstart.MD §1, §5 |
| 1.2.2 | Add TypeScript to shared | `tsconfig.json` with strict mode; output to `dist/` (or `build/`); `src/` as source. Script: `build` (tsc), `typecheck` (tsc --noEmit). | quickstart.MD |
| 1.2.3 | Define types from data model | Export TypeScript types/interfaces for: `Room`, `Participant`, `Item`, `Round`, `Vote`, `Session`; enums: `RoomState`, `DeckType`, `ParticipantRole`, `RoundState`. Match field names and optionality in `data-model.MD` §2 and §3. | data-model.MD |
| 1.2.4 | Add deck constants | Export deck definitions (e.g. FIBONACCI, LINEAR, TSHIRT) with `deckType` and `deckValues` arrays as in spec. | .spec.MD §5.1, data-model.MD §3.2 |
| 1.2.5 | Add API client skeleton | Minimal HTTP client (e.g. `fetch` wrapper) and/or WebSocket factory that accept base URL; no endpoints yet. Export from `packages/shared` so web and mobile can import. | quickstart.MD §1, §5 |
| 1.2.6 | Shared build and typecheck | Running `npm run build -w shared` and `npm run typecheck -w shared` from root succeeds. | quickstart.MD §4 |

---

### 1.3 Web app (`apps/web`)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 1.3.1 | Create Vite + React + TypeScript app | Use `npm create vite@latest apps/web -- --template react-ts` (or equivalent). Package name: `"web"`. | quickstart.MD §1, §2 |
| 1.3.2 | Add shared as workspace dependency | In `apps/web/package.json`, depend on `"shared": "workspace:*"` (or `"shared": "*"` for npm). Resolve and build shared before web in dev. | quickstart.MD §2 |
| 1.3.3 | Align TypeScript and React versions | TypeScript 5.x, React 18.x as in quickstart. Ensure Vite dev server runs and shows default Vite+React page. | quickstart.MD §1 |
| 1.3.4 | Configure env for API base URL | Use `import.meta.env.VITE_API_URL` (or similar) for backend base URL; document in README or quickstart. Default e.g. `http://localhost:3000`. | quickstart.MD, NFRs |
| 1.3.5 | Add script names | Scripts: `dev` (Vite dev), `build` (Vite build), `preview` (optional). Run from root: `npm run dev -w web` starts the app. | quickstart.MD §4 |

---

### 1.4 Mobile app (`apps/mobile`)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 1.4.1 | Create Expo app with TypeScript | Use `npx create-expo-app@latest apps/mobile -t expo-template-blank-typescript` (or current Expo template). Package name: `"mobile"`. | quickstart.MD §1, §2 |
| 1.4.2 | Add shared as workspace dependency | In `apps/mobile/package.json`, depend on `shared` workspace. Ensure Metro/build can resolve shared (Expo + monorepo docs). | quickstart.MD §2 |
| 1.4.3 | Align Expo SDK and React | Expo SDK 52 or 53, React 18.x. Run `npx expo start` from `apps/mobile` (or `npm run start -w mobile` from root) and open in simulator/Expo Go. | quickstart.MD §1 |
| 1.4.4 | Configure env for API base URL | Use Expo env (e.g. `EXPO_PUBLIC_API_URL` or `process.env.EXPO_PUBLIC_API_URL`) for backend; document default. | quickstart.MD |
| 1.4.5 | Add script names | Scripts: `start` (expo start), `build` (expo export or EAS). Run from root: `npm run start -w mobile` starts the app. | quickstart.MD §4 |

---

### 1.5 Server (`server`)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 1.5.1 | Create server package | Folder `server/` with `package.json`. Name: `"server"`. TypeScript; entry e.g. `src/index.ts`; build to `dist/`. | quickstart.MD §1, §2 |
| 1.5.2 | Add Express or Fastify + TypeScript | Install Express (or Fastify) and types. Minimal server: listen on port (e.g. 3000), respond with health route (e.g. `GET /health` → 200). | quickstart.MD §1 |
| 1.5.3 | Add shared as workspace dependency | Depend on `shared`; use shared types for future routes. No room/vote logic yet—only structure. | quickstart.MD §5, data-model.MD |
| 1.5.4 | Add build and dev scripts | Script: `build` (tsc), `dev` (ts-node or tsx watch, or build + node). Run from root: `npm run dev -w server` starts server and `GET /health` succeeds. | quickstart.MD §4 |
| 1.5.5 | Environment and port | Port from env (e.g. `PORT=3000`); document in README or quickstart. | quickstart.MD |

---

### 1.6 Tooling and quality (root or shared)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 1.6.1 | TypeScript base config (optional) | Root `tsconfig.base.json` with strict settings; apps/packages extend it where useful. Not required if each package is self-contained. | quickstart.MD |
| 1.6.2 | ESLint at root or per package | ESLint config that runs on `apps/*`, `packages/*`, `server`; TypeScript and React/Expo aware. Script at root: `lint` (e.g. `eslint .`). | configuration.MD §6 |
| 1.6.3 | Prettier (optional) | Prettier config at root; format JS/TS/JSON/MD. Optional script `format`. | configuration.MD §6 |

---

### 1.7 Documentation and references

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 1.7.1 | README quick start | Root README includes: clone, install, run web, run mobile, run server; reference to `drivin-design/quickstart.MD`. | quickstart.MD §4, §6 |
| 1.7.2 | Link tasks to spec | This file (`tasks.MD`) lives in `drivin-design/` and is referenced from `configuration.MD` or README so the team knows where to find the task list. | configuration.MD |

---

## Phase 1 completion checklist

Before moving to Phase 2 (first feature slice: Room Management):

- [ ] From repo root: `npm install` (or `pnpm install`) completes without errors.
- [ ] `npm run typecheck -w shared` passes.
- [ ] `npm run dev -w web` starts the web app; default page loads.
- [ ] `npm run start -w mobile` starts the Expo app; app runs in simulator or Expo Go.
- [ ] `npm run dev -w server` starts the server; `GET /health` returns 200.
- [ ] Shared package exports types for Room, Participant, Item, Round, Vote, Session and enums (RoomState, DeckType, ParticipantRole, RoundState).
- [ ] Root README describes how to run the project and points to `drivin-design/`.

---

## Phase 2 (placeholder)

After Phase 1 is complete, the next tasks will implement **Room Management** (User Stories 5.1–5.3, 5.4, 5.5) per `configuration.MD` §5 (slice ordering). Those tasks will be added here or in a separate slice file.

---

## Reference

| Document | Purpose |
|----------|--------|
| `drivin-design/.spec.MD` | What to build (product, user stories, success criteria). |
| `drivin-design/configuration.MD` | How to build (workflow, AI rules, slice order). |
| `drivin-design/data-model.MD` | Data structures and relationships. |
| `drivin-design/quickstart.MD` | Stack, versions, and commands. |
| `drivin-design/tasks.MD` | This file—implementation tasks. |
