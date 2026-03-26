# Spec 2 — Ports & Adapters (Persistence & Realtime)

**Companion document:** [spec.MD](./spec.MD) remains the functional and business specification. This file defines **implementation architecture** and a **detailed TODO** for swapping **database backends** (SQLite ↔ PostgreSQL) and **realtime transports** (WebSocket ↔ Firebase) without rewriting domain logic.

---

## 0. Goals

- **Single domain surface:** Room lifecycle, votes, items, and session events are expressed through **ports** (interfaces); HTTP handlers and UI depend on ports, not on `pg`, `better-sqlite3`, `ws`, or Firebase SDKs.
- **Configuration-driven wiring:** Choose adapters via env (e.g. `DATABASE_URL`, `REALTIME_DRIVER=websocket|firebase`).
- **Testability:** In-memory or mock adapters for unit/integration tests; no network or Docker required for the fast path.
- **Behavioral parity:** Same API contracts and user-visible behavior regardless of adapter (within limits of each backend’s guarantees).

---

## 1. Conceptual Model

### 1.1 Hexagonal boundaries

| Layer | Responsibility |
|--------|----------------|
| **Domain / application** | Use cases: create room, join, vote, reveal, close. Owns types and invariants. |
| **Ports** | `RoomRepository`, `VoteRepository`, `SessionStore` (if split), `RealtimeBroadcaster`, `Transaction` (optional). |
| **Adapters** | SQLite impl, PostgreSQL impl, WebSocket hub, Firebase (RTDB or Firestore + optional Cloud Functions). |
| **Driving adapters** | HTTP routes, WebSocket server setup, Firebase triggers (if any). |

### 1.2 What must not leak

- SQL dialect specifics, connection pools, and migration tools stay inside DB adapters.
- Socket framing, Firebase path conventions, and retry policies stay inside realtime adapters.

---

## 2. Port inventory (suggested)

Use this as a checklist when defining TypeScript interfaces (names can match your codebase).

- [ ] **RoomRepository** — CRUD room metadata, deck config, open/closed state.
- [ ] **ParticipantRepository** (or nested under room) — join/leave, display names, observer flag.
- [ ] **ItemRepository** — backlog items, current item pointer, ordering.
- [ ] **VoteRepository** — submit/clear/reveal semantics as required by spec.MD.
- [ ] **Unit of work / transactions** — optional port for “vote + broadcast” atomicity where the DB supports it.
- [ ] **RealtimeBroadcaster** — `publish(roomId, event)` with a small, versioned event union (e.g. `participant_joined`, `vote_submitted`, `revealed`).
- [ ] **IdGenerator** — abstract if you need deterministic tests (UUID v4 vs sequential).
- [ ] **Clock** — injectable time for “closed at” timestamps in tests.

---

# 3. Detailed TODO — Database adapters (SQLite / PostgreSQL)

## Phase A — Inventory and seam identification

- [ ] **A.1** Map every current read/write path in the server to a domain operation (list routes → use cases).
- [ ] **A.2** Document today’s schema (tables/columns) as the **reference contract** for both DB adapters.
- [ ] **A.3** List SQLite-specific assumptions (file path, `INTEGER` booleans, lack of `RETURNING` if applicable) and PostgreSQL needs (`SERIAL`/`UUID`, schemas, connection string).
- [ ] **A.4** Decide **one query API style** for adapters: raw SQL strings, a thin wrapper (e.g. `pg` / `better-sqlite3`), or an optional query builder — **pick one** and document in `README` or `ARCHITECTURE.md`.

## Phase B — Port definitions and refactor from concrete store

- [ ] **B.1** Introduce `RoomRepository` (and related) interfaces in a `packages/` or `server/src/ports/` module with **no** imports from `pg` or SQLite.
- [ ] **B.2** Move existing in-memory or monolithic `store.ts` logic behind the new interfaces (facade first, split later).
- [ ] **B.3** Ensure HTTP handlers call **only** application services that depend on ports (constructor injection or factory).
- [ ] **B.4** Add **repository integration tests** against a **test double** (in-memory) to lock behavior before touching SQL.

## Phase C — SQLite adapter

- [ ] **C.1** Choose driver (`better-sqlite3` sync vs `sqlite` async); justify for your deploy target (serverless vs long-lived Node).
- [ ] **C.2** Implement migrations for SQLite (e.g. `node-sqlite` migrate, custom version table, or shared SQL files with dialect branches).
- [ ] **C.3** Implement `SqliteRoomRepository` (and siblings) with parameterized queries only.
- [ ] **C.4** Add CI job: run migrations + integration tests on SQLite file in temp dir.
- [ ] **C.5** Document env: `DATABASE_URL=sqlite:./data/app.db` (or equivalent).

## Phase D — PostgreSQL adapter

- [ ] **D.1** Add connection pool config (`max`, idle timeout, SSL mode for cloud).
- [ ] **D.2** Implement same migrations for PostgreSQL (prefer **one source** with small dialect differences, or two folders — document the rule).
- [ ] **D.3** Implement `PostgresRoomRepository` etc., using transactions where the spec requires consistency (e.g. reveal + persist).
- [ ] **D.4** Add CI service container (or Testcontainers) for Postgres integration tests **or** gate behind optional job.
- [ ] **D.5** Document env: `DATABASE_URL=postgres://...` and local Docker compose snippet.

