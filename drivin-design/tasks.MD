# Tasks — Spec-Driven, TDD-First Implementation

This file lists **implementation tasks** derived from the spec-driven workflow (`configuration.MD`), the product spec (`spec.MD`), the data model (`data-model.MD`), and the stack (`quickstart.MD`). Tasks are grouped by phase; complete **Phase 1 (Architecture)** before starting feature slices.

**TDD Rule — enforced for every task:**
> No production code, HTML, CSS, or configuration file for a feature may be created before a failing test for that behavior exists. Each implementation task (T-prefix) is preceded by a test task (TEST-prefix). The test task must be completed first — write the test, confirm it fails, then implement.

**Current focus:** Web app + server only. Mobile tasks (Phase 2.8, etc.) are **deferred** until the web MVP is complete. Server uses in-memory / mocked data.

**Use case reference:** All tasks map to the detailed use cases in `spec.MD` §15 (Detailed Use Cases). The checklist at the end tracks coverage of each use case.

---

## Phase 1: Create and Configure the Architecture

These tasks establish the monorepo, shared package, web app, mobile app, and server with no feature logic — only structure, tooling, and types. All choices must align with `quickstart.MD` and `data-model.MD`.

**Definition of done for Phase 1:** From repo root, `npm install` (or `pnpm install`) runs successfully; `npm run dev -w web`, `npm run start -w mobile`, and `npm run dev -w server` start each app; `npm run typecheck -w shared` passes; `npm run test` passes; and the shared package exports types that match the data model.

---

### 1.0 Testing Infrastructure (must be done before any other Phase 1 task)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 1.0.1 | Install and configure Vitest for web and server | `vitest` and `@vitest/coverage-v8` installed in web and server. `npm run test -w web` and `npm run test -w server` run and exit cleanly (no tests yet = pass). | quickstart.MD |
| 1.0.2 | Install React Testing Library for web | `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` installed in web. A smoke test (`renders without crashing`) passes. | quickstart.MD |
| 1.0.3 | Install msw for API mocking | `msw` installed in web and server. A basic handler can be set up in a test file. | quickstart.MD |
| 1.0.4 | Install supertest for server route tests | `supertest` and `@types/supertest` installed in server. A smoke test against the health route passes. | quickstart.MD |
| 1.0.5 | Add test scripts to root | Root `package.json` has: `test` (run all workspace tests), `test:web`, `test:server`, `test:coverage`. | quickstart.MD |
| 1.0.6 | Configure coverage thresholds | `vitest.config` in web and server sets coverage thresholds (e.g. 80% lines/branches for success-criteria paths). CI fails if thresholds are not met. | configuration.MD §7 |

---

### 1.1 Monorepo root

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 1.1.1 | Create repo root `package.json` with workspaces | `"workspaces": ["apps/*", "packages/*", "server"]` (or `server` in `apps/server` if preferred). Private root; no main entry. | quickstart.MD §2 |
| 1.1.2 | Add root scripts for install and workspace targets | Scripts (or docs) so that `npm run dev -w web`, `npm run start -w mobile`, `npm run dev -w server`, `npm run typecheck -w shared` work once packages exist. | quickstart.MD §4 |
| 1.1.3 | Add `.gitignore` at root | Ignore `node_modules`, `.env`*, build outputs, IDE, OS files, and any local DB files (e.g. `*.sqlite`). | — |
| 1.1.4 | Add root `README.md` | Short description of the project, link to `drivin-design/spec.MD` and `drivin-design/quickstart.MD`, and "Quick start" section with install + run + test commands. | quickstart.MD |

---

### 1.2 Shared package (`packages/shared`)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-1.2.3 | **[TEST FIRST]** Write type-shape tests for shared types | Tests assert that `Room`, `Participant`, `Item`, `Round`, `Vote`, `Session` and all enums can be imported and that required fields exist (compile-time shape tests using `satisfies` or type assertions). Tests fail until types are exported. | data-model.MD |
| 1.2.1 | Create `packages/shared` with `package.json` | Name: `"shared"`. TypeScript; `main`/`types` (or `exports`) point to built output; no React/Node-specific deps in shared. | quickstart.MD §1, §5 |
| 1.2.2 | Add TypeScript to shared | `tsconfig.json` with strict mode; output to `dist/` (or `build/`); `src/` as source. Script: `build` (tsc), `typecheck` (tsc --noEmit). | quickstart.MD |
| 1.2.3 | Define types from data model | Export TypeScript types/interfaces for: `Room`, `Participant`, `Item`, `Round`, `Vote`, `Session`; enums: `RoomState`, `DeckType`, `ParticipantRole`, `RoundState`. Match field names and optionality in `data-model.MD` §2 and §3. TEST-1.2.3 must pass. | data-model.MD |
| TEST-1.2.4 | **[TEST FIRST]** Write tests for deck constants | Tests assert that FIBONACCI, LINEAR, TSHIRT exports exist and contain expected values. Tests fail until constants are exported. | spec.MD §5.1 |
| 1.2.4 | Add deck constants | Export deck definitions (e.g. FIBONACCI, LINEAR, TSHIRT) with `deckType` and `deckValues` arrays as in spec. TEST-1.2.4 must pass. | spec.MD §5.1, data-model.MD §3.2 |
| TEST-1.2.5 | **[TEST FIRST]** Write tests for API client skeleton | Tests assert that the HTTP client factory and WebSocket factory can be instantiated with a base URL and expose the expected interface (even if methods are stubs). Tests fail until client is implemented. | quickstart.MD §1 |
| 1.2.5 | Add API client skeleton | Minimal HTTP client (e.g. `fetch` wrapper) and/or WebSocket factory that accept base URL; no endpoints yet. Export from `packages/shared` so web and mobile can import. TEST-1.2.5 must pass. | quickstart.MD §1, §5 |
| 1.2.6 | Shared build and typecheck | Running `npm run build -w shared` and `npm run typecheck -w shared` from root succeeds. | quickstart.MD §4 |

---

### 1.3 Web app (`apps/web`)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-1.3.1 | **[TEST FIRST]** Write smoke test for web app entry | A test asserts the root `App` component renders without crashing. Test fails until the app is scaffolded. | quickstart.MD §1 |
| 1.3.1 | Create Vite + React + TypeScript app | Use `npm create vite@latest apps/web -- --template react-ts` (or equivalent). Package name: `"web"`. TEST-1.3.1 must pass. | quickstart.MD §1, §2 |
| 1.3.2 | Add shared as workspace dependency | In `apps/web/package.json`, depend on `"shared": "workspace:*"` (or `"shared": "*"` for npm). Resolve and build shared before web in dev. | quickstart.MD §2 |
| 1.3.3 | Align TypeScript and React versions | TypeScript 5.x, React 18.x as in quickstart. Ensure Vite dev server runs and shows default Vite+React page. | quickstart.MD §1 |
| 1.3.4 | Configure env for API base URL | Use `import.meta.env.VITE_API_URL` (or similar) for backend base URL; document in README or quickstart. Default e.g. `http://localhost:3000`. | quickstart.MD, NFRs |
| 1.3.5 | Add script names | Scripts: `dev` (Vite dev), `build` (Vite build), `test` (vitest), `test:coverage`, `preview` (optional). Run from root: `npm run dev -w web` starts the app. | quickstart.MD §4 |

---

### 1.4 Mobile app (`apps/mobile`) *(deferred)*

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 1.4.1 | Create Expo app with TypeScript | Use `npx create-expo-app@latest apps/mobile -t expo-template-blank-typescript`. Package name: `"mobile"`. | quickstart.MD §1, §2 |
| 1.4.2 | Add shared as workspace dependency | In `apps/mobile/package.json`, depend on `shared` workspace. | quickstart.MD §2 |
| 1.4.3 | Align Expo SDK and React | Expo SDK 52 or 53, React 18.x. | quickstart.MD §1 |
| 1.4.4 | Configure env for API base URL | Use Expo env for backend; document default. | quickstart.MD |
| 1.4.5 | Add script names | Scripts: `start`, `build`. | quickstart.MD §4 |

