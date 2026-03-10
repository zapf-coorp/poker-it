# Configuration — Spec-Driven, TDD-First Design Assisted by AI

This document defines how the product is built using **spec-driven design** with **AI assistance** and a strict **Test-Driven Development (TDD)** discipline. It is the playbook that ties the functional specification (`spec.MD`) to implementation, quality, and iteration.

---

## 1. Role of This File

| Document | Purpose |
|----------|--------|
| **`spec.MD`** | Single source of truth: product vision, user roles, user stories, success criteria, business rules, and scope. No implementation detail. |
| **`configuration.MD`** | How to use the spec with AI: workflow, TDD rules, interpretation rules, conventions, and quality bar. |
| **`tasks.MD`** | Implementation tasks by phase. Every task has a paired test task that **must be completed first**. |
| **`ui-definition.MD`** | UI/UX rules: mobile-first, breakpoints, themes (light/dark), components, and screen layouts. |
| **`quickstart.MD`** | Stack, versions, testing tools, and commands. |

**Rule:** All design and implementation decisions must be traceable to `spec.MD`. When the spec is silent, make minimal, reversible choices and optionally propose a spec update.

---

## 2. Core Principles

1. **Spec first** — Read and reference the spec before designing or coding. Every feature maps to a section or user story.
2. **Test first (TDD)** — No production code, no HTML, no CSS, no file is created before a failing test exists for it. Write the test → see it fail → write the minimum code to pass → refactor.
3. **Success criteria are acceptance criteria** — Each user story's "Success Criteria" define done. Implementation is complete when those are satisfied and covered by tests.
4. **Incremental delivery** — Build in small, shippable slices (by user story or coherent group). Prefer vertical slices (e.g. one story end-to-end) over horizontal layers.
5. **AI as spec follower** — AI assists by implementing and verifying against the spec, not by inventing scope. When in doubt, ask or propose a spec change.
6. **Reversibility** — Prefer technology and structure that can be changed later without rewriting the spec.

---

## 3. TDD Mandate

### 3.1 The Rule — No Code Without a Test First

> **No production code, no component, no API route, no CSS file, no HTML file, no configuration file for a feature may be created or modified until a failing test for that behavior exists.**

This applies to:
- Server routes and business logic
- Shared API client functions
- React components (unit and integration tests)
- Custom hooks
- Utility functions and helpers
- WebSocket event handlers
- UI state transitions

### 3.2 TDD Cycle (Red → Green → Refactor)

For every task in `tasks.MD`:

1. **Red** — Write a test that describes the expected behavior. Run it. Confirm it fails (not due to a syntax error, but because the behavior does not exist yet).
2. **Green** — Write the minimum production code needed to make the test pass. Do not add more than what the test requires.
3. **Refactor** — Clean up the code while keeping all tests green. Extract, rename, simplify — but never change behavior.

### 3.3 Test Types and When to Use Each

| Test Type | What it covers | Tools |
|-----------|----------------|-------|
| **Unit** | Single function, hook, or utility in isolation | Vitest, Jest |
| **Component** | React component rendering, user interaction, state | Vitest + React Testing Library |
| **Integration** | Multiple units working together (e.g. hook + API client) | Vitest + msw (mock server) |
| **Server** | Express/Fastify route logic, data store operations | Vitest or Jest + supertest |
| **E2E** | Full user flow in a real browser | Playwright or Cypress |

### 3.4 Test File Conventions

- Test files live **next to the file they test** or in a `__tests__/` folder at the same level.
- Naming: `ComponentName.test.tsx`, `hookName.test.ts`, `routeName.test.ts`.
- Each test file imports only what it needs; mock external dependencies (API, WebSocket, storage).
- Tests must be deterministic: no random data, no real network calls, no real timers unless explicitly tested.

### 3.5 What a Test Must Cover

For each task, tests must cover:

- **Happy path** — The primary success scenario described in the success criteria.
- **Error paths** — Every error state mentioned in the spec (validation errors, network failures, 404, 409, etc.).
- **Edge cases** — Empty states, boundary values, role-based access (facilitator vs participant vs observer).
- **UI feedback** — Loading states, error messages, success messages, disabled states.

### 3.6 Definition of "Test First" for Each Layer

| Layer | Test first means... |
|-------|---------------------|
| **Server route** | Write a supertest test for the route before creating the route handler. |
| **Data store / service** | Write a unit test for the function before implementing it. |
| **API client (shared)** | Write a test with a mocked HTTP response before writing the fetch call. |
| **React component** | Write a React Testing Library test for the rendered output and interactions before creating the component file. |
| **Custom hook** | Write a `renderHook` test for the hook's behavior before implementing the hook. |
| **WebSocket event** | Write a test for the event handler / listener before wiring it up. |

---

## 4. Workflow: Spec → Test → Build → Verify

### 4.1 Before Any Implementation

1. **Identify scope** — Choose a section of `spec.MD` (e.g. "5. Room Management" or "User Story 6.2 — Secret Voting").
2. **List success criteria** — Copy the success criteria for the selected story/area. These become the test cases.
3. **Check dependencies** — Ensure any referenced roles, flows, or data (e.g. "Facilitator", "Room") are either already implemented and tested, or included in this slice.
4. **Confirm with MVP** — If the project defines an MVP (e.g. §11 in `spec.MD`), prioritize MVP items first.

