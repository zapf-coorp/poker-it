# Tasks 2 — Full implementation checklist for [spec2.MD](./spec2.MD)

This file is the **executable task list** for ports & adapters: **SQLite / PostgreSQL**, **WebSocket / Firebase**, and **cross-cutting** wiring. Functional behavior stays defined in [spec.MD](./spec.MD).

**Engineering standards:** follow [`.cursor/skills/typescript-react-best-practices/SKILL.md`](../.cursor/skills/typescript-react-best-practices/SKILL.md) everywhere TypeScript/React applies — `strict` typing, `import type`, discriminated unions for events/async state, **no `any`**, shared types in `packages/shared`, thin `api`/socket layers in the web app, hooks for orchestration, presentational components.

**Suggested execution order** (from spec2 §6): **A → (B + F1–F4) → C (+ E partial) → G → D → E → H → I → X** (X overlaps early via composition root; finish X when all adapters exist).

---

## Master epic — Spec2 “done”

- [ ] **M.1** Ports exist; HTTP and tests do not import DB drivers or Firebase from domain code.
- [ ] **M.2** `DATABASE_URL` (or equivalent) selects **in-memory** (dev default), **SQLite**, or **PostgreSQL** with documented env.
- [ ] **M.3** `REALTIME_DRIVER` selects **websocket** (Socket.IO) or **firebase** with fail-fast on bad config.
- [ ] **M.4** Same repository integration tests run against **in-memory** baseline; **SQLite** and **Postgres** in CI matrix where applicable.
- [ ] **M.5** Web client uses **one** channel abstraction (`useRoomChannel` or equivalent) + shared `ServerRealtimeEvent` types where possible.
- [ ] **M.6** `ARCHITECTURE.md` + ADRs cover adapters, reconnect (REST authoritative), backup, and logging rules.

---

# Phase A — Inventory and seam identification (spec2 §3 A)

- [ ] **A.1** Route/use-case map: every `server` REST handler → store/port operation (extend table in `drivin-design/ARCHITECTURE.md` or §0 of this file).
- [ ] **A.2** **Reference schema** doc: map current in-memory entities (`Room`, `Participant`, `Session`, `Item`, `Round`, `Vote`) to **normalized tables** (columns, PKs, FKs, enums). Store in `drivin-design/data-model-sql.MD` or under `server/migrations/README.md`.
- [ ] **A.3** Dialect notes: SQLite (file URL, booleans as 0/1, locking); Postgres (`UUID`/`TEXT`, schemas, `SSL`, pool). One short subsection each in `ARCHITECTURE.md`.
- [ ] **A.4** **Query style decision:** raw SQL with `pg` + `better-sqlite3` (or chosen libs) vs minimal helper — record in ADR; **no** ORM requirement unless team chooses one (then update spec2).

---

# Phase B — Ports + in-memory adapter + HTTP refactor (spec2 §3 B)

**Rules:** Port modules under `server/src/ports/` — **zero** imports from `express`, `socket.io`, `pg`, SQLite, Firebase.

### B.1 — Port interfaces

- [ ] **B.1.1** `server/src/ports/clock.ts` — `Clock`: `now(): number`.
- [ ] **B.1.2** `server/src/ports/ids.ts` — `IdGenerator`: `randomId(): string`.
- [ ] **B.1.3** `room-repository.ts` — create/get/close room; deck + state; align with [store.ts](../server/src/store.ts) capabilities.
- [ ] **B.1.4** `participant-repository.ts` — join, leave, reactivate, list active.
- [ ] **B.1.5** `item-repository.ts` — CRUD items, list by room, final estimate.
- [ ] **B.1.6** `vote-repository.ts` — cast/remove vote, reveal, revote, reads needed by routes (rounds, counts, by participant).
- [ ] **B.1.7** `session-repository.ts` **or** fold session into room port — document choice in ADR.
- [ ] **B.1.8** Optional `UnitOfWork` / `Transaction` port stub for future Postgres transactions.
- [ ] **B.1.9** `server/src/ports/index.ts` barrel exports; **`import type`** for `shared` models.
- [ ] **B.1.10** ADR: **facade** (`PlanningPokerStore`) vs many small repository classes.