---

### 1.5 Server (`server`)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-1.5.2 | **[TEST FIRST]** Write supertest test for health route | Test: `GET /health` returns 200. Test fails until the route exists. | quickstart.MD §1 |
| 1.5.1 | Create server package | Folder `server/` with `package.json`. Name: `"server"`. TypeScript; entry e.g. `src/index.ts`; build to `dist/`. | quickstart.MD §1, §2 |
| 1.5.2 | Add Express or Fastify + TypeScript | Install Express (or Fastify) and types. Minimal server: listen on port (e.g. 3000), respond with health route (`GET /health` → 200). TEST-1.5.2 must pass. | quickstart.MD §1 |
| 1.5.3 | Add shared as workspace dependency | Depend on `shared`; use shared types for future routes. No room/vote logic yet — only structure. | quickstart.MD §5, data-model.MD |
| 1.5.4 | Add build and dev scripts | Script: `build` (tsc), `dev` (ts-node or tsx watch), `test` (vitest), `test:coverage`. | quickstart.MD §4 |
| 1.5.5 | Environment and port | Port from env (e.g. `PORT=3000`); document in README or quickstart. | quickstart.MD |

---

### 1.6 Tooling and quality (root or shared)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 1.6.1 | TypeScript base config (optional) | Root `tsconfig.base.json` with strict settings; apps/packages extend it where useful. | quickstart.MD |
| 1.6.2 | ESLint at root or per package | ESLint config that runs on `apps/*`, `packages/*`, `server`; TypeScript and React/Expo aware. Script at root: `lint`. | configuration.MD §7 |
| 1.6.3 | Prettier (optional) | Prettier config at root; format JS/TS/JSON/MD. Optional script `format`. | configuration.MD §7 |

---

### 1.7 Documentation and references

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 1.7.1 | README quick start | Root README includes: clone, install, run web, run mobile, run server, run tests; reference to `drivin-design/quickstart.MD`. | quickstart.MD §4, §6 |
| 1.7.2 | Link tasks to spec | This file (`tasks.MD`) lives in `drivin-design/` and is referenced from `configuration.MD` or README. | configuration.MD |

---

## Phase 1 completion checklist

Before moving to Phase 2 (first feature slice: Room Management):

- From repo root: `npm install` (or `pnpm install`) completes without errors.
- `npm run test` passes (all smoke tests green).
- `npm run typecheck -w shared` passes.
- `npm run dev -w web` starts the web app; default page loads.
- `npm run start -w mobile` starts the Expo app (deferred — skip if mobile is deferred).
- `npm run dev -w server` starts the server; `GET /health` returns 200.
- Shared package exports types for Room, Participant, Item, Round, Vote, Session and enums (RoomState, DeckType, ParticipantRole, RoundState).
- Root README describes how to run and test the project and points to `drivin-design/`.

---

## Phase 2: Room Management

These tasks implement **Room Management** (User Stories 5.1–5.5) per `configuration.MD` §6 (slice ordering). Covers: Create Room, Join Room, Close Room, Leave Room, Join as Observer. Implementation must align with `spec.MD`, `data-model.MD`, and `ui-definition.MD`.

**TDD rule for Phase 2:** Every sub-section below starts with TEST tasks. No implementation task may begin until its paired TEST task produces a failing test.

**Definition of done for Phase 2:** A facilitator can create a room with name and deck type, get a shareable link, and copy it. A participant can join via link with display name (or as observer). Participants see each other in the room. Facilitator can close the room; participants can leave. All success criteria for User Stories 5.1–5.5 are satisfied and covered by automated tests.

---

### 2.1 Server — Room data and storage

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-2.1 | **[TEST FIRST]** Write unit tests for room data store and creation logic | Tests cover: create room returns room with UUID, name, deckType, state=OPEN; create facilitator participant with role=FACILITATOR; create session linked to room; deck values populated from shared constants; duplicate room ID impossible. Tests fail until store and logic exist. | data-model.MD §2.1, spec.MD §5.1 |
| 2.1.1 | Add room data store | In-memory `Map<string, Room>` for rooms. Room has: id (UUID), name, deckType, deckValues, state, facilitatorId, createdAt, closedAt. TEST-2.1 must pass. | data-model.MD §2.1 |
| 2.1.2 | Add participant data store | In-memory `Map<string, Participant>` for participants. Participant has: id, roomId, displayName, role, joinedAt, leftAt, isActive, sessionId. TEST-2.1 must pass. | data-model.MD §2.2 |
| 2.1.3 | Add session data store | In-memory `Map<string, Session>` for sessions (1:1 with room). Session has: id, roomId, startedAt, closedAt, facilitatorId, facilitatorName, totalItems, totalParticipants. TEST-2.1 must pass. | data-model.MD §2.6 |
| 2.1.4 | Implement room creation logic | Create room with unique ID; create facilitator participant; create session; return room + shareable link. Deck values from shared deck constants. TEST-2.1 must pass. | spec.MD §5.1, data-model.MD §2.1 |

---

### 2.2 Server — REST API for rooms

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-2.2.1 | **[TEST FIRST]** Write supertest tests for `POST /api/rooms` | Tests: valid body → 201 with room + participant + shareableLink; missing name → 400; missing deckType → 400. Tests fail until route exists. | spec.MD §5.1 |
| 2.2.1 | `POST /api/rooms` — Create room | Accept `{ name, deckType }`; validate; create room + facilitator + session; return `{ room, participant, shareableLink }`. TEST-2.2.1 must pass. | spec.MD §5.1 |
| TEST-2.2.2 | **[TEST FIRST]** Write supertest tests for `GET /api/rooms/:id` | Tests: existing room → 200 with room data; unknown id → 404; closed room → 200 with state=CLOSED. | spec.MD §5.2, §15 |
| 2.2.2 | `GET /api/rooms/:id` — Get room | Return room by ID; 404 if not found. Include deckValues, state, name. For closed rooms: return room with `state=CLOSED`. TEST-2.2.2 must pass. | spec.MD §5.2, §15 |
| TEST-2.2.3 | **[TEST FIRST]** Write supertest tests for `POST /api/rooms/:id/join` | Tests: valid join → 201 with participant; duplicate name → 409; room closed → 400; observer role → participant with role=OBSERVER. | spec.MD §5.2, §5.5 |
| 2.2.3 | `POST /api/rooms/:id/join` — Join room | Accept `{ displayName, role? }`; validate name; reject if display name already in use (409); reject if room closed. Role defaults to PARTICIPANT; allow OBSERVER. TEST-2.2.3 must pass. | spec.MD §5.2, §5.5 |
| TEST-2.2.4 | **[TEST FIRST]** Write supertest tests for `POST /api/rooms/:id/leave` | Tests: valid leave → 200; participant marked isActive=false; idempotent if already left; facilitator leave → room auto-closes. | spec.MD §5.4, §15.2 |
| 2.2.4 | `POST /api/rooms/:id/leave` — Leave room | Accept `{ participantId }`; set participant `isActive=false`, `leftAt=now`. If facilitator: auto-close room. Idempotent. TEST-2.2.4 must pass. | spec.MD §5.4, §15.2 |
| TEST-2.2.5 | **[TEST FIRST]** Write supertest tests for `POST /api/rooms/:id/close` | Tests: facilitator closes → 200 + session summary; non-facilitator → 403; already closed → 400. | spec.MD §5.3 |
| 2.2.5 | `POST /api/rooms/:id/close` — Close room | Accept `{ participantId }`; verify facilitator; set room `state=CLOSED`, `closedAt=now`; update session; return success + session summary. TEST-2.2.5 must pass. | spec.MD §5.3 |
| 2.2.6 | Facilitator leaves → auto-close room | When facilitator leaves without closing: treat as room close; same flow as close. (MVP: spec §15.2 UC-5.4.) TEST-2.2.4 covers this. | spec.MD §15.2 UC-5.4 |

