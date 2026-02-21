# Tasks — Spec-Driven Implementation

This file lists **implementation tasks** derived from the spec-driven workflow (`configuration.MD`), the product spec (`spec.MD`), the data model (`data-model.MD`), and the stack (`quickstart.MD`). Tasks are grouped by phase; complete **Phase 1 (Architecture)** before starting feature slices.

**Current focus:** Web app + server only. Mobile tasks (Phase 2.8, etc.) are **deferred** until the web MVP is complete. Server uses in-memory / mocked data.

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
| 1.1.4 | Add root `README.md` | Short description of the project, link to `drivin-design/spec.MD` and `drivin-design/quickstart.MD`, and “Quick start” section with install + run commands. | quickstart.MD |

---

### 1.2 Shared package (`packages/shared`)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 1.2.1 | Create `packages/shared` with `package.json` | Name: `"shared"`. TypeScript; `main`/`types` (or `exports`) point to built output; no React/Node-specific deps in shared. | quickstart.MD §1, §5 |
| 1.2.2 | Add TypeScript to shared | `tsconfig.json` with strict mode; output to `dist/` (or `build/`); `src/` as source. Script: `build` (tsc), `typecheck` (tsc --noEmit). | quickstart.MD |
| 1.2.3 | Define types from data model | Export TypeScript types/interfaces for: `Room`, `Participant`, `Item`, `Round`, `Vote`, `Session`; enums: `RoomState`, `DeckType`, `ParticipantRole`, `RoundState`. Match field names and optionality in `data-model.MD` §2 and §3. | data-model.MD |
| 1.2.4 | Add deck constants | Export deck definitions (e.g. FIBONACCI, LINEAR, TSHIRT) with `deckType` and `deckValues` arrays as in spec. | spec.MD §5.1, data-model.MD §3.2 |
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

- [X] From repo root: `npm install` (or `pnpm install`) completes without errors.
- [X] `npm run typecheck -w shared` passes.
- [X] `npm run dev -w web` starts the web app; default page loads.
- [X] `npm run start -w mobile` starts the Expo app; app runs in simulator or Expo Go.
- [X] `npm run dev -w server` starts the server; `GET /health` returns 200.
- [X] Shared package exports types for Room, Participant, Item, Round, Vote, Session and enums (RoomState, DeckType, ParticipantRole, RoundState).
- [X] Root README describes how to run the project and points to `drivin-design/`.

---

## Phase 2: Room Management

These tasks implement **Room Management** (User Stories 5.1–5.5) per `configuration.MD` §5 (slice ordering). Covers: Create Room, Join Room, Close Room, Leave Room, Join as Observer. Implementation must align with `spec.MD`, `data-model.MD`, and `ui-definition.MD`.

**Definition of done for Phase 2:** A facilitator can create a room with name and deck type, get a shareable link, and copy it. A participant can join via link with display name (or as observer). Participants see each other in the room. Facilitator can close the room; participants can leave. All success criteria for User Stories 5.1–5.5 are satisfied.

---

### 2.1 Server — Room data and storage

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 2.1.1 | Add room data store | In-memory `Map<string, Room>` (or SQLite per data-model) for rooms. Room has: id (UUID), name, deckType, deckValues, state, facilitatorId, createdAt, closedAt. | data-model.MD §2.1 |
| 2.1.2 | Add participant data store | In-memory `Map<string, Participant>` for participants. Participant has: id, roomId, displayName, role, joinedAt, leftAt, isActive, sessionId. | data-model.MD §2.2 |
| 2.1.3 | Add session data store | In-memory `Map<string, Session>` for sessions (1:1 with room). Session has: id, roomId, startedAt, closedAt, facilitatorId, facilitatorName, totalItems, totalParticipants. | data-model.MD §2.6 |
| 2.1.4 | Implement room creation logic | Create room with unique ID; create facilitator participant; create session; return room + shareable link (e.g. `/room/{id}`). Deck values from shared deck constants. | spec.MD §5.1, data-model.MD §2.1 |

---