### B.2 — In-memory implementation

- [ ] **B.2.1** `server/src/adapters/memory/in-memory-store.ts` — private `Map`s; implements composed port surface.
- [ ] **B.2.2** Migrate all logic from `store.ts` into the class; **identical** errors and edge cases.
- [ ] **B.2.3** Remove or thin `store.ts`; grep and fix all imports.
- [ ] **B.2.4** Constructor-inject `Clock` + `IdGenerator`.
- [ ] **B.2.5** No exported raw Maps; no route reaches into storage internals.

### B.3 — Composition root + routes

- [ ] **B.3.1** `createAppDeps(env)` (or `composition-root.ts`) builds store implementation + broadcaster + logger stub.
- [ ] **B.3.2** `registerRoutes(app, deps)` / split `server/src/routes/*.ts`; `index.ts` only boots HTTP + WS + static.
- [ ] **B.3.3** All mutations go through `deps.store` (or use-case layer).
- [ ] **B.3.4** Socket.IO handlers use same `deps` as HTTP.

### B.4 — Tests (in-memory)

- [ ] **B.4.1** `in-memory-store` tests with fixed clock/ids.
- [ ] **B.4.2** Happy paths: create room → join → item → vote → reveal → close.
- [ ] **B.4.3** Existing `server` API tests green after refactor.

---

# Phase F — Event model + broadcaster core (spec2 §4 F) — do with B

### F.1 — Versioned events (prefer shared package)

- [ ] **F.1.1** Add `packages/shared/src/realtime-events.ts` (or `server` only if web must not depend — prefer **shared** for type-safe client listeners per SKILL).
- [ ] **F.1.2** `REALTIME_PROTOCOL_VERSION = 1`.
- [ ] **F.1.3** Discriminated union `ServerRealtimeEvent` covering: `participantJoined`, `participantLeft`, `roomClosed`, `itemAdded`, `itemUpdated`, `itemRemoved`, `voteCount`, `votesRevealed`, `revoteStarted`, `finalEstimateRecorded` (match current wire payloads).
- [ ] **F.1.4** Helper mapping `ServerRealtimeEvent` → Socket.IO event name + payload (stable wire names until v2).
- [ ] **F.1.5** JSDoc: when to bump `v`.

### F.2 — Mutation → broadcast matrix

- [ ] **F.2.1** Table: each mutation → event(s) or none.
- [ ] **F.2.2** Eliminate duplicate emits (HTTP vs socket path).
- [ ] **F.2.3** Manual or automated check: `apps/web` listeners still match payloads.

### F.3 — `RealtimeBroadcaster` port

- [ ] **F.3.1** `realtime-broadcaster.ts` — `broadcastToRoom(roomId, event)`; use `Promise<void>` if Firebase adapter is async.
- [ ] **F.3.2** `NoOpRealtimeBroadcaster` for tests.
- [ ] **F.3.3** `SocketIoRealtimeBroadcaster` in `adapters/realtime/`.

### F.4 — Idempotency / reconnect

- [ ] **F.4.1** `ARCHITECTURE.md`: REST/`GET` is source of truth; WS best-effort (spec.MD §15.7).
- [ ] **F.4.2** Document authoritative GETs per screen (lobby, voting).
- [ ] **F.4.3** Optional test: core flow passes with `NoOpRealtimeBroadcaster`.

---

# Phase C — SQLite adapter (spec2 §3 C)