---

### 2.3 Server — WebSocket for real-time presence

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-2.3 | **[TEST FIRST]** Write integration tests for WebSocket presence events | Tests (using a test socket client): `participantJoined` emitted when participant joins; `participantLeft` emitted when participant leaves or disconnects; `roomClosed` emitted with session summary when room closes; reconnect returns current room state. Tests fail until WebSocket server exists. | spec.MD §5.2, §5.3, §5.4 |
| 2.3.1 | Add WebSocket server | Socket.io or native WS; accept connections; associate socket with room + participant. TEST-2.3 must pass. | quickstart.MD §1 |
| 2.3.2 | Emit participant joined/left | When participant joins or leaves, broadcast `participantJoined`, `participantLeft`. TEST-2.3 must pass. | spec.MD §5.2, §5.4 |
| 2.3.3 | Emit room closed | When facilitator closes room, broadcast `roomClosed` with session summary. TEST-2.3 must pass. | spec.MD §5.3 |
| 2.3.4 | Handle disconnect | On socket disconnect, mark participant `isActive=false`, `leftAt=now`; broadcast `participantLeft`. TEST-2.3 must pass. | spec.MD §5.4, NFRs |
| 2.3.5 | Room state on reconnect | When client reconnects, return current room state (open/closed). If closed, include summary. TEST-2.3 must pass. | spec.MD §15.7 |
| 2.3.6 | Rejoin on reconnect | When WebSocket `joinRoom` received for inactive participant (e.g. after refresh), reactivate participant; emit `participantJoined`; join socket to room *before* emitting so reconnecting user receives event. | spec.MD §12, §15.7 |

---

### 2.4 Shared — Room API client

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-2.4 | **[TEST FIRST]** Write unit tests for room API client functions | Tests (using msw): `createRoom` → returns `{ room, participant, shareableLink }`; `getRoom` → returns room or throws on 404; `joinRoom` → returns participant; `leaveRoom` → resolves; `closeRoom` → resolves; WebSocket client subscribes to events. Tests fail until client functions exist. | quickstart.MD §5 |
| 2.4.1 | Add `createRoom(name, deckType)` | HTTP POST to `/api/rooms`; return `{ room, participant, shareableLink }`. TEST-2.4 must pass. | quickstart.MD §5 |
| 2.4.2 | Add `getRoom(roomId)` | HTTP GET `/api/rooms/:id`; return room or throw. TEST-2.4 must pass. | quickstart.MD §5 |
| 2.4.3 | Add `joinRoom(roomId, displayName, role?)` | HTTP POST `/api/rooms/:id/join`; return `{ participant, room }`. TEST-2.4 must pass. | quickstart.MD §5 |
| 2.4.4 | Add `leaveRoom(roomId, participantId)` | HTTP POST `/api/rooms/:id/leave`. TEST-2.4 must pass. | quickstart.MD §5 |
| 2.4.5 | Add `closeRoom(roomId, participantId)` | HTTP POST `/api/rooms/:id/close`. TEST-2.4 must pass. | quickstart.MD §5 |
| 2.4.6 | Add WebSocket room client | Connect to room; subscribe to `participantJoined`, `participantLeft`, `roomClosed`; expose typed events. TEST-2.4 must pass. | quickstart.MD §1 |

---

### 2.5 Web — Create Room screen

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-2.5 | **[TEST FIRST]** Write React Testing Library tests for Create Room screen | Tests: form renders with room name input, deck selector, submit button; empty name → inline validation error; valid submit → calls `createRoom`; loading state shown during submit; success → shareable link and "Copy link" button shown; API failure → error message with retry; form data preserved on failure. Tests fail until component exists. | spec.MD §5.1, ui-definition.MD §7.2 |
| 2.5.1 | Create Room form | Screen "Create room" with: room name (required), deck selector (Fibonacci, Linear 0–10, T-shirt), "Create room" button. TEST-2.5 must pass. | ui-definition.MD §7.2 |
| 2.5.2 | Call createRoom API | On submit, call shared `createRoom`; show loading state. Handle: validation → inline error; creation fails → "Unable to create room. Please try again." with retry; preserve form data. TEST-2.5 must pass. | spec.MD §5.1 |
| 2.5.3 | Success state with shareable link | After success: show "Room created", shareable link, "Copy link" button (one-click copy to clipboard). TEST-2.5 must pass. | spec.MD §5.1 |
| 2.5.4 | Theme and responsive | Light/dark theme; mobile-first; touch targets ≥ 44 px; keyboard submit. | ui-definition.MD §5, §6 |

---

### 2.6 Web — Join Room screen (Landing)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-2.6 | **[TEST FIRST]** Write React Testing Library tests for Join Room screen | Tests: form renders with display name input, observer toggle, join button; empty name → validation error; room not found → "Room not found" message + create room link; room closed → "This session has ended" message; duplicate name → "This name is already in use"; loading state during join; network failure → "Connection lost. Please try again."; display name preserved on failure; observer toggle sets role=OBSERVER. Tests fail until component exists. | spec.MD §5.2, §5.5 |
| 2.6.1 | Join by link screen | When user opens `/room/:id`: show "Join [Room name]" form: display name (required), "Join as observer" toggle, "Join" button. TEST-2.6 must pass. | ui-definition.MD §7.1 |
| 2.6.2 | Fetch room before join | Load room via `getRoom`; show room name. Handle: 404 → "Room not found. Please check the link." + link to create room; closed → "This session has ended." + optional read-only summary link. TEST-2.6 must pass. | spec.MD §5.2 |
| 2.6.3 | Call joinRoom API | On submit, call `joinRoom(roomId, displayName, role)`. Handle: name in use → "This name is already in use. Please choose another."; preserve form. TEST-2.6 must pass. | spec.MD §5.2, §5.5 |
| 2.6.4 | Navigate to room on success | After join, navigate to room lobby; persist participant ID (e.g. in state or storage). TEST-2.6 must pass. | spec.MD §5.2 |
| 2.6.5 | Connection lost during join | If join fails due to network: show "Connection lost. Please try again." with retry. Preserve entered display name. TEST-2.6 must pass. | spec.MD §15.2 |

---