### 2.2 Server — REST API for rooms

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 2.2.1 | `POST /api/rooms` — Create room | Accept `{ name, deckType }`; validate; create room + facilitator + session; return `{ room, participant, shareableLink }`. | spec.MD §5.1 |
| 2.2.2 | `GET /api/rooms/:id` — Get room | Return room by ID; 404 if not found or closed (or allow read for closed). Include deckValues, state, name. | spec.MD §5.2 |
| 2.2.3 | `POST /api/rooms/:id/join` — Join room | Accept `{ displayName, role? }`; validate name; create participant; return `{ participant, room }`. Reject if room closed. Role defaults to PARTICIPANT; allow OBSERVER. | spec.MD §5.2, §5.5 |
| 2.2.4 | `POST /api/rooms/:id/leave` — Leave room | Accept `{ participantId }`; set participant `isActive=false`, `leftAt=now`; return success. Idempotent if already left. | spec.MD §5.4 |
| 2.2.5 | `POST /api/rooms/:id/close` — Close room | Accept `{ participantId }`; verify participant is facilitator; set room `state=CLOSED`, `closedAt=now`; update session; return success. Reject if not facilitator. | spec.MD §5.3 |

---

### 2.3 Server — WebSocket for real-time presence

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 2.3.1 | Add WebSocket server | Socket.io or native WS; accept connections; associate socket with room + participant (via join token or session). | quickstart.MD §1 |
| 2.3.2 | Emit participant joined/left | When participant joins or leaves, broadcast to room: `participantJoined`, `participantLeft` with participant info. Clients see updated list. | spec.MD §5.2, §5.4 |
| 2.3.3 | Emit room closed | When facilitator closes room, broadcast `roomClosed` to all in room. Clients can show read-only state. | spec.MD §5.3 |
| 2.3.4 | Handle disconnect | On socket disconnect, mark participant `isActive=false`, `leftAt=now`; broadcast `participantLeft`. | spec.MD §5.4, NFRs |

---

### 2.4 Shared — Room API client

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 2.4.1 | Add `createRoom(name, deckType)` | HTTP POST to `/api/rooms`; return `{ room, participant, shareableLink }`. Use shared types. | quickstart.MD §5 |
| 2.4.2 | Add `getRoom(roomId)` | HTTP GET `/api/rooms/:id`; return room or throw. | quickstart.MD §5 |
| 2.4.3 | Add `joinRoom(roomId, displayName, role?)` | HTTP POST `/api/rooms/:id/join`; return `{ participant, room }`. | quickstart.MD §5 |
| 2.4.4 | Add `leaveRoom(roomId, participantId)` | HTTP POST `/api/rooms/:id/leave`. | quickstart.MD §5 |
| 2.4.5 | Add `closeRoom(roomId, participantId)` | HTTP POST `/api/rooms/:id/close`. | quickstart.MD §5 |
| 2.4.6 | Add WebSocket room client | Connect to room; subscribe to `participantJoined`, `participantLeft`, `roomClosed`; expose typed events. | quickstart.MD §1 |

---

### 2.5 Web — Create Room screen

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 2.5.1 | Create Room form | Screen "Create room" with: room name (required), deck selector (Fibonacci, Linear 0–10, T-shirt), "Create room" button. Use component system (inputs, buttons). | ui-definition.MD §7.2 |
| 2.5.2 | Call createRoom API | On submit, call shared `createRoom`; show loading state; handle validation and errors. | spec.MD §5.1 |
| 2.5.3 | Success state with shareable link | After success: show "Room created", shareable link, "Copy link" button (one-click copy to clipboard). Optional "Open room" to navigate to room. | spec.MD §5.1 |
| 2.5.4 | Theme and responsive | Light/dark theme; mobile-first; touch targets ≥ 44 px; keyboard submit. | ui-definition.MD §5, §6 |

---

### 2.6 Web — Join Room screen (Landing)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 2.6.1 | Join by link screen | When user opens `/room/:id` (or similar): show "Join [Room name]" or "Join planning session"; form: display name (required), "Join as observer" toggle, "Join" button. | ui-definition.MD §7.1 |
| 2.6.2 | Fetch room before join | Load room via `getRoom`; show room name; handle 404 (room not found) and closed room with message + "Create room instead" link. | spec.MD §5.2 |
| 2.6.3 | Call joinRoom API | On submit, call `joinRoom(roomId, displayName, role)`; role = OBSERVER if toggle on, else PARTICIPANT. Show loading; handle errors. | spec.MD §5.2, §5.5 |
| 2.6.4 | Navigate to room on success | After join, navigate to room lobby; persist participant ID (e.g. in state or storage) for leave/close. | spec.MD §5.2 |

---

