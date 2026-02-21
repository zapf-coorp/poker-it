# AI Planning Poker Web App
## Spec Driven Design - Functional & Business Specification

---

# 1. Product Vision

## 1.1 Purpose

Create a collaborative web-based Planning Poker application that allows teams to estimate tasks synchronously or asynchronously, with optional AI support to:

- Suggest estimates
- Detect discrepancies
- Assist facilitation
- Generate session summaries

The product must reduce alignment time, increase scope clarity, and improve estimation quality.

---

## 1.2 Problem Statement

Agile teams often face:

- Estimation bias caused by dominant participants
- Long and unstructured discussions
- Lack of structured record of decisions
- Remote facilitation difficulties
- Poor reuse of historical estimation data

---

## 1.3 Business Goals

- Allow a team to complete a full Planning Poker session without prior training.
- Reduce average estimation time per item.
- Provide intelligent assistance without replacing human judgment.
- Offer a free tier with basic limitations and a paid tier with advanced features.
- Be fully usable via web browser.

---

# 2. User Roles

## 2.1 Facilitator
Responsible for creating rooms, conducting sessions, and closing estimations. The facilitator can vote like participants; their vote is also secret until reveal.

## 2.2 Participant
Votes and contributes to discussions.

## 2.3 Observer (Optional)
Can watch the session without voting.

## 2.4 Participation Model

- **Facilitator** = the user who creates the room. No separate “promotion” is required.
- **MVP:** Rooms can be created with or without an account; a shareable link is always provided. Participants join with a display name only (no account required to vote). Session history is retained for the session; when accounts are implemented, history can be linked to the facilitator or participants as defined later.
- **Post-MVP:** Account may be required to create rooms or to persist history; spec will be updated when that scope is set.

---

# 3. Core Functional Areas

- Account Management
- Room Management
- Estimation Process
- AI Assistance
- History & Reporting

---

# 4. Account Management

## User Story 4.1 — Create Account

As a new user  
I want to create an account  
So that I can save my sessions and history  

### Success Criteria
- User can create an account by providing name, email, and password.
- System confirms successful creation with clear feedback.
- Authenticated users remain logged in until manual logout.

---

## User Story 4.2 — Login

As an existing user  
I want to log into my account  
So that I can access my rooms and history  

### Success Criteria
- Login fails with a clear message if credentials are incorrect.
- Successful login redirects to the main dashboard.

---

## User Story 4.3 — Logout

As an authenticated user  
I want to log out of my account  
So that my session is ended on this device  

### Success Criteria
- User can trigger logout from the application.
- After logout, user is treated as unauthenticated and cannot access protected resources without logging in again.

---

# 5. Room Management

## User Story 5.1 — Create Room

As a facilitator  
I want to create a Planning Poker room  
So that I can start an estimation session  

### Success Criteria
- System generates a unique room identifier.
- Facilitator can define:
  - Room name
  - Card deck type (e.g., Fibonacci)
- Room becomes accessible through a shareable link.
- Facilitator can easily copy and share the room link (e.g., one-click copy) without additional configuration.

### Supported Deck Types (MVP)

At least one deck must be available; recommended for MVP:

- **Fibonacci:** 0, 1, 2, 3, 5, 8, 13, 21, (optional: ? for uncertain, ☕ for break).
- **Linear (0–10):** 0 through 10.
- **T-shirt:** XS, S, M, L, XL (mapped to numbers for averaging where needed).

Other decks may be added later; the system must support configurable card sets per room.

### Card Descriptions (Optional)
- Decks may include optional descriptions per card value (e.g., "5 = small story", "8 = needs design").
- These descriptions are **hidden from participants** until the facilitator reveals votes.
- Before reveal, participants see only the card values (numbers or labels), not the descriptions.

---

## User Story 5.2 — Join Room

As a participant  
I want to join a room via link  
So that I can participate in the estimation  

### Success Criteria
- User must provide a name before entering.
- System displays list of active participants.
- User can view the current estimation item.
- Joining is low-friction: participants can enter directly from the shared link (or room code) without needing an account in the MVP.

---