## Phase E — Parity, performance, and ops

- [ ] **E.1** Run the **same integration test suite** twice (matrix: SQLite + Postgres) for repositories.
- [ ] **E.2** Add indexes matching query patterns (room id, item id, participant lookups).
- [ ] **E.3** Define backup/restore story: SQLite = file copy; Postgres = vendor docs + runbook.
- [ ] **E.4** Add health check that verifies DB connectivity (used by load balancers).

---

# 4. Detailed TODO — Realtime adapters (WebSocket / Firebase)

## Phase F — Event model and transport-agnostic core

- [ ] **F.1** Define a **versioned** `ServerEvent` / `ClientEvent` union (JSON-serializable); document schema in one module.
- [ ] **F.2** Map each HTTP mutation to **optional** realtime notifications (what subscribers must see after REST success).
- [ ] **F.3** Introduce `RealtimeBroadcaster` port: methods like `toRoom(roomId, event)` and `toUser(connectionId, event)` if needed.
- [ ] **F.4** Ensure **idempotency** story: clients reconcile via `GET` after reconnect (aligns with spec.MD §15.7); realtime is an optimization, not sole source of truth.

## Phase G — WebSocket adapter (current-style server)

- [ ] **G.1** Encapsulate connection registry (room → Set of sockets) behind `WebSocketBroadcaster` implementing the port.
- [ ] **G.2** Standardize auth on socket connect (room id + token or join ticket — match your security model).
- [ ] **G.3** Heartbeat/ping and stale connection cleanup; cap message size.
- [ ] **G.4** Wire HTTP layer to call `broadcaster` after successful writes (same process).
- [ ] **G.5** Load test: N rooms × M clients; document rough limits.

## Phase H — Firebase adapter

- [ ] **H.1** Choose **Firebase product**: Realtime Database vs Firestore; document read/write costs and query limits.
- [ ] **H.2** Design path layout (`rooms/{roomId}/...`) and **security rules** mirroring server authority (clients may be untrusted).
- [ ] **H.3** Implement `FirebaseBroadcaster` (server SDK) **or** hybrid: REST + Firebase for fan-out only — pick one architecture:
  - **Option 1 — Server owns writes:** Node server writes to Firebase after DB commit; clients listen on Firebase.
  - **Option 2 — Direct client writes:** Only if rules can enforce all invariants (hard for poker voting); usually **not** recommended for MVP.
- [ ] **H.4** If using Firebase, define **Cloud Function** or server endpoint for sensitive transitions (reveal, close room) if rules are insufficient.
- [ ] **H.5** Emulator-based integration tests for rules and critical paths.
- [ ] **H.6** Document env: service account path, project id, and how local dev runs with emulators.

## Phase I — Switching and coexistence

- [ ] **I.1** `REALTIME_DRIVER` env switch: `websocket` | `firebase` with fail-fast if misconfigured.
- [ ] **I.2** Abstract **client** subscription: thin hook `useRoomChannel(roomId)` that uses native `WebSocket` or Firebase listener based on build-time or runtime config.
- [ ] **I.3** Deprecation path: document which features require which driver (e.g. “Firebase optional for scale tier”).

---

# 5. Cross-cutting TODO (both DB and realtime)

- [ ] **X.1** **Composition root:** single `createAppDependencies(config)` (or DI container) that constructs DB + broadcaster implementations.
- [ ] **X.2** **Structured logging:** log adapter type, room id, correlation id; never log secrets.
- [ ] **X.3** **Feature flags:** optional toggles for gradual rollout (Postgres in prod, SQLite in dev).
- [ ] **X.4** **ADR short notes:** 1-page decisions for “why WebSocket default” and “when Firebase”.
- [ ] **X.5** Update **spec.MD** or **tasks.MD** with links to this file when implementation starts.

---

# 6. Suggested order of execution

**Detailed task breakdown:** [tasks2.MD](./tasks2.MD) (full Spec2 phases A–I + X; follow §6 order).

1. **Ports + refactor store behind interfaces** (B, F1–F4).  
2. **SQLite adapter + tests** (C, E1 partial).  
3. **WebSocket broadcaster behind port** (G) — minimal change to current behavior.  
4. **PostgreSQL adapter + CI matrix** (D, E).  
5. **Firebase adapter + rules + emulator tests** (H, I).  

---

# 7. Definition of done (per adapter)

| Adapter | Done when |
|---------|-----------|
| SQLite | Migrations apply cleanly; repository integration tests green; documented URL. |
| PostgreSQL | Same tests as SQLite green on CI; pool/SSL documented. |
| WebSocket | All server events flow through `RealtimeBroadcaster`; reconnect story unchanged. |
| Firebase | Rules reviewed; emulator tests green; production project checklist completed. |

---

*This spec is intentionally implementation-oriented; functional requirements remain in [spec.MD](./spec.MD).*