### 2.7 Web — Room Lobby (unified room view, Phase 2 scope)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 2.7.1 | Room lobby layout | Header: room name, badge (Open/Closed). Section: participant list (avatars/names, "N participants"). For Phase 2: no items yet; show "No item yet" placeholder. | ui-definition.MD §7.3 |
| 2.7.2 | Participant list with real-time updates | Display active participants; connect WebSocket; update list on `participantJoined`, `participantLeft`. Observers shown with "(observer)" label. | spec.MD §5.2, §5.5 |
| 2.7.3 | Leave room (participant) | "Leave" button; confirmation: "Leave this room? You will need the link to rejoin." Destructive "Leave" + "Cancel". Call `leaveRoom`; navigate away. | spec.MD §5.4, ui-definition.MD §7.9 |
| 2.7.4 | Close room (facilitator) | "Close room" button (facilitator only); confirmation: "Close this room? No one will be able to vote after closing." Call `closeRoom`; show read-only state. | spec.MD §5.3, ui-definition.MD §7.9 |
| 2.7.5 | Handle room closed event | On WebSocket `roomClosed`, update UI to read-only; hide vote/close actions; show "Session ended" or similar. | spec.MD §5.3 |
| 2.7.6 | Role-based UI | Facilitator sees "Close room"; participant/observer see "Leave". Observer sees same layout but no vote controls (none in Phase 2). | spec.MD §5.3, §5.4, §5.5 |

---

### 2.8 Mobile — Room Management screens *(deferred until web MVP complete)*

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 2.8.1 | Create Room screen | Same as web: room name, deck selector, create button; success with shareable link and copy. Use Expo Share API or clipboard for copy. | ui-definition.MD §7.2, quickstart.MD |
| 2.8.2 | Join Room screen | Same as web: display name, observer toggle, join button. Handle room not found/closed. | ui-definition.MD §7.1 |
| 2.8.3 | Room Lobby screen | Same as web: participants list, leave/close with confirmation. Touch targets ≥ 44 px. | ui-definition.MD §7.3 |
| 2.8.4 | Navigation and routing | Deep link or route for `/room/:id`; navigate create → lobby, join → lobby. | quickstart.MD |

---

### 2.9 Routing and entry points

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 2.9.1 | Web routing | Routes: `/` (landing or create), `/room/:id` (join or lobby), `/room/:id/create` (create from home). Lobby at `/room/:id` when joined. | ui-definition.MD |
| 2.9.2 | Entry from shareable link | Shareable link format: `{origin}/room/{roomId}`. Opening link shows join screen if not joined; lobby if already joined (e.g. from storage). | spec.MD §5.1 |

---

## Phase 2 completion checklist

Before moving to Phase 3 (Estimation Process):

- [X] Facilitator can create room with name and deck; gets shareable link; can copy link (one-click).
- [X] Participant can join via link with display name; sees participant list; can view room.
- [X] Participant can choose "Join as observer"; observer sees room but cannot vote; observer appears in list.
- [X] Participant can leave room; confirmation shown; after leave, no longer in list; others see update.
- [X] Facilitator can close room; confirmation shown; after close, no votes possible; session history viewable.
- [X] Real-time: participant list updates when others join/leave; room closed event propagates.
- [X] Web supports create, join, lobby, leave, close flows. (Mobile deferred.)
- [X] All UI follows ui-definition.MD (themes, touch targets, confirmations).

---

## Phase 3: Estimation Process

These tasks implement **Estimation Process** (User Stories 6.0–6.6) per `configuration.MD`. Covers: Add item, Secret voting (participant + facilitator), Reveal votes, Post-reveal statistics, Re-vote, Record final estimate. Implementation must align with `spec.MD`, `data-model.MD`, and `ui-definition.MD`.

**Definition of done for Phase 3:** Facilitator can add estimation items (title, description). Participants and facilitator can vote in secret; votes hidden until reveal. Facilitator reveals votes; all see votes, statistics (average, suggested estimate, vote distribution), and card descriptions (if any). Facilitator can re-vote or record final estimate. Item marked estimated; next item or close room.

---

### 3.1 Server — Item and voting data

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 3.1.1 | Add item data store | In-memory `Map<string, Item>` for items. Item has: id, roomId, title, description, order, finalEstimate, finalEstimateRecordedAt, createdAt, currentRoundId. | data-model.MD §2.3 |
| 3.1.2 | Add round data store | In-memory `Map<string, Round>` for rounds. Round has: id, itemId, roundNumber, state (VOTING/REVEALED/FINALIZED), votesRevealedAt, createdAt, finalizedAt. | data-model.MD §2.4 |
| 3.1.3 | Add vote data store | In-memory `Map<string, Vote>` for votes. Vote has: id, roundId, participantId, cardValue, votedAt. One vote per participant per round; facilitator can vote. | data-model.MD §2.5 |
| 3.1.4 | Add deckDescriptions to Room | Optional `deckDescriptions` (Record<value, description>) on Room; hidden from participants until reveal. | spec.MD §5.1, data-model.MD §2.1 |