### 2.7 Web — Room Lobby (unified room view, Phase 2 scope)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-2.7 | **[TEST FIRST]** Write React Testing Library tests for Room Lobby | Tests: header shows room name and Open badge; participant list renders; WebSocket `participantJoined` → list updates; WebSocket `participantLeft` → list updates; observer shown with "(observer)" label; participant sees "Leave" button; facilitator sees "Close room" button; "Leave" triggers confirmation dialog; "Close room" triggers confirmation dialog; `roomClosed` event → voting disabled, "This session has ended" shown, session summary shown, countdown shown; on page load with closed room → summary view shown (not voting view); global messages component renders and stacks. Tests fail until component exists. | spec.MD §5.2–5.6, ui-definition.MD §7.3 |
| 2.7.1 | Room lobby layout | Header: room name, badge (Open/Closed). Section: participant list (avatars/names, "N participants"). Phase 2: no items yet; show "No item yet" placeholder. TEST-2.7 must pass. | ui-definition.MD §7.3 |
| 2.7.2 | Participant list with real-time updates | Display active participants; connect WebSocket; update list on `participantJoined`, `participantLeft`. Observers shown with "(observer)" label. TEST-2.7 must pass. | spec.MD §5.2, §5.5 |
| 2.7.3 | Leave room (participant) | "Leave" button; confirmation: "Leave this session?" Call `leaveRoom`; redirect to clear destination — never blank/broken view. TEST-2.7 must pass. | spec.MD §5.4 |
| 2.7.4 | Close room (facilitator) | "Close room" button (facilitator only); confirmation with warning if items have no final estimate. Call `closeRoom`; broadcast summary. TEST-2.7 must pass. | spec.MD §5.3 |
| 2.7.5 | Handle room closed event (dead-end prevention) | On WebSocket `roomClosed`: immediately disable voting; show "This session has ended."; display session summary; show 5-second countdown with "Go now" button; redirect to Create Room page; display global message. No user left in active voting view. TEST-2.7 must pass. | spec.MD §5.3, §5.6 |
| 2.7.6 | Room closed — polling fallback | If WebSocket unavailable: poll `GET /api/rooms/:id` periodically; when `state=CLOSED`, show same summary + exit options. TEST-2.7 must pass. | spec.MD §15.3 |
| 2.7.7 | Room closed — on page refresh | On load/reconnect: fetch room state; if closed, show summary view directly (not voting view). Never show stale "voting in progress" for closed room. TEST-2.7 must pass. | spec.MD §15.7 |
| 2.7.8 | Role-based UI | Facilitator sees "Close room"; participant/observer see "Leave". Observer sees same layout but no vote controls. Facilitator identity derived from `room.facilitatorId` (source of truth) so host privileges persist after refresh. TEST-2.7 must pass. | spec.MD §5.3–5.5 |
| 2.7.9 | Global messages component | Message component on every page; messages stack vertically; each has close button; messages clear on navigation. Support types: info, error, success. TEST-2.7 must pass. | spec.MD §5.6 |

---

### 2.8 Mobile — Room Management screens *(deferred until web MVP complete)*

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 2.8.1 | Create Room screen | Same as web: room name, deck selector, create button; success with shareable link and copy. | ui-definition.MD §7.2 |
| 2.8.2 | Join Room screen | Same as web: display name, observer toggle, join button. Handle room not found/closed. | ui-definition.MD §7.1 |
| 2.8.3 | Room Lobby screen | Same as web: participants list, leave/close with confirmation. Touch targets ≥ 44 px. | ui-definition.MD §7.3 |
| 2.8.4 | Navigation and routing | Deep link or route for `/room/:id`; navigate create → lobby, join → lobby. | quickstart.MD |

---

### 2.9 Routing and entry points

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-2.9 | **[TEST FIRST]** Write tests for routing behavior | Tests: `/` renders landing or create room; `/room/:id` renders join screen if not joined, lobby if joined; shareable link format `{origin}/room/{roomId}` resolves correctly. Tests fail until routes exist. | ui-definition.MD |
| 2.9.1 | Web routing | Routes: `/` (landing or create), `/room/:id` (join or lobby), `/room/:id/create` (create from home). Lobby at `/room/:id` when joined. TEST-2.9 must pass. | ui-definition.MD |
| 2.9.2 | Entry from shareable link | Shareable link format: `{origin}/room/{roomId}`. Opening link shows join screen if not joined; lobby if already joined (e.g. from storage). TEST-2.9 must pass. | spec.MD §5.1 |

---

## Phase 2 completion checklist

Before moving to Phase 3 (Estimation Process):

- All Phase 2 TEST tasks have passing tests.
- Facilitator can create room with name and deck; gets shareable link; can copy link (one-click). Creation failure shows retry; form data preserved.
- Participant can join via link with display name; sees participant list; can view room. Room not found / closed / name in use show clear messages; no dead ends.
- Participant can choose "Join as observer"; observer sees room but cannot vote; observer appears in list.
- Participant can leave room; redirects to home/create/join — never blank view. Others see update.
- Facilitator can close room; all participants receive room-closed event; see "Session ended" + summary + "Return to Home" | "Create New Room". No user stuck in voting view.
- Facilitator leaves without closing → room auto-closes; same notification flow.
- On refresh/reconnect: if room closed, show summary view directly (not voting).
- Real-time: participant list updates; room closed propagates; polling fallback if WebSocket unavailable.
- Web supports create, join, lobby, leave, close flows. (Mobile deferred.)
- All UI follows ui-definition.MD (themes, touch targets, confirmations).

---

## Phase 3: Estimation Process

These tasks implement **Estimation Process** (User Stories 6.0–6.6) per `configuration.MD`. Covers: Add item, Secret voting (participant + facilitator), Reveal votes, Post-reveal statistics, Re-vote, Record final estimate.

**TDD rule for Phase 3:** Every sub-section starts with TEST tasks. No implementation task may begin until its paired TEST task produces a failing test.

**Definition of done for Phase 3:** Facilitator can add estimation items. Participants and facilitator can vote in secret; votes hidden until reveal. Facilitator reveals votes; all see votes, statistics, and card descriptions. Facilitator can re-vote or record final estimate. Item marked estimated; next item or close room. All covered by automated tests.

---

### 3.1 Server — Item and voting data

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-3.1 | **[TEST FIRST]** Write unit tests for item, round, and vote data stores | Tests: create item → has id, roomId, title, order; create round → has id, itemId, roundNumber, state=VOTING; cast vote → creates vote with participantId, cardValue; one vote per participant per round (update if re-cast); remove vote → vote deleted. Tests fail until stores exist. | data-model.MD §2.3–2.5 |
| 3.1.1 | Add item data store | In-memory `Map<string, Item>`. Item has: id, roomId, title, description, order, finalEstimate, finalEstimateRecordedAt, createdAt, currentRoundId. TEST-3.1 must pass. | data-model.MD §2.3 |
| 3.1.2 | Add round data store | In-memory `Map<string, Round>`. Round has: id, itemId, roundNumber, state (VOTING/REVEALED/FINALIZED), votesRevealedAt, createdAt, finalizedAt. TEST-3.1 must pass. | data-model.MD §2.4 |
| 3.1.3 | Add vote data store | In-memory `Map<string, Vote>`. Vote has: id, roundId, participantId, cardValue, votedAt. One vote per participant per round; facilitator can vote. TEST-3.1 must pass. | data-model.MD §2.5 |
| 3.1.4 | Add deckDescriptions to Room | Optional `deckDescriptions` (Record<value, description>) on Room; hidden from participants until reveal. TEST-3.1 must pass. | spec.MD §5.1 |

---