- [ ] **C.1** Add dependency; choose **better-sqlite3** (sync, long-lived Node) vs **node:sqlite** / async driver — ADR one paragraph.
- [ ] **C.2** Migration runner + `migrations/` SQL files; `user_version` or `_migrations` table.
- [ ] **C.3** `SqlitePlanningPokerStore` (or per-repository classes) implementing the **same** port interface(s) as in-memory; **parameterized queries only**.
- [ ] **C.4** Wire `createAppDeps`: if `DATABASE_URL` starts with `sqlite:` (or env flag), use SQLite adapter.
- [ ] **C.5** Integration tests: temp file DB, migrate, run repository test suite against SQLite.
- [ ] **C.6** Document `DATABASE_URL=sqlite:./data/app.db` in root or `server/README.md`.
- [ ] **C.7** `.gitignore` data dir if local file DB committed by mistake risk.

---

# Phase G — WebSocket / Socket.IO hardening (spec2 §4 G)

*Spec2 order: after C; assumes F3 Socket.IO adapter exists.*

- [ ] **G.1** Connection registry encapsulated in adapter (room membership via Socket.IO rooms is OK; document “registry” = adapter responsibility).
- [ ] **G.2** Align socket auth with REST: `joinRoom` payload validates `participantId` belongs to `roomId` (reuse store read); document threat model.
- [ ] **G.3** Configure `pingTimeout` / `pingInterval`; optional max HTTP buffer for payload size; disconnect stale clients.
- [ ] **G.4** Confirm **all** server-pushed events go through `RealtimeBroadcaster` (no stray `io.to` in routes).
- [ ] **G.5** Light load note: e.g. `autocannon` or script — N rooms × M clients; document rough ceiling in `ARCHITECTURE.md`.

---

# Phase D — PostgreSQL adapter (spec2 §3 D)

- [ ] **D.1** Add `pg` (or `postgres.js`); pool options: `max`, idle, `connectionTimeoutMillis`, `ssl` from env for cloud.
- [ ] **D.2** Migrations: same logical schema as SQLite; **one** source with dialect branches **or** two folders — document rule; never drift silently.
- [ ] **D.3** `PostgresPlanningPokerStore` implementing ports; use **transactions** for multi-row updates (reveal, close room, etc.).
- [ ] **D.4** Wire `createAppDeps` for `postgres://` / `postgresql://` URLs.
- [ ] **D.5** CI: optional job with service container or Testcontainers; or `npm run test:postgres` documented for local Docker.
- [ ] **D.6** Document compose snippet + `DATABASE_URL` for local Postgres.

---

# Phase E — Parity, performance, ops (spec2 §3 E)

- [ ] **E.1** CI matrix (or scripts): run **same** repository integration tests on **SQLite** and **Postgres** (in-memory always on).
- [ ] **E.2** Indexes: `room_id`, `item_id`, `participant_id`, `round_id` per query plan from A.2.
- [ ] **E.3** Runbook: SQLite backup = copy file; Postgres = `pg_dump` / provider backup; link in `ARCHITECTURE.md`.
- [ ] **E.4** Extend `GET /health` (or `GET /health/ready`): DB ping when DB adapter active; 503 if DB required and down.

---

# Phase H — Firebase realtime adapter (spec2 §4 H)

- [ ] **H.1** Decision doc: **Realtime Database** vs **Firestore** (latency, cost, queries); ADR.
- [ ] **H.2** Path layout `rooms/{roomId}/events/...` or shallow mirror of broadcast events; diagram in `ARCHITECTURE.md`.
- [ ] **H.3** **Recommended:** Option 1 — server writes to Firebase **after** DB commit; clients subscribe read-only.
- [ ] **H.4** Security rules: no client may forge reveal/close; validate `participantId` patterns as needed.
- [ ] **H.5** `FirebaseRealtimeBroadcaster` implementing `RealtimeBroadcaster` (Admin SDK); handle async errors + logging.
- [ ] **H.6** Cloud Function **only if** rules cannot enforce sensitive transitions; document.
- [ ] **H.7** Emulator tests: rules tests + one integration path for write/listen.
- [ ] **H.8** Env: `GOOGLE_APPLICATION_CREDENTIALS`, project id, emulator host for dev; README section.