---

### 3.2 Server — REST API for estimation

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 3.2.1 | `POST /api/rooms/:id/items` — Add item | Accept `{ title, description? }`; validate; create item with next order; create first round (VOTING); return item. Facilitator only. | spec.MD §6.1 |
| 3.2.2 | `PATCH /api/rooms/:id/items/:itemId` — Edit item | Accept `{ title?, description? }`; validate; update item. Only before voting starts. Facilitator only. | spec.MD §6.1 |
| 3.2.3 | `DELETE /api/rooms/:id/items/:itemId` — Remove item | Remove item and associated rounds/votes. Facilitator only. | spec.MD §6.1 |
| 3.2.4 | `POST /api/rooms/:id/items/:itemId/vote` — Cast vote | Accept `{ participantId, cardValue }`; validate cardValue in deckValues; create or update vote. Participant or facilitator (not observer). | spec.MD §6.2 |
| 3.2.5 | `POST /api/rooms/:id/items/:itemId/reveal` — Reveal votes | Set round state to REVEALED; set votesRevealedAt. Facilitator only. Return votes + statistics (average, median, suggestedEstimate, voteDistribution). | spec.MD §6.3, §6.6 |
| 3.2.6 | `POST /api/rooms/:id/items/:itemId/revote` — Re-vote | Create new round (roundNumber+1); clear votes for new round; previous round kept in history. Facilitator only. | spec.MD §6.4 |
| 3.2.7 | `POST /api/rooms/:id/items/:itemId/finalize` — Record final estimate | Accept `{ cardValue }`; set item.finalEstimate, finalEstimateRecordedAt; set round state FINALIZED. Facilitator only. | spec.MD §6.5 |

---

### 3.3 Server — WebSocket for real-time voting

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 3.3.1 | Emit item added/updated/removed | When facilitator adds, edits, or removes item, broadcast to room: `itemAdded`, `itemUpdated`, `itemRemoved`. | spec.MD §6.1 |
| 3.3.2 | Emit vote count (no values) | When participant/facilitator votes, broadcast `voteCount` with `{ votedCount, totalCount }`; never reveal values before reveal. | spec.MD §6.2 |
| 3.3.3 | Emit votes revealed | When facilitator reveals, broadcast `votesRevealed` with votes, statistics (average, median, suggestedEstimate, voteDistribution), and deckDescriptions. | spec.MD §6.3, §6.6 |
| 3.3.4 | Emit re-vote and finalize | On re-vote: broadcast `revoteStarted`. On finalize: broadcast `finalEstimateRecorded` with item and final value. | spec.MD §6.4, §6.5 |

---

### 3.4 Shared — Estimation API client

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 3.4.1 | Add `addItem(roomId, title, description?)` | HTTP POST to `/api/rooms/:id/items`; return item. | quickstart.MD §5 |
| 3.4.2 | Add `updateItem(roomId, itemId, { title?, description? })` | HTTP PATCH to `/api/rooms/:id/items/:itemId`. | quickstart.MD §5 |
| 3.4.3 | Add `removeItem(roomId, itemId)` | HTTP DELETE to `/api/rooms/:id/items/:itemId`. | quickstart.MD §5 |
| 3.4.4 | Add `castVote(roomId, itemId, participantId, cardValue)` | HTTP POST to `/api/rooms/:id/items/:itemId/vote`. | quickstart.MD §5 |
| 3.4.5 | Add `revealVotes(roomId, itemId, participantId)` | HTTP POST to `/api/rooms/:id/items/:itemId/reveal`; return votes + statistics. | quickstart.MD §5 |
| 3.4.6 | Add `revote(roomId, itemId, participantId)` | HTTP POST to `/api/rooms/:id/items/:itemId/revote`. | quickstart.MD §5 |
| 3.4.7 | Add `recordFinalEstimate(roomId, itemId, participantId, cardValue)` | HTTP POST to `/api/rooms/:id/items/:itemId/finalize`. | quickstart.MD §5 |
| 3.4.8 | Extend WebSocket client for estimation events | Subscribe to `itemAdded`, `itemUpdated`, `itemRemoved`, `voteCount`, `votesRevealed`, `revoteStarted`, `finalEstimateRecorded`. | quickstart.MD §1 |

---