## User Story 5.3 — Close Room

As a facilitator  
I want to close the session  
So that estimation is officially completed  

### Success Criteria
- After closing, no further votes can be cast.
- Session history remains available for viewing.

---

## User Story 5.4 — Leave Room

As a participant  
I want to leave the room  
So that I am no longer part of the session  

### Success Criteria
- Participant can leave the room at any time before it is closed.
- After leaving, the participant no longer appears in the participant list and cannot vote.
- Remaining participants see the updated list. Session and other votes are unaffected.

---

## User Story 5.5 — Join as Observer

As a user  
I want to join a room as an observer  
So that I can watch the session without voting  

### Success Criteria
- User can choose to join as observer (e.g. via link or toggle when joining).
- Observer sees the current estimation item and, after reveal, the votes and results.
- Observer does not see votes before reveal and cannot cast a vote.
- Observer appears in the participant list (or a separate observer list) so the facilitator knows who is present.

---

# 6. Estimation Process

## 6.0 Voting System & Usability

The estimation process follows a structured voting flow designed for clarity and fairness. The system must support synchronous and asynchronous participation while maintaining vote secrecy until reveal.

### Voting System
- Participants and the facilitator select a card value from the room's deck (e.g. Fibonacci, Linear, T-shirt).
- Votes are hidden until the facilitator reveals them.
- One item is estimated at a time; the facilitator controls progression.
- Re-voting is allowed after discussion to reach consensus.
- **Card descriptions:** If cards have optional descriptions (e.g., "5 = ~1 day", "8 = complex"), these are not shown to participants until the facilitator reveals votes. Before reveal, participants see only the card values.

### Usability Principles
- **Clarity:** Current item, voting status, and participant count are always visible.
- **Low friction:** Vote selection is quick (e.g. single click/tap); participants can change their vote before reveal.
- **Feedback:** System confirms vote submission; shows "X of Y have voted" without revealing values.
- **Consistency:** Card deck and interaction patterns are consistent across the session.
- **Accessibility:** Voting controls are keyboard-navigable and have sufficient contrast.

---

## User Story 6.1 — Add Estimation Item

As a facilitator  
I want to add an item with title and description  
So that the team can estimate it  

### Success Criteria
- Item appears immediately to all participants.
- Item can be edited before voting starts.
- Item can be removed if necessary.

---

## User Story 6.2 — Secret Voting

As a participant or facilitator  
I want to select a card  
So that I can register my estimate  

### Success Criteria
- Votes remain hidden until revealed.
- Facilitator can vote like participants; their vote is secret until reveal.
- Participants and facilitator can change their vote before reveal.
- System shows how many participants have voted without revealing values.
- Card descriptions (if any) are not shown to participants before reveal; only card values are visible for voting.

---

## User Story 6.3 — Reveal Votes

As a facilitator  
I want to reveal all votes simultaneously  
So that participants are not influenced prematurely  

### Success Criteria
- All votes are displayed at the same time.
- Card descriptions (if any) become visible to all after reveal.
- System highlights highest and lowest estimates.
- System calculates average and median values.

---

## User Story 6.4 — Re-vote

As a facilitator  
I want to restart voting  
So that a new round can occur after discussion  

### Success Criteria
- Previous votes remain recorded in session history.
- New round starts with cleared votes.

---

## User Story 6.5 — Record Final Estimate

As a facilitator  
I want to set the official final estimate for the current item  
So that the session has a clear, recorded decision  

### Success Criteria
- After votes are revealed, facilitator can record the final estimate (e.g. by selecting a value or confirming a suggested value).
- The recorded value is the single official estimate for that item (per business rules).
- Item is then marked as estimated; facilitator can add the next item or close the room.
- If re-vote occurs, final estimate is only recorded after a subsequent reveal (or when facilitator explicitly sets it).


## User Story 6.6 — Post-Reveal Statistics

As a participant or facilitator  
I want to see statistics after votes are revealed  
So that I can understand the distribution of votes and the suggested estimate  

