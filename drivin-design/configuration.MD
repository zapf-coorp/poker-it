# Configuration — Spec-Driven Design Assisted by AI

This document defines how the product is built using **spec-driven design** with **AI assistance**. It is the playbook that ties the functional specification (`spec.MD`) to implementation, quality, and iteration.

---

## 1. Role of This File

| Document | Purpose |
|----------|--------|
| **`spec.MD`** | Single source of truth: product vision, user roles, user stories, success criteria, business rules, and scope. No implementation detail. |
| **`configuration.MD`** | How to use the spec with AI: workflow, interpretation rules, conventions, and quality bar. |
| **`tasks.MD`** | Implementation tasks by phase (e.g. Phase 1: architecture; Phase 2: first feature slice). |
| **`ui-definition.MD`** | UI/UX rules: mobile-first, breakpoints, themes (light/dark), components, and screen layouts. |

**Rule:** All design and implementation decisions must be traceable to `spec.MD`. When the spec is silent, make minimal, reversible choices and optionally propose a spec update.

---

## 2. Core Principles

1. **Spec first** — Read and reference the spec before designing or coding. Every feature maps to a section or user story.
2. **Success criteria are acceptance criteria** — Each user story’s “Success Criteria” define done. Implementation is complete when those are satisfied and testable.
3. **Incremental delivery** — Build in small, shippable slices (by user story or coherent group). Prefer vertical slices (e.g. one story end-to-end) over horizontal layers.
4. **AI as spec follower** — AI assists by implementing and verifying against the spec, not by inventing scope. When in doubt, ask or propose a spec change.
5. **Reversibility** — Prefer technology and structure that can be changed later without rewriting the spec.

---

## 3. Workflow: Spec → Build → Verify

### 3.1 Before Any Implementation

1. **Identify scope** — Choose a section of `spec.MD` (e.g. “5. Room Management” or “User Story 6.2 — Secret Voting”).
2. **List success criteria** — Copy the success criteria for the selected story/area. These become the checklist for the slice.
3. **Check dependencies** — Ensure any referenced roles, flows, or data (e.g. “Facilitator”, “Room”) are either already implemented or included in this slice.
4. **Confirm with MVP** — If the project defines an MVP (e.g. §11 in `spec.MD`), prioritize MVP items first.

### 3.2 During Implementation

1. **Implement to the spec** — Build only what is needed to satisfy the chosen success criteria. Avoid scope creep.
2. **Name and structure for traceability** — Use names that map to the spec (e.g. “reveal votes”, “secret voting”) in code, APIs, and tests.
3. **Test against success criteria** — For each criterion, ensure there is a way to demonstrate or automate verification (manual check, unit test, or E2E step).

### 3.3 After a Slice

1. **Verify** — Go through each success criterion and confirm it is met.
2. **Update spec if needed** — If you discovered missing or wrong behavior, propose an edit to `spec.MD` (and optionally to this file) rather than only documenting in code.
3. **Decide next slice** — Pick the next user story or area, respecting dependencies and MVP order.

---

## 4. AI Assistance Rules

When using an AI assistant to build from this spec:

### 4.1 Always

- **Cite the spec** — When implementing a feature, reference the section and user story (e.g. “Per User Story 6.2 — Secret Voting and its success criteria…”).
- **Respect success criteria** — Treat them as mandatory. Do not mark a story done until each criterion is satisfied.
- **Respect business rules** — Section 9 in `spec.MD` (and any equivalent) are hard constraints (e.g. “Votes must remain secret until reveal”).
- **Respect MVP** — When scope is unclear, implement in the order implied by the MVP section and avoid adding non-MVP features in the same slice.

### 4.2 When the Spec Is Unclear

- Implement the smallest reasonable interpretation that fits the rest of the spec.
- Add a short comment or doc note: “Spec ambiguity: …; implemented as ….”
- Optionally propose a one-line addition to `spec.MD` to remove the ambiguity for next time.

### 4.3 When Proposing New Features

- Do not add features that are not in the spec. Instead, propose a new user story or section for `spec.MD` and get alignment before implementing.

### 4.4 Suggestion for Prompts

When asking the AI to implement a slice, a good pattern is:

- “Implement [User Story X.Y — Title] from spec.MD. Satisfy all its success criteria. Do not add behavior beyond the spec. Tech stack: see quickstart.MD.”

---

## 5. Slice Ordering and Dependencies

Suggested implementation order (aligned with `spec.MD` and MVP):

1. **Room Management (create, join, close)** — Needed for any session.
2. **Estimation Process (add item, secret voting, reveal, re-vote)** — Core MVP.
3. **Session history (basic)** — MVP requirement.
4. **Account Management** — If auth is required for history or rooms.
5. **AI Assist** — After core flow is stable.
6. **Reporting / Export** — After history exists.

Adjust order only when technical constraints (e.g. auth, persistence) require it; document the reason in a short note.

---

## 6. Conventions and Constraints

- **Stack and repo** — Defined in **`quickstart.MD`**: React (web), Expo (mobile), monorepo, shared TypeScript, real-time (WebSockets), backend (Node + TypeScript). Keep the spec (`spec.MD`) stack-agnostic.
- **Current focus (until web app is complete)** — Develop **web app and server only**. No mobile implementation. Server uses in-memory / mocked data. Mobile tasks are deferred; resume after web MVP is stable.
- **Quality bar** — Code should be readable, and behavior covered by the success criteria should be verifiable (tests or explicit manual steps).
- **Accessibility and i18n** — If the spec mentions “usable via web browser” or diverse users, assume basic accessibility and consider text/labels ready for later i18n unless the spec says otherwise.
- **Security and privacy** — Align with business rules (e.g. votes secret until reveal). No credentials or secrets in the spec or in code; use env/config.

---

## 7. Updating the Spec and This Configuration

- **Spec changes** — Any change to scope, behavior, or success criteria goes into `spec.MD`. Keep user stories and success criteria in sync with the product.
- **Process changes** — Changes to workflow, AI rules, or slice order go into `configuration.MD`.
- **Versioning** — Optionally add a short “Last updated” or version line at the top of each file when making substantive edits.

---

## 8. Summary

| Step | Action |
|------|--------|
| 1 | Use `spec.MD` as the single source of truth for what to build. |
| 2 | Use `configuration.MD` (this file) to drive how to build it with AI. |
| 3 | Implement in small slices tied to user stories and their success criteria. |
| 4 | Verify each slice against those criteria before moving on. |
| 5 | Propose spec or config updates when you find gaps or better process. |

This configuration guides the entire spec-driven, AI-assisted design and build process for the product described in `spec.MD`.