### 3.5 Web — Add / Edit Item (facilitator)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 3.5.1 | Add item form (modal or inline) | Form: title (required), description (optional); "Save" and "Cancel". "Add item" button triggers form. | ui-definition.MD §7.4 |
| 3.5.2 | Call addItem API | On submit, call `addItem`; show loading; handle errors. Item appears immediately to all via WebSocket. | spec.MD §6.1 |
| 3.5.3 | Edit item (before voting) | "Edit" on item card; same form; call `updateItem`. "Remove item" with confirmation; call `removeItem`. | spec.MD §6.1 |
| 3.5.4 | Theme and responsive | Use component system; touch targets ≥ 44 px; keyboard submit. | ui-definition.MD §5, §6 |

---

### 3.6 Web — Voting (participant and facilitator)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 3.6.1 | Card deck UI | Display cards with values from room deckValues only (no descriptions before reveal). Selected card visually distinct. Single tap to vote. | ui-definition.MD §6.2, §7.3, §7.10 |
| 3.6.2 | Cast vote and change vote | Call `castVote` on selection; allow change until reveal. Facilitator sees same deck and can vote. | spec.MD §6.2 |
| 3.6.3 | Vote count feedback | Show "X of Y have voted" (no values). Update via WebSocket `voteCount`. | spec.MD §6.2 |
| 3.6.4 | Observer state | Observer sees "You are observing; no vote." No card deck. | spec.MD §5.5 |
| 3.6.5 | Keyboard and accessibility | Cards focusable; Enter/Space to select; logical Tab order. | ui-definition.MD §4.2 |

---

### 3.7 Web — Reveal, statistics, re-vote, record final (facilitator)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 3.7.1 | Reveal votes button | "Reveal votes" (facilitator only, when voting); call `revealVotes`; all votes displayed simultaneously. | spec.MD §6.3 |
| 3.7.2 | Post-reveal display | Show all votes; highlight highest and lowest; card descriptions (if any) visible. | spec.MD §6.3, ui-definition.MD §7.10 |
| 3.7.3 | Post-reveal statistics | Display average value, suggested estimate (rounded), vote distribution (e.g. "3 voted 5, 2 voted 8, 1 voted 13"). | spec.MD §6.6 |
| 3.7.4 | Re-vote button | "Re-vote" clears current round; call `revote`; new round starts; previous round in history. | spec.MD §6.4 |
| 3.7.5 | Record final estimate | Select value or "Use suggested"; "Confirm final estimate" button; call `recordFinalEstimate`. Item marked estimated. | spec.MD §6.5, ui-definition.MD §7.5 |
| 3.7.6 | Next item or close | After finalize: "Add next item" or "Close room". Show estimated items list. | spec.MD §6.5 |

---

### 3.8 Web — Room Lobby integration (Phase 3 scope)

| ID | Task | Acceptance criteria | Ref |
|----|------|---------------------|-----|
| 3.8.1 | Current item section | Display current item (title, description); "No item yet" + "Add item" when empty. | ui-definition.MD §7.3 |
| 3.8.2 | Item list (estimated) | Show list of estimated items with final estimates; current item highlighted. | spec.MD §6.5 |
| 3.8.3 | State-driven UI | No item → lobby; voting → cards + vote count; revealed → votes + statistics + record/re-vote; finalized → next item. | spec.MD §6.0–6.6 |
| 3.8.4 | WebSocket sync | All estimation state updates (items, votes, reveal, finalize) propagate in real time to all participants. | spec.MD §6.1–6.6 |

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

- [X] Facilitator can add estimation items (title, description); edit and remove before voting.
- [X] Participants and facilitator can vote in secret; votes hidden until reveal; "X of Y have voted" shown.
- [X] Facilitator reveals votes; all see votes, average, suggested estimate, vote distribution; card descriptions visible after reveal.
- [X] Facilitator can re-vote (new round) or record final estimate.
- [X] Item marked estimated; facilitator can add next item or close room.
- [X] Real-time: items, votes, reveal, finalize propagate via WebSocket.
- [X] All UI follows ui-definition.MD (themes, touch targets, confirmations).

---

## Reference

| Document | Purpose |
|----------|--------|
| `drivin-design/spec.MD` | What to build (product, user stories, success criteria). |
| `drivin-design/configuration.MD` | How to build (workflow, AI rules, slice order). |
| `drivin-design/data-model.MD` | Data structures and relationships. |
| `drivin-design/ui-definition.MD` | UI rules, themes, components, and screen layouts. |
| `drivin-design/quickstart.MD` | Stack, versions, and commands. |
| `drivin-design/tasks.MD` | This file—implementation tasks. |