### Success Criteria
- After revealing votes for an item, the system displays:
  - **Average value** (valor médio) of all votes.
  - **Suggested estimate** rounded up or down based on the average (e.g. if average is 7.2, suggest 7; if 7.8, suggest 8).
  - **Vote distribution**: how many people voted for each value (e.g. "3 voted 5, 2 voted 8, 1 voted 13").

---

# 7. AI Assist

## User Story 7.1 — Discrepancy Analysis

As a facilitator  
I want AI to detect significant voting discrepancies  
So that I can guide the discussion  

### Success Criteria
- AI identifies meaningful variation between votes.
- AI suggests possible causes (complexity, ambiguity, risk).
- AI output is presented as recommendation, not decision.

---

## User Story 7.2 — Session Summary

As a facilitator  
I want to generate a summary of the round  
So that decisions are documented  

### Success Criteria
- System generates summary including item details, votes, and final estimate.
- Summary can be exported as structured text.
- Summary includes discussion justifications if provided.

---

# 8. History & Reporting

## User Story 8.1 — Session History

As an authenticated user  
I want to access past sessions  
So that I can review previous decisions  

### Success Criteria
- History displays:
  - Room name
  - Date
  - Item list
  - Final estimates
- User can open detailed session view.

---

## User Story 8.2 — Export Results

As a facilitator  
I want to export session results  
So that I can integrate with external tools  

### Success Criteria
- Export includes:
  - Item name
  - Final estimate
  - Date
  - Participants
- Exported format is structured and readable.

---

# 9. Business Rules

- Votes must remain secret until reveal.
- Only facilitator can reveal votes or restart a round.
- AI never replaces final human decision.
- Final estimate must be explicitly recorded.
- Each item must have exactly one official final estimate.

---

# 10. Success Metrics

- Reduced average time per estimation compared to manual process.
- High completion rate of initiated sessions.
- Recurring usage by teams.
- Active usage of AI features.
- Positive feedback regarding clarity and usefulness of AI suggestions.

---

# 11. MVP Scope

The Minimum Viable Product must include:

- Room creation (with room name and at least one deck type)
- Join room (with display name)
- Add estimation item
- Secret voting
- Vote reveal
- Record final estimate per item
- Re-voting
- Basic session history (viewable for the session)
- Leave room (participant)

Optional for MVP (include if low effort): Join as observer. Account management (create account, login, logout) and persistent history across sessions can follow after core flow is stable.

---

# 12. Non-Functional Requirements

- **Browser support:** Usable in the latest two major versions of Chrome, Firefox, Safari, and Edge (desktop). Mobile browser support is desirable but may be limited in MVP.
- **Reconnection:** If a participant refreshes or loses connection, they can rejoin the same room with the same display name; their previous vote in the current round may be cleared (implementation choice). Session and room state should recover where feasible.
- **Performance:** Room and vote updates should appear to all participants within a few seconds; no hard SLA for MVP.
- **Accessibility:** Basic keyboard navigation and readable contrast so the app is usable without mouse-only interaction. Screen-reader support is a goal for post-MVP.

---

# 13. Out of Scope / Future

Explicitly **not** in MVP unless added later via spec change:

- Video or voice chat; third-party integrations (e.g. Jira, Linear); multiple simultaneous rooms per user; custom card decks (beyond the supported types); password reset / forgot password; email verification; roles beyond facilitator / participant / observer; offline mode; native mobile apps.

These may be introduced in later versions with updated user stories and success criteria.

---

# 14. Glossary

| Term | Definition |
|------|------------|
| **Room** | A single estimation session. Has a unique ID, name, deck type, creator (facilitator), and state (open/closed). |
| **Item** | A single work item (e.g. user story, task) being estimated. Has title, description, and exactly one final estimate once recorded. |
| **Round** | One voting cycle for one item: participants and facilitator vote in secret, then votes are revealed, then facilitator records the final estimate. A re-vote starts a new round for the same item. |
| **Final estimate** | The official value recorded for an item after discussion; used in history and export. |
| **Deck** | The set of allowed vote values (e.g. Fibonacci numbers) chosen when the room is created. May include optional descriptions per card; descriptions are hidden from participants until reveal. |