---

# Phase I — Switching + web client coexistence (spec2 §4 I)

### Server

- [ ] **I.1** `REALTIME_DRIVER=websocket|firebase`; parse in `createAppDeps`; throw on unknown value.
- [ ] **I.2** Single `io` attach only for websocket driver; Firebase broadcaster only for firebase driver.

### Web (`apps/web`) — SKILL alignment

- [ ] **I.3** `import type { ServerRealtimeEvent } from "shared"` in socket hook or listener module.
- [ ] **I.4** Hook **`useRoomChannel(roomId, opts)`** (or split `useRoomSocket` / `useRoomFirebase`):  
  - owns subscription lifecycle;  
  - returns discriminated union state `{ status: "idle" | "connecting" | "live" | "error"; ... }` for UI;  
  - **no** socket/Firebase imports inside presentational components.
- [ ] **I.5** Thin module `apps/web/src/realtime/channel.ts` (name flexible): factory reading `VITE_REALTIME_DRIVER` + config.
- [ ] **I.6** Map Firebase listener callbacks → same **reducer** or handlers as Socket.IO events so pages stay unchanged.
- [ ] **I.7** Document feature matrix: “Firebase optional tier” / which env vars required.

---

# Phase X — Cross-cutting (spec2 §5)

- [ ] **X.1** **Single** `createAppDependencies(config)` building: logger, clock, ids, **persistence** (memory | sqlite | postgres), **realtime** (socket.io | firebase). Merge with B.3.1 if already started.
- [ ] **X.2** Structured logging: `adapter=pgsql|sqlite|memory`, `realtime=websocket|firebase`, `roomId`, request id; **never** log tokens or secrets.
- [ ] **X.3** Feature flags env: e.g. `USE_POSTGRES=true` override; document precedence vs `DATABASE_URL`.
- [ ] **X.4** ADRs: WebSocket as default; when to choose Firebase; DB driver choices.
- [ ] **X.5** Link spec2 + tasks2 from [tasks.MD](./tasks.MD) header or “Architecture” section.

---

## Phase 0 — Quick discovery (optional first day)

- [ ] **0.1** Grep `app.(get|post|patch|delete)` in `server/src` → list endpoints.
- [ ] **0.2** Grep `emit(` → list all Socket.IO event names.
- [ ] **0.3** Grep `from "./store` / `from './store` in server → migration checklist.

---

## PR / release checklist (copy-paste)

**After B + F**

- [ ] Ports + in-memory adapter + `createAppDeps` + routes refactored
- [ ] `ServerRealtimeEvent` v1 in `shared`; `RealtimeBroadcaster` + Socket.IO adapter
- [ ] ARCHITECTURE realtime + reconnect; tests green

**After C + G**

- [ ] SQLite migrations + adapter + CI job
- [ ] Socket hardened; no raw `io` in routes

**After D + E**

- [ ] Postgres adapter + transaction boundaries
- [ ] Health checks + indexes + backup notes + test matrix

**After H + I + X**

- [ ] Firebase broadcaster + rules + emulators
- [ ] `useRoomChannel` + env-driven client driver
- [ ] Logging + ADRs + tasks.MD link

---

## Mapping: spec2 §6 order → sections in this file

| Order | Spec2 reference | This file |
|------|-------------------|-----------|
| 1 | B, F1–F4 | § Phase B, § Phase F |
| 2 | C, E partial | § Phase C; § Phase E (E.1 partial with C) |
| 3 | G | § Phase G |
| 4 | D, E | § Phase D, § Phase E |
| 5 | H, I | § Phase H, § Phase I |
| — | A, X | § Phase A, § Phase X (A early; X throughout / finalize last) |

---

*Functional acceptance remains per [spec.MD](./spec.MD); adapter acceptance per [spec2.MD §7](./spec2.MD).*