### 3.2 Server — REST API for estimation

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-3.2.1 | **[TEST FIRST]** Write supertest tests for `POST /api/rooms/:id/items` | Tests: valid body → 201 with item + first round (VOTING); missing title → 400; non-facilitator → 403. | spec.MD §6.1 |
| 3.2.1 | `POST /api/rooms/:id/items` — Add item | Accept `{ title, description? }`; validate; create item with next order; create first round (VOTING); return item. Facilitator only. TEST-3.2.1 must pass. | spec.MD §6.1 |
| TEST-3.2.2 | **[TEST FIRST]** Write supertest tests for `PATCH /api/rooms/:id/items/:itemId` | Tests: valid update → 200; voting started → 400; non-facilitator → 403. | spec.MD §6.1 |
| 3.2.2 | `PATCH /api/rooms/:id/items/:itemId` — Edit item | Accept `{ title?, description? }`; validate; update item. Only before voting starts. Facilitator only. TEST-3.2.2 must pass. | spec.MD §6.1 |
| TEST-3.2.3 | **[TEST FIRST]** Write supertest tests for `DELETE /api/rooms/:id/items/:itemId` | Tests: valid delete → 200; non-facilitator → 403. | spec.MD §6.1 |
| 3.2.3 | `DELETE /api/rooms/:id/items/:itemId` — Remove item | Remove item and associated rounds/votes. Facilitator only. TEST-3.2.3 must pass. | spec.MD §6.1 |
| TEST-3.2.4 | **[TEST FIRST]** Write supertest tests for `POST /api/rooms/:id/items/:itemId/vote` | Tests: valid vote → 201; invalid cardValue → 400; observer → 403; update existing vote → 200; after reveal → 400. | spec.MD §6.2 |
| 3.2.4 | `POST /api/rooms/:id/items/:itemId/vote` — Cast vote | Accept `{ participantId, cardValue }`; validate cardValue in deckValues; create or update vote. Participant or facilitator (not observer). TEST-3.2.4 must pass. | spec.MD §6.2 |
| TEST-3.2.4b | **[TEST FIRST]** Write supertest tests for `DELETE /api/rooms/:id/items/:itemId/vote` | Tests: valid deselect → 200; no existing vote → 404; after reveal → 400. | spec.MD §6.2 |
| 3.2.4b | `DELETE /api/rooms/:id/items/:itemId/vote` — Remove vote (deselect) | Accept `{ participantId }`; remove participant's vote for current round. Only before reveal. TEST-3.2.4b must pass. | spec.MD §6.2 |
| 3.2.4c | `GET /api/rooms/:id/items/:itemId/vote?participantId=xxx` — Get own vote | Return `{ cardValue: string \| null }` for participant's vote in current round (VOTING state only). Used to restore vote on reconnect. | spec.MD §15.7 |
| TEST-3.2.5 | **[TEST FIRST]** Write supertest tests for `POST /api/rooms/:id/items/:itemId/reveal` | Tests: valid reveal → 200 with votes + statistics (average, median, suggestedEstimate, voteDistribution); non-facilitator → 403; already revealed → 400. | spec.MD §6.3, §6.6 |
| 3.2.5 | `POST /api/rooms/:id/items/:itemId/reveal` — Reveal votes | Set round state to REVEALED; set votesRevealedAt. Return votes + statistics. Facilitator only. TEST-3.2.5 must pass. | spec.MD §6.3, §6.6 |
| TEST-3.2.6 | **[TEST FIRST]** Write supertest tests for `POST /api/rooms/:id/items/:itemId/revote` | Tests: valid revote → 201 with new round; non-facilitator → 403; previous round preserved in history. | spec.MD §6.4 |
| 3.2.6 | `POST /api/rooms/:id/items/:itemId/revote` — Re-vote | Create new round (roundNumber+1); clear votes for new round; previous round kept in history. Facilitator only. TEST-3.2.6 must pass. | spec.MD §6.4 |
| TEST-3.2.7 | **[TEST FIRST]** Write supertest tests for `POST /api/rooms/:id/items/:itemId/finalize` | Tests: valid finalize → 200 with item.finalEstimate set; non-facilitator → 403; invalid cardValue → 400. | spec.MD §6.5 |
| 3.2.7 | `POST /api/rooms/:id/items/:itemId/finalize` — Record final estimate | Accept `{ cardValue }`; set item.finalEstimate, finalEstimateRecordedAt; set round state FINALIZED. Facilitator only. TEST-3.2.7 must pass. | spec.MD §6.5 |

---

### 3.3 Server — WebSocket for real-time voting

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-3.3 | **[TEST FIRST]** Write integration tests for estimation WebSocket events | Tests: `itemAdded` emitted when item added; `itemUpdated` emitted on edit; `itemRemoved` emitted on delete; `voteCount` emitted on vote (no values, only counts); `votesRevealed` emitted with votes + statistics + deckDescriptions; `revoteStarted` emitted on re-vote; `finalEstimateRecorded` emitted on finalize. Tests fail until WebSocket handlers exist. | spec.MD §6.1–6.5 |
| 3.3.1 | Emit item added/updated/removed | Broadcast `itemAdded`, `itemUpdated`, `itemRemoved` to room. TEST-3.3 must pass. | spec.MD §6.1 |
| 3.3.2 | Emit vote count (no values) | Broadcast `voteCount` with `{ votedCount, totalCount }`; never reveal values before reveal. TEST-3.3 must pass. | spec.MD §6.2 |
| 3.3.3 | Emit votes revealed | Broadcast `votesRevealed` with votes, statistics, and deckDescriptions. TEST-3.3 must pass. | spec.MD §6.3, §6.6 |
| 3.3.4 | Emit re-vote and finalize | Broadcast `revoteStarted` on re-vote; `finalEstimateRecorded` on finalize. TEST-3.3 must pass. | spec.MD §6.4, §6.5 |

---

### 3.4 Shared — Estimation API client

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-3.4 | **[TEST FIRST]** Write unit tests for estimation API client functions | Tests (using msw): each function calls the correct endpoint and returns the expected shape; errors are thrown with useful messages. Tests fail until client functions exist. | quickstart.MD §5 |
| 3.4.1 | Add `addItem(roomId, title, description?)` | HTTP POST to `/api/rooms/:id/items`; return item. TEST-3.4 must pass. | quickstart.MD §5 |
| 3.4.2 | Add `updateItem(roomId, itemId, { title?, description? })` | HTTP PATCH to `/api/rooms/:id/items/:itemId`. TEST-3.4 must pass. | quickstart.MD §5 |
| 3.4.3 | Add `removeItem(roomId, itemId)` | HTTP DELETE to `/api/rooms/:id/items/:itemId`. TEST-3.4 must pass. | quickstart.MD §5 |
| 3.4.4 | Add `castVote(roomId, itemId, participantId, cardValue)` | HTTP POST to `/api/rooms/:id/items/:itemId/vote`. TEST-3.4 must pass. | quickstart.MD §5 |
| 3.4.4b | Add `removeVote(roomId, itemId, participantId)` | HTTP DELETE to `/api/rooms/:id/items/:itemId/vote`. TEST-3.4 must pass. | spec.MD §6.2 |
| 3.4.4c | Add `getMyVote(roomId, itemId, participantId)` | HTTP GET to `/api/rooms/:id/items/:itemId/vote?participantId=xxx`; return `{ cardValue: string \| null }`. Used to restore vote on reconnect. | spec.MD §15.7 |
| 3.4.5 | Add `revealVotes(roomId, itemId, participantId)` | HTTP POST to `/api/rooms/:id/items/:itemId/reveal`; return votes + statistics. TEST-3.4 must pass. | quickstart.MD §5 |
| 3.4.6 | Add `revote(roomId, itemId, participantId)` | HTTP POST to `/api/rooms/:id/items/:itemId/revote`. TEST-3.4 must pass. | quickstart.MD §5 |
| 3.4.7 | Add `recordFinalEstimate(roomId, itemId, participantId, cardValue)` | HTTP POST to `/api/rooms/:id/items/:itemId/finalize`. TEST-3.4 must pass. | quickstart.MD §5 |
| 3.4.8 | Extend WebSocket client for estimation events | Subscribe to `itemAdded`, `itemUpdated`, `itemRemoved`, `voteCount`, `votesRevealed`, `revoteStarted`, `finalEstimateRecorded`. TEST-3.4 must pass. | quickstart.MD §1 |

---

### 3.5 Web — Add / Edit Item (facilitator)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-3.5 | **[TEST FIRST]** Write React Testing Library tests for Add/Edit Item | Tests: form renders with title input, description textarea, Save and Cancel buttons; empty title → inline validation error; valid submit → calls `addItem`; loading state shown; success → form closes and item appears; API failure → "Could not add item. Try again." with retry; form data preserved on failure; edit mode → pre-fills fields; remove item → confirmation dialog → calls `removeItem`. Tests fail until component exists. | spec.MD §6.1, ui-definition.MD §7.4 |
| 3.5.1 | Add item form (modal or inline) | Form: title (required), description (optional); "Save" and "Cancel". "Add item" button triggers form. TEST-3.5 must pass. | ui-definition.MD §7.4 |
| 3.5.2 | Call addItem API | On submit, call `addItem`; show loading. Handle: empty title → inline validation; add fails → "Could not add item. Try again." with retry; preserve form data. Item appears immediately to all via WebSocket. TEST-3.5 must pass. | spec.MD §6.1 |
| 3.5.3 | Edit item (before reveal) | "Edit" on item card; same form; call `updateItem`. Edit available during voting (before reveal). "Remove item" with confirmation; call `removeItem`. TEST-3.5 must pass. | spec.MD §6.1 |
| 3.5.4 | Theme and responsive | Use component system; touch targets ≥ 44 px; keyboard submit (Enter to save; Shift+Enter in description adds newline). | ui-definition.MD §5, §6 |