### 4.2 During Implementation (TDD Loop)

1. **Write the test** — Translate one success criterion into a failing test. Commit the test file.
2. **Run the test** — Confirm it fails for the right reason (behavior missing, not syntax error).
3. **Implement to the spec** — Write only the code needed to make the test pass. Do not add behavior beyond what the test requires.
4. **Run all tests** — Confirm the new test passes and no existing tests regress.
5. **Refactor** — Improve code quality; re-run tests.
6. **Repeat** — Move to the next success criterion or error path.

### 4.3 After a Slice

1. **Verify** — Go through each success criterion and confirm it is covered by a passing test.
2. **Update spec if needed** — If you discovered missing or wrong behavior, propose an edit to `spec.MD` (and optionally to this file) rather than only documenting in code.
3. **Decide next slice** — Pick the next user story or area, respecting dependencies and MVP order.

---

## 5. AI Assistance Rules

When using an AI assistant to build from this spec:

### 5.1 Always

- **Write tests first** — When asked to implement a feature, the AI must produce the test file(s) before any production code. If asked to write code directly, the AI must first ask: "Should I write the tests first?" and default to yes.
- **Cite the spec** — When implementing a feature, reference the section and user story (e.g. "Per User Story 6.2 — Secret Voting and its success criteria…").
- **Respect success criteria** — Treat them as mandatory. Do not mark a story done until each criterion is satisfied and covered by a test.
- **Respect business rules** — Section 9 in `spec.MD` (and any equivalent) are hard constraints (e.g. "Votes must remain secret until reveal").
- **Respect card selection rules** — Before reveal: participants can select, deselect, or change cards; selected card has distinct visual feedback (brighter, more contrasting border). After reveal: no selection, change, or deselection; votes are read-only.
- **Respect MVP** — When scope is unclear, implement in the order implied by the MVP section and avoid adding non-MVP features in the same slice.

### 5.2 When the Spec Is Unclear

- Implement the smallest reasonable interpretation that fits the rest of the spec.
- Add a short comment or doc note: "Spec ambiguity: …; implemented as …."
- Optionally propose a one-line addition to `spec.MD` to remove the ambiguity for next time.

### 5.3 When Proposing New Features

- Do not add features that are not in the spec. Instead, propose a new user story or section for `spec.MD` and get alignment before implementing.

### 5.4 Suggestion for Prompts

When asking the AI to implement a slice, a good pattern is:

- "Write tests for [User Story X.Y — Title] from spec.MD. Cover all success criteria and error paths. Do not write any production code yet."
- Then: "Now implement [User Story X.Y] to make those tests pass. Tech stack: see quickstart.MD."

---

## 6. Slice Ordering and Dependencies

Suggested implementation order (aligned with `spec.MD` and MVP):

1. **Room Management (create, join, close)** — Needed for any session.
2. **Estimation Process (add item, secret voting, reveal, re-vote)** — Core MVP.
3. **Session history (basic)** — MVP requirement.
4. **Account Management** — If auth is required for history or rooms.
5. **AI Assist** — After core flow is stable.
6. **Reporting / Export** — After history exists.

Adjust order only when technical constraints (e.g. auth, persistence) require it; document the reason in a short note.

---

## 7. Conventions and Constraints

- **Stack and repo** — Defined in **`quickstart.MD`**: React (web), Expo (mobile), monorepo, shared TypeScript, real-time (WebSockets), backend (Node + TypeScript). Keep the spec (`spec.MD`) stack-agnostic.
- **Current focus (until web app is complete)** — Develop **web app and server only**. No mobile implementation. Server uses in-memory / mocked data. Mobile tasks are deferred; resume after web MVP is stable.
- **Quality bar** — Every behavior covered by a success criterion must have an automated test. Manual verification is a supplement, not a substitute.
- **Test coverage** — Aim for full coverage of success criteria and error paths. Coverage tools (e.g. `vitest --coverage`) should be used to identify gaps.
- **Accessibility and i18n** — If the spec mentions "usable via web browser" or diverse users, assume basic accessibility and consider text/labels ready for later i18n unless the spec says otherwise.
- **Security and privacy** — Align with business rules (e.g. votes secret until reveal). No credentials or secrets in the spec or in code; use env/config.

---

## 8. Updating the Spec and This Configuration

- **Spec changes** — Any change to scope, behavior, or success criteria goes into `spec.MD`. Keep user stories and success criteria in sync with the product.
- **Process changes** — Changes to workflow, TDD rules, AI rules, or slice order go into `configuration.MD`.
- **Versioning** — Optionally add a short "Last updated" or version line at the top of each file when making substantive edits.

---

## 9. Summary

| Step | Action |
|------|--------|
| 1 | Use `spec.MD` as the single source of truth for what to build. |
| 2 | Use `configuration.MD` (this file) to drive how to build it with AI. |
| 3 | **Write tests first** — translate success criteria into failing tests before any production code. |
| 4 | Implement the minimum code to make tests pass. |
| 5 | Verify each slice: all success criteria covered by passing tests. |
| 6 | Propose spec or config updates when you find gaps or better process. |

This configuration guides the entire spec-driven, TDD-first, AI-assisted design and build process for the product described in `spec.MD`.