---

### 3.6 Web — Voting (participant and facilitator)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-3.6 | **[TEST FIRST]** Write React Testing Library tests for Voting | Tests: cards render with deck values; no descriptions shown before reveal; selecting a card calls `castVote`; selected card has distinct visual state; tapping selected card calls `removeVote` (deselect); tapping different card calls `castVote` with new value; after reveal → no voting controls; "X of Y have voted" updates via `voteCount`; observer sees "You are observing; no vote." message; no current item → "Waiting for facilitator to add an item."; reconnect prompt shown if vote was lost; cards are keyboard-focusable. Tests fail until component exists. | spec.MD §6.2, ui-definition.MD §7.10 |
| 3.6.1 | Card deck UI | Display cards with values from room deckValues only (no descriptions before reveal). Selected card visually distinct (brighter, more contrasting border). Single tap to select; tap same card to deselect; tap different card to change. TEST-3.6 must pass. | ui-definition.MD §6.2, §7.10 |
| 3.6.2 | Cast vote, change, deselect | Call `castVote` on selection; call `removeVote` when tapping selected card again. Allow select, deselect, change until reveal. After reveal: no voting controls; votes read-only. Facilitator sees same deck and can vote. Vote fail → brief message + retry. TEST-3.6 must pass. | spec.MD §6.2 |
| 3.6.3 | Vote count feedback | Show "X of Y have voted" (no values). Update via WebSocket `voteCount`. TEST-3.6 must pass. | spec.MD §6.2 |
| 3.6.4 | No current item state | When no item yet: show "Waiting for facilitator to add an item." No voting controls. No dead end. TEST-3.6 must pass. | spec.MD §15.4 |
| 3.6.5 | Connection lost during vote | On reconnect: restore vote via `getMyVote`; selected card in deck reflects restored vote. If vote was lost, show "Reconnected. Please submit your vote again if needed." Allow easy re-vote. TEST-3.6 must pass. | spec.MD §15.2, §15.7 |
| 3.6.6 | Observer state | Observer sees "You are observing; no vote." No card deck. TEST-3.6 must pass. | spec.MD §5.5 |
| 3.6.7 | Keyboard and accessibility | Cards focusable; Enter/Space to select; logical Tab order. | ui-definition.MD §4.2 |

---

### 3.7 Web — Reveal, statistics, re-vote, record final (facilitator)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-3.7 | **[TEST FIRST]** Write React Testing Library tests for Reveal and Post-Reveal | Tests: "Reveal votes" button visible to facilitator during voting; clicking it calls `revealVotes`; after reveal → all votes shown; highest and lowest highlighted; card descriptions visible; average, suggested estimate, and vote distribution shown; "Re-vote" button calls `revote`; "Record final estimate" selector shows deck values + "Use suggested"; confirming calls `recordFinalEstimate`; item marked estimated; "Add next item" and "Close room" shown after finalize; no votes → "No votes" shown. Tests fail until components exist. | spec.MD §6.3–6.6, ui-definition.MD §7.5, §7.10 |
| 3.7.1 | Reveal votes button | "Reveal votes" (facilitator only, when voting); call `revealVotes`; all votes displayed simultaneously. Partial votes: show "Did not vote" for missing. TEST-3.7 must pass. | spec.MD §6.3 |
| 3.7.2 | Post-reveal display | Show all votes; highlight highest and lowest; card descriptions (if any) visible. TEST-3.7 must pass. | spec.MD §6.3, ui-definition.MD §7.10 |
| 3.7.3 | Post-reveal statistics | Display average value, suggested estimate (rounded), vote distribution. TEST-3.7 must pass. | spec.MD §6.6 |
| 3.7.4 | Re-vote button | "Re-vote" clears current round; call `revote`; new round starts; previous round in history. TEST-3.7 must pass. | spec.MD §6.4 |
| 3.7.5 | Record final estimate | Select value or "Use suggested"; "Confirm final estimate" button; call `recordFinalEstimate`. Item marked estimated. TEST-3.7 must pass. | spec.MD §6.5, ui-definition.MD §7.5 |
| 3.7.6 | Next item or close | After finalize: "Add next item" or "Close room". Show estimated items list. TEST-3.7 must pass. | spec.MD §6.5 |

---

### 3.8 Web — Room Lobby integration (Phase 3 scope)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-3.8 | **[TEST FIRST]** Write integration tests for Room Lobby estimation state | Tests: no item → "No item yet" + "Add item" for facilitator; voting state → cards shown; revealed state → votes + statistics shown; finalized state → next item prompt; WebSocket events update state in real time; on reconnect → current state restored; closed room → summary shown, never stale voting UI. Tests fail until integration exists. | spec.MD §6.0–6.6, ui-definition.MD §7.3 |
| 3.8.1 | Current item section | Display current item (title, description); "No item yet" + "Add item" when empty. TEST-3.8 must pass. | ui-definition.MD §7.3 |
| 3.8.2 | Item list (estimated) | Show list of estimated items with final estimates; current item highlighted. TEST-3.8 must pass. | spec.MD §6.5 |
| 3.8.3 | State-driven UI | No item → lobby; voting → cards + vote count; revealed → votes + statistics + record/re-vote; finalized → next item. TEST-3.8 must pass. | spec.MD §6.0–6.6 |
| 3.8.4 | WebSocket sync | All estimation state updates propagate in real time to all participants. TEST-3.8 must pass. | spec.MD §6.1–6.6 |
| 3.8.5 | Reconnection flow | On refresh/reconnect: fetch current room state; if open, restore item + voting state; if closed, show summary. Show "Reconnected" feedback. Never show stale voting UI for closed room. TEST-3.8 must pass. | spec.MD §15.7 |

---

### 3.9 Mobile — Estimation Process *(deferred until web MVP complete)*

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 3.9.1 | Add/Edit Item | Same as web: modal form, add/update/remove. | ui-definition.MD §7.4 |
| 3.9.2 | Voting | Same as web: card deck, tap to vote, vote count. | ui-definition.MD §7.10 |
| 3.9.3 | Reveal and finalize | Same as web: reveal, statistics, re-vote, record final. | spec.MD §6.3–6.6 |

---

## Phase 3 completion checklist

Before moving to Phase 4 (AI Assist):

- All Phase 3 TEST tasks have passing tests.
- Facilitator can add estimation items (title, description); edit and remove before voting. Empty title validated; add failure shows retry.
- Participants and facilitator can vote in secret; votes hidden until reveal; "X of Y have voted" shown. Vote confirmation; change vote until reveal.
- No item yet: "Waiting for facilitator to add an item." No dead end.
- Connection lost during vote: on reconnect, prompt to re-vote if needed.
- Facilitator reveals votes; all see votes, average, suggested estimate, vote distribution; card descriptions visible after reveal. No votes / partial votes handled.
- Facilitator can re-vote (new round) or record final estimate.
- Item marked estimated; facilitator can add next item or close room.
- Reconnection: fetch current room state; show "Reconnected"; never stale voting UI for closed room.
- Real-time: items, votes, reveal, finalize propagate via WebSocket.
- All UI follows ui-definition.MD (themes, touch targets, confirmations).
- FIX: After revealing votes guests are not updated to new item to vote
- FIX: After revealing votes, Host can't vote again — last value was fixed
- FIX: Anyone should change voting before the vote is revealed

---

## Phase 4: AI Assist

These tasks implement **AI Assist** (User Stories 7.1–7.2) per `spec.MD` §15.5. Covers: Discrepancy Analysis, Session Summary.

**TDD rule for Phase 4:** TEST tasks precede all implementation tasks.

**Definition of done for Phase 4:** After reveal, facilitator can trigger AI discrepancy analysis; AI output shown as recommendation. Facilitator can generate session summary and export. AI failures do not block core flow. All covered by automated tests.

---

### 4.1 Server — AI endpoints

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-4.1 | **[TEST FIRST]** Write supertest tests for AI endpoints | Tests: `POST /api/rooms/:id/items/:itemId/analyze` → 200 with analysis; AI timeout → 503 with clear message; non-facilitator → 403. `POST /api/rooms/:id/summary` → 200 with summary; non-facilitator → 403. Tests fail until routes exist. | spec.MD §7.1, §7.2 |
| 4.1.1 | `POST /api/rooms/:id/items/:itemId/analyze` | Accept facilitator auth; send vote data to AI (no PII); return analysis. Timeout configurable. TEST-4.1 must pass. | spec.MD §7.1 |
| 4.1.2 | `POST /api/rooms/:id/summary` | Accept facilitator auth; compile items, votes, final estimates, participants; return structured summary. TEST-4.1 must pass. | spec.MD §7.2 |

---

### 4.2 Shared — AI API client

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-4.2 | **[TEST FIRST]** Write unit tests for AI API client functions | Tests (using msw): `analyzeDiscrepancy` returns analysis or throws on timeout; `generateSummary` returns summary. Tests fail until functions exist. | quickstart.MD §5 |
| 4.2.1 | Add `analyzeDiscrepancy(roomId, itemId)` | HTTP POST to analyze endpoint; return analysis or throw. TEST-4.2 must pass. | quickstart.MD §5 |
| 4.2.2 | Add `generateSummary(roomId)` | HTTP POST to summary endpoint; return summary text/structure. TEST-4.2 must pass. | quickstart.MD §5 |

---

### 4.3 Web — AI features (facilitator)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-4.3 | **[TEST FIRST]** Write React Testing Library tests for AI features | Tests: "Analyze" button visible after reveal; clicking it shows "Analyzing..." loading state; result shown as "AI suggestion — you decide."; AI unavailable → "Analysis unavailable. You can still record the final estimate." (core flow not blocked); "Generate Summary" button compiles and shows summary; export/copy works; export failure → "Could not generate summary. Try again." (no data loss). Tests fail until components exist. | spec.MD §7.1, §7.2, §15.5 |
| 4.3.1 | Discrepancy analysis button | After reveal, "Analyze" button; call API; show loading "Analyzing..."; display result as "AI suggestion — you decide." TEST-4.3 must pass. | spec.MD §7.1 |
| 4.3.2 | AI error handling | AI unavailable or timeout: "Analysis unavailable. You can still record the final estimate." No blocking. TEST-4.3 must pass. | spec.MD §15.5 |
| 4.3.3 | Generate summary button | "Generate Summary" compiles items, votes, final estimates, participants; display structured text. TEST-4.3 must pass. | spec.MD §7.2 |
| 4.3.4 | Export summary | Copy or export (plain text, JSON); download or clipboard. Failure: "Could not generate summary. Try again." No data loss. TEST-4.3 must pass. | spec.MD §15.5 |

---

## Phase 4 completion checklist

- All Phase 4 TEST tasks have passing tests.
- Facilitator can trigger discrepancy analysis after reveal; loading state; result as recommendation.
- AI unavailable/timeout: clear message; core flow (record final estimate) not blocked.
- Facilitator can generate session summary; export/copy; failure shows retry.

---

## Phase 5: History & Reporting

These tasks implement **History & Reporting** (User Stories 8.1–8.2) per `spec.MD` §15.6. Covers: Session History, Export Results.

**TDD rule for Phase 5:** TEST tasks precede all implementation tasks.

**Definition of done for Phase 5:** Users can view session history (room name, date, items, final estimates). Facilitator can export results. Empty state and errors handled. All covered by automated tests.

---

### 5.1 Server — History and export

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-5.1 | **[TEST FIRST]** Write supertest tests for history and export endpoints | Tests: `GET /api/rooms/:id/history` → 200 with session summary when room closed; room open → 400 or partial; `GET /api/rooms/:id/export?format=json` → 200 with JSON; `format=csv` → 200 with CSV; invalid format → 400. Tests fail until routes exist. | spec.MD §8.1, §8.2 |
| 5.1.1 | `GET /api/rooms/:id/history` | Return session summary (items, final estimates, participants, date) for room. Available when room closed. TEST-5.1 must pass. | spec.MD §8.1 |
| 5.1.2 | `GET /api/rooms/:id/export?format=json\|csv\|txt` | Return export in requested format. Facilitator or room participant. TEST-5.1 must pass. | spec.MD §8.2 |

---

### 5.2 Shared — History API client

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-5.2 | **[TEST FIRST]** Write unit tests for history API client functions | Tests (using msw): `getSessionHistory` returns session summary; `exportSession` returns blob or triggers download. Tests fail until functions exist. | quickstart.MD §5 |
| 5.2.1 | Add `getSessionHistory(roomId)` | HTTP GET; return session summary. TEST-5.2 must pass. | quickstart.MD §5 |
| 5.2.2 | Add `exportSession(roomId, format)` | HTTP GET with format param; return blob or trigger download. TEST-5.2 must pass. | quickstart.MD §5 |

---

### 5.3 Web — History and export

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-5.3 | **[TEST FIRST]** Write React Testing Library tests for History and Export | Tests: session history view shows room name, date, items, final estimates; empty state → "No sessions yet. Create a room to get started." with link; load error → "Could not load history. Try again." with retry; format selector renders JSON, CSV, plain text options; download/copy works; export failure → "Export failed. Try again." Tests fail until components exist. | spec.MD §8.1, §8.2, §15.6 |
| 5.3.1 | Session history view | After room close (or from summary): show room name, date, items, final estimates. Link to detailed view. TEST-5.3 must pass. | spec.MD §8.1 |
| 5.3.2 | Empty history state | No sessions: "No sessions yet. Create a room to get started." with link to create room. TEST-5.3 must pass. | spec.MD §15.6 |
| 5.3.3 | History load error | Load fails: "Could not load history. Try again." with retry. TEST-5.3 must pass. | spec.MD §15.6 |
| 5.3.4 | Export from summary | Format selector (JSON, CSV, plain text); download or copy. Failure: "Export failed. Try again." Preserve data. TEST-5.3 must pass. | spec.MD §8.2 |

---

## Phase 5 completion checklist

- All Phase 5 TEST tasks have passing tests.
- Session history viewable (room name, date, items, final estimates).
- Empty state and load error handled.
- Export in multiple formats; failure shows retry.

---

## Phase 6: Account Management *(optional for MVP)*

These tasks implement **Account Management** (User Stories 4.1–4.3) per `spec.MD` §15.1. Covers: Create Account, Login, Logout.

**TDD rule for Phase 6:** TEST tasks precede all implementation tasks.

**Definition of done for Phase 6:** User can create account (name, email, password); login; logout. Validation, duplicate email, rate limiting, session handling per use cases. All covered by automated tests.

---

### 6.1 Server — Auth and accounts

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-6.1 | **[TEST FIRST]** Write supertest tests for auth endpoints | Tests: `POST /api/auth/register` → 201 with session; duplicate email → 409; weak password → 400. `POST /api/auth/login` → 200 with session; invalid credentials → 401 with generic message; N failed attempts → 429 with retry-after. `POST /api/auth/logout` → 200; session invalidated. Tests fail until routes exist. | spec.MD §4.1–4.3, §15.1 |
| 6.1.1 | User/account data store | In-memory or DB: User (id, name, email, passwordHash). Email unique. TEST-6.1 must pass. | data-model (extend) |
| 6.1.2 | `POST /api/auth/register` | Accept `{ name, email, password }`; validate; check email not registered; create account; return session. Reject duplicate email. TEST-6.1 must pass. | spec.MD §4.1 |
| 6.1.3 | `POST /api/auth/login` | Accept `{ username/email, password }`; constant-time comparison; return session. Generic "Invalid username or password" on failure. TEST-6.1 must pass. | spec.MD §4.2 |
| 6.1.4 | `POST /api/auth/logout` | Invalidate session; return success. TEST-6.1 must pass. | spec.MD §4.3 |
| 6.1.5 | Rate limiting on login | After N failed attempts: return 429; "Too many attempts. Please try again in X minutes." TEST-6.1 must pass. | spec.MD §15.1 |

---

### 6.2 Shared — Auth API client

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-6.2 | **[TEST FIRST]** Write unit tests for auth API client functions | Tests (using msw): `register` returns session; `login` returns session; `logout` resolves and clears client session. Tests fail until functions exist. | quickstart.MD §5 |
| 6.2.1 | Add `register(name, email, password)` | HTTP POST; return session. TEST-6.2 must pass. | quickstart.MD §5 |
| 6.2.2 | Add `login(username, password)` | HTTP POST; return session. TEST-6.2 must pass. | quickstart.MD §5 |
| 6.2.3 | Add `logout()` | HTTP POST; clear client session. TEST-6.2 must pass. | quickstart.MD §5 |

---

### 6.3 Web — Account screens

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| TEST-6.3 | **[TEST FIRST]** Write React Testing Library tests for Account screens | Tests: create account form renders name, email, password, confirm password; password mismatch → "Passwords do not match."; duplicate email → "An account with this email already exists." + link to login; network error → generic message + retry; login form renders username/email and password; invalid credentials → "Invalid username or password."; rate limit → "Too many attempts. Try again in X minutes."; already authenticated → redirect; logout button clears session and redirects; in-room logout → confirmation dialog. Tests fail until components exist. | spec.MD §4.1–4.3, §15.1 |
| 6.3.1 | Create account form | Name, email, password, confirm password. Inline validation; password strength hint. Submit → register; success → redirect. TEST-6.3 must pass. | spec.MD §4.1 |
| 6.3.2 | Create account errors | Duplicate email: "An account with this email already exists." + link to login. Password mismatch: "Passwords do not match." Network/server: generic message + retry. TEST-6.3 must pass. | spec.MD §15.1 |
| 6.3.3 | Login form | Username/email, password. Inline validation (required). Submit → login; success → redirect. TEST-6.3 must pass. | spec.MD §4.2 |
| 6.3.4 | Login errors | Invalid credentials: "Invalid username or password." Rate limit: "Too many attempts. Try again in X minutes." Already authenticated → redirect. TEST-6.3 must pass. | spec.MD §15.1 |
| 6.3.5 | Logout | Logout button; invalidate session; clear client storage; redirect to landing. If in room: confirm "You will leave the room. Continue?" TEST-6.3 must pass. | spec.MD §4.3 |

---

## Phase 6 completion checklist

- All Phase 6 TEST tasks have passing tests.
- User can create account; duplicate email and validation errors handled.
- User can login; invalid credentials, rate limiting, already-authenticated handled.
- User can logout; session cleared; redirect to landing. In-room logout confirms.

---

## Use Case Coverage Checklist

This checklist maps each use case from `spec.MD` §15 to implementation status. Use it to track what remains.

| Use Case | Phase | Test Task | Status / Tasks |
|----------|-------|-----------|----------------|
| **UC-4.1** Create Account | 6 | TEST-6.1, TEST-6.3 | 6.1.2, 6.3.1, 6.3.2 |
| **UC-4.2** Login | 6 | TEST-6.1, TEST-6.3 | 6.1.3, 6.1.5, 6.3.3, 6.3.4 |
| **UC-4.3** Logout | 6 | TEST-6.1, TEST-6.3 | 6.1.4, 6.3.5 |
| **UC-5.1** Create Room | 2 | TEST-2.1, TEST-2.2.1, TEST-2.5 | 2.1.4, 2.2.1, 2.5.1–2.5.4 |
| **UC-5.2** Join Room | 2 | TEST-2.2.2, TEST-2.2.3, TEST-2.6 | 2.2.2, 2.2.3, 2.6.1–2.6.5 |
| **UC-5.3** Close Room | 2 | TEST-2.2.5, TEST-2.3, TEST-2.7 | 2.2.5, 2.3.3, 2.7.4, 2.7.5 |
| **UC-5.4** Leave Room | 2 | TEST-2.2.4, TEST-2.3, TEST-2.7 | 2.2.4, 2.2.6, 2.3.4, 2.7.3 |
| **UC-5.5** Join as Observer | 2 | TEST-2.2.3, TEST-2.6, TEST-2.7 | 2.2.3, 2.6.3, 2.7.8 |
| **UC-15.3** Room closed while user present | 2 | TEST-2.3, TEST-2.7 | 2.3.3, 2.3.5, 2.7.5, 2.7.6, 2.7.7 |
| **UC-6.1** Add Estimation Item | 3 | TEST-3.1, TEST-3.2.1–3.2.3, TEST-3.5 | 3.2.1–3.2.3, 3.5.1–3.5.4 |
| **UC-6.2** Secret Voting | 3 | TEST-3.2.4, TEST-3.2.4b, TEST-3.3, TEST-3.6 | 3.2.4, 3.3.2, 3.6.1–3.6.7 |
| **UC-6.3** Reveal Votes | 3 | TEST-3.2.5, TEST-3.3, TEST-3.7 | 3.2.5, 3.3.3, 3.7.1, 3.7.2 |
| **UC-6.4** Re-vote | 3 | TEST-3.2.6, TEST-3.3, TEST-3.7 | 3.2.6, 3.3.4, 3.7.4 |
| **UC-6.5** Record Final Estimate | 3 | TEST-3.2.7, TEST-3.3, TEST-3.7 | 3.2.7, 3.3.4, 3.7.5, 3.7.6 |
| **UC-15.7** Reconnection & Recovery | 2, 3 | TEST-2.3, TEST-2.7, TEST-3.8 | 2.3.5, 2.7.6, 2.7.7, 3.6.5, 3.8.5 |
| **UC-7.1** Discrepancy Analysis | 4 | TEST-4.1, TEST-4.3 | 4.1.1, 4.3.1, 4.3.2 |
| **UC-7.2** Session Summary | 4 | TEST-4.1, TEST-4.3 | 4.1.2, 4.3.3, 4.3.4 |
| **UC-8.1** Session History | 5 | TEST-5.1, TEST-5.3 | 5.1.1, 5.3.1–5.3.3 |
| **UC-8.2** Export Results | 5 | TEST-5.1, TEST-5.3 | 5.1.2, 5.3.4 |

---

## Reference

| Document | Purpose |
|----------|---------|
| `drivin-design/spec.MD` | What to build (product, user stories, success criteria). |
| `drivin-design/configuration.MD` | How to build (workflow, TDD rules, AI rules, slice order). |
| `drivin-design/data-model.MD` | Data structures and relationships. |
| `drivin-design/ui-definition.MD` | UI rules, themes, components, and screen layouts. |
| `drivin-design/quickstart.MD` | Stack, versions, testing tools, and commands. |
| `drivin-design/tasks.MD` | This file — implementation tasks with TDD test tasks. |
