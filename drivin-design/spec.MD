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

*See §15.1 — UC-4.2 for detailed use case.*

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

---

# 15. Detailed Use Cases

This section provides fully detailed use cases for all functional flows, with emphasis on:

- **Fluid usability:** Clear feedback, no ambiguous states, predictable navigation.
- **Security:** Input validation, safe error messages, session handling.
- **Dead-end prevention:** Users are never left in unrecoverable states (e.g., room closed without notice).
- **Error handling:** Graceful degradation, retry paths, and recovery options.

---

## 15.1 Account Management

### Use Case UC-4.1 — Create Account

| Attribute | Description |
|-----------|-------------|
| **Use Case** | Create Account |
| **Actor** | New user |
| **Preconditions** | User is not authenticated. Registration is available. |
| **Postconditions (success)** | Account created. User is authenticated. Redirected to dashboard. |
| **Postconditions (failure)** | No account created. User remains on registration page with clear feedback. |

**Main Flow**

1. User navigates to the registration page.
2. User enters name (required).
3. User enters email (required).
4. User enters password (required).
5. User enters password confirmation (required).
6. User submits the form.
7. System validates all fields (format, strength, match).
8. System checks that email is not already registered.
9. System creates the account.
10. System establishes an authenticated session.
11. System displays success message (e.g., "Account created successfully").
12. System redirects user to the main dashboard.

**Alternative Flow — Validation Errors (7a)**

7a. One or more fields fail validation.
7a1. System displays inline validation messages next to each invalid field.
7a2. System does not submit; user corrects and retries.
7a3. Password strength requirements (if any) are shown before submission.

**Alternative Flow — Email Already Registered (8a)**

8a. Email is already associated with an account.
8a1. System displays a clear message: "An account with this email already exists."
8a2. System offers link to login page.
8a3. User remains on registration page; no account is created.

**Alternative Flow — Password Mismatch (7a)**

7a. Password and confirmation do not match.
7a1. System displays message: "Passwords do not match."
7a2. User corrects and retries.

**Error Handling**

- Network failure: Display "Unable to connect. Please check your connection and try again." with retry option.
- Server error: Display generic message; do not expose internal details. Offer retry.

---

### Use Case UC-4.2 — Login (Username, Password)

| Attribute | Description |
|-----------|-------------|
| **Use Case** | Login |
| **Actor** | User (existing account holder) |
| **Preconditions** | User has a registered account. User is not already authenticated. |
| **Postconditions (success)** | User is authenticated. Session is established. Redirected to main dashboard. |
| **Postconditions (failure)** | User remains unauthenticated. Error message displayed. |

**Main Flow**

1. User navigates to the login page.
2. User enters username (or email, per system design).
3. User enters password.
4. User submits the login form.
5. System validates that both fields are non-empty.
6. System validates credentials against stored data (constant-time comparison for password).
7. System establishes an authenticated session.
8. System redirects user to the main dashboard (or to the URL user was trying to access, if any).

**Alternative Flow — Invalid Credentials (6a)**

6a. Username and/or password are incorrect.
6a1. System displays a generic message: "Invalid username or password." (Do not reveal which field is wrong.)
6a2. User remains on the login page and may retry.
6a3. Use case ends without authentication.

**Alternative Flow — Empty Fields (5a)**

5a. User submits without entering username or password.
5a1. System displays inline validation: "Username is required" / "Password is required."
5a2. User remains on the login page.

**Alternative Flow — Already Authenticated (1a)**

1a. User navigates to login while already authenticated.
1a1. System redirects to dashboard (or home). No login form shown.

**Error Handling**

- Rate limiting: After N failed attempts, display "Too many attempts. Please try again in X minutes." with countdown.
- Session expiry: If session expired during form fill, redirect to login with message "Your session expired. Please log in again."

---

### Use Case UC-4.3 — Logout

| Attribute | Description |
|-----------|-------------|
| **Use Case** | Logout |
| **Actor** | Authenticated user |
| **Preconditions** | User is authenticated. |
| **Postconditions** | Session invalidated. User treated as unauthenticated. Redirected to public landing/home. |

**Main Flow**

1. User triggers logout (e.g., via menu, header button, or settings).
2. System invalidates the session server-side.
3. System clears any client-side session storage.
4. System displays brief confirmation (e.g., "You have been logged out").
5. System redirects user to the public landing page or home.

**Alternative Flow — User in Active Room (1a)**

1a. User is in an active room when logging out.
1a1. System may show confirmation: "You will leave the room. Continue?"
1a2. On confirm, proceed with main flow.
1a3. Other participants see user removed from participant list.

**Error Handling**

- Logout fails (e.g., network): Clear client state anyway; user appears logged out. Server will reject protected requests.

---

## 15.2 Room Management

### Use Case UC-5.1 — Create Room

| Attribute | Description |
|-----------|-------------|
| **Use Case** | Create Room |
| **Actor** | Facilitator (user creating the room) |
| **Preconditions** | User has access to room creation (MVP: no account required; Post-MVP: may require account). |
| **Postconditions (success)** | Room exists with unique ID. Shareable link available. Facilitator is in the room. |

**Main Flow**

1. User navigates to "Create Room" or equivalent entry point.
2. User enters room name (required).
3. User selects card deck type (required; default: Fibonacci).
4. User submits the form.
5. System validates inputs.
6. System generates a unique room identifier.
7. System creates the room and sets user as facilitator.
8. System displays the room view with shareable link prominently shown.
9. System offers one-click copy of the room link.
10. Facilitator can share the link and add the first estimation item.

**Alternative Flow — Validation Errors (5a)**

5a. Room name is empty or exceeds max length.
5a1. System displays inline validation.
5a2. User corrects and retries.

**Alternative Flow — Duplicate Room Name (6a)**

6a. Room name may duplicate another (if names are unique per user).
6a1. System allows it; room ID is unique. No conflict.

**Error Handling**

- Creation fails: Display "Unable to create room. Please try again." with retry. Do not leave user on a broken form state.

---

### Use Case UC-5.2 — Join Room

| Attribute | Description |
|-----------|-------------|
| **Use Case** | Join Room |
| **Actor** | Participant (or user intending to participate) |
| **Preconditions** | User has a valid room link or room code. Room exists and is open. |
| **Postconditions (success)** | User is in the room as participant. Sees current item and participant list. Can vote. |

**Main Flow**

1. User opens room link (or enters room code on join page).
2. System validates room exists and is open.
3. System displays join form requesting display name.
4. User enters display name (required).
5. User submits.
6. System validates name (non-empty, within length limits).
7. System checks name is not already in use in the room (or allows duplicates with disambiguation).
8. System adds user to the room as participant.
9. System displays the room view with current item, participant list, and voting controls.
10. User can vote and interact.

**Alternative Flow — Room Closed (2a)**

2a. Room is closed.
2a1. System does not show join form.
2a2. System displays: "This session has ended." with optional link to view read-only summary (if available).
2a3. User is not left in a dead end; clear path to exit or view results.

**Alternative Flow — Room Not Found / Invalid Link (2a)**

2a. Room ID is invalid or room was deleted.
2a1. System displays: "Room not found. Please check the link and try again."
2a2. System offers link to create a new room or go home.

**Alternative Flow — Display Name Already in Use (7a)**

7a. Another participant has the same display name.
7a1. System displays: "This name is already in use. Please choose another."
7a2. User enters a different name and retries.

**Alternative Flow — Empty or Invalid Name (6a)**

6a. Display name is empty or invalid.
6a1. System displays inline validation.
6a2. User corrects and retries.

**Error Handling**

- Connection lost during join: Display "Connection lost. Please try again." with retry. Preserve entered name if possible.

---

### Use Case UC-5.3 — Close Room

| Attribute | Description |
|-----------|-------------|
| **Use Case** | Close Room |
| **Actor** | Facilitator |
| **Preconditions** | Facilitator is in an open room. Facilitator has permission to close. |
| **Postconditions** | Room is closed. No further votes. All participants and observers are notified and transitioned appropriately. |

**Main Flow**

1. Facilitator triggers "Close Room" (or "End Session").
2. System may show confirmation: "Close this session? No further votes can be cast."
3. Facilitator confirms.
4. System marks room as closed.
5. System broadcasts room-closed event to all connected participants and observers.
6. System updates each participant's and observer's view in real time.
7. Each participant/observer sees: "This session has ended." with session summary (items, final estimates).
8. System provides clear exit path: "Return to Home" or "Create New Room" (and "View Session History" if applicable).
9. Facilitator sees the same summary and exit options.
10. No user remains in an active voting view for a closed room.

**Alternative Flow — Unrecorded Items (4a)**

4a. There are items with revealed votes but no final estimate recorded.
4a1. System may warn: "X item(s) have no final estimate. Close anyway?" or require recording first (product decision).
4a2. If closed without recording, those items are marked as "No estimate" in history.

**Dead-End Prevention (Critical)**

- **Real-time notification:** All clients must receive room-closed event within seconds (WebSocket/polling).
- **Immediate UI update:** Voting controls are disabled or hidden. Message "Session ended" is prominent.
- **Clear next steps:** Buttons for "Return to Home" and "View Summary" are always visible.
- **No orphaned state:** Users who were in the room never remain in a "still voting" or "waiting" state without knowing the session ended.

---

### Use Case UC-5.4 — Leave Room

| Attribute | Description |
|-----------|-------------|
| **Use Case** | Leave Room |
| **Actor** | Participant or Observer |
| **Preconditions** | User is in a room (as participant or observer). |
| **Postconditions** | User is removed from room. Remaining participants see updated list. User has clear destination. |

**Main Flow**

1. User triggers "Leave Room" (or equivalent).
2. System may show confirmation: "Leave this session?" (optional for low friction).
3. User confirms (or no confirmation if product prefers).
4. System removes user from the room.
5. System broadcasts participant-left to remaining users.
6. System redirects user to a clear destination: home page, "Create Room," or "Join Room" — never to a blank or broken view.
7. Remaining participants see updated participant list.
8. If user had voted in current round, their vote is removed; "X of Y have voted" updates.

**Alternative Flow — Facilitator Leaves (4a)**

4a. The facilitator leaves without closing the room.
4a1. Product decision: (A) Facilitator cannot leave without closing, or (B) Room is auto-closed when facilitator leaves, or (C) Another participant is promoted. Spec currently implies facilitator creates room; recommend (B) for MVP: closing room when facilitator leaves, with same notification flow as Close Room.

**Error Handling**

- User already disconnected: Server removes stale connections periodically; no dead end for others.

---

### Use Case UC-5.5 — Join as Observer

| Attribute | Description |
|-----------|-------------|
| **Use Case** | Join as Observer |
| **Actor** | User |
| **Preconditions** | User has valid room link. Room exists and is open. |
| **Postconditions** | User is in the room as observer. Sees items and results after reveal. Cannot vote. |

**Main Flow**

1. User opens room link.
2. System displays join form with role choice: "Participant" or "Observer."
3. User selects "Observer."
4. User enters display name.
5. User submits.
6. System validates and adds user as observer.
7. System displays room view: current item, participant list, observer list (or combined). No voting controls for observer.
8. Observer sees votes and statistics only after facilitator reveals.
9. Observer receives same room-closed notification and summary as participants.

**Alternative Flows**

- Same as Join Room for: room closed, room not found, name in use, validation errors.
- Observer cannot accidentally access voting controls; UI clearly differentiates observer view.

---

## 15.3 Cross-Cutting: Room Closed While User Is Present

| Attribute | Description |
|-----------|-------------|
| **Use Case** | Handle Room Closed by Host (Real-Time) |
| **Actor** | Participant, Observer |
| **Trigger** | Facilitator closes the room. |
| **Preconditions** | User is connected to the room and viewing the session. |
| **Postconditions** | User is informed. User sees summary. User has clear exit path. No dead end. |

**Main Flow (User Perspective)**

1. User is in the room (voting, viewing, or waiting).
2. Facilitator closes the room.
3. Within a few seconds, user's client receives room-closed event.
4. System immediately updates the UI:
   - Removes or disables voting controls.
   - Displays prominent message: "This session has ended."
   - Shows session summary (items, final estimates, participants).
5. System displays actions: "Return to Home" | "Create New Room" | "View Full History" (if applicable).
6. User chooses an action and navigates away. No user remains "stuck" in the room.

**Failure Modes & Mitigations**

| Failure | Mitigation |
|---------|------------|
| User's connection dropped before event | On reconnect, client fetches room state; sees "closed"; shows same summary and exit options. |
| WebSocket/push unavailable | Polling fallback: client periodically checks room state; detects closed; updates UI. |
| User refreshes after close | Page load fetches room state; if closed, show summary view directly, not voting view. |
| Long delay in receiving event | Timeout: if no room updates for N minutes, prompt "Session may have ended. Check connection?" with refresh option. |

**Design Rule**

- **Never** leave a user in a room view with active-looking UI when the room is actually closed. Always sync state and provide exit.

---

## 15.4 Estimation Process

### Use Case UC-6.1 — Add Estimation Item

| Attribute | Description |
|-----------|-------------|
| **Use Case** | Add Estimation Item |
| **Actor** | Facilitator |
| **Preconditions** | Facilitator is in an open room. |
| **Postconditions** | New item is visible to all. Item can be edited or removed before voting. |

**Main Flow**

1. Facilitator triggers "Add Item."
2. System displays form: title (required), description (optional).
3. Facilitator enters title and optionally description.
4. Facilitator submits.
5. System validates (title non-empty, within length).
6. System adds item to the room.
7. System broadcasts to all participants; item appears immediately.
8. Item is the current item if it is the first, or queued. Facilitator can edit or remove before voting starts.

**Alternative Flow — Empty Title (5a)**

5a. Title is empty.
5a1. System displays validation. Form remains open.
5a2. Facilitator corrects and retries.

**Alternative Flow — Edit Item (before voting)**

- Facilitator selects "Edit" on an item that has no votes yet.
- System allows editing title/description. Changes broadcast to all.

**Alternative Flow — Remove Item**

- Facilitator selects "Remove" on an item with no votes (or no final estimate).
- System confirms. Item is removed. All clients update.

**Error Handling**

- Add fails: Display "Could not add item. Try again." with retry. Form data preserved.

---

### Use Case UC-6.2 — Secret Voting

| Attribute | Description |
|-----------|-------------|
| **Use Case** | Secret Voting |
| **Actor** | Participant, Facilitator |
| **Preconditions** | User is in room. Current item exists. Voting is open (not revealed). |
| **Postconditions** | Vote is recorded. Vote is hidden from others. "X of Y have voted" updates. |

**Main Flow**

1. Current item is displayed. Voting controls (card deck) are visible.
2. User selects a card value.
3. System records the vote (without revealing to others).
4. System shows confirmation to user (e.g., checkmark, "Vote submitted").
5. System updates "X of Y have voted" for all users.
6. User may change vote before reveal by selecting another card.
7. System replaces previous vote with new one.

**Alternative Flow — Change Vote (6–7)**

- User selects different card. System updates. No reveal of previous choice to others.

**Alternative Flow — No Current Item (1a)**

1a. Facilitator has not added an item yet.
1a1. Participants see "Waiting for facilitator to add an item." No voting controls.
1a2. No dead end; state is clear.

**Alternative Flow — Connection Lost During Vote (3a)**

3a. User's connection drops after selecting but before confirm.
3a1. On reconnect, user may need to vote again (vote may not have been persisted).
3a2. System shows "Reconnected. Please submit your vote again if needed." if vote was lost.

**Error Handling**

- Vote fails: Display brief message. Allow retry. Do not reveal vote to others.

---

### Use Case UC-6.3 — Reveal Votes

| Attribute | Description |
|-----------|-------------|
| **Use Case** | Reveal Votes |
| **Actor** | Facilitator |
| **Preconditions** | Facilitator is in room. Current item exists. Voting is open. |
| **Postconditions** | All votes visible. Statistics shown. Facilitator can record final estimate. |

**Main Flow**

1. Facilitator triggers "Reveal Votes."
2. System reveals all votes simultaneously to all participants and facilitator.
3. System displays: each vote, average, median, highest, lowest, vote distribution.
4. Card descriptions (if any) become visible.
5. Facilitator can now record the final estimate.

**Alternative Flow — No Votes Yet (2a)**

2a. No one has voted.
2a1. System may allow reveal (showing "No votes") or prompt "No votes yet. Wait for participants?" — product decision.
2a2. Facilitator can still record "No estimate" or trigger re-vote.

**Alternative Flow — Partial Votes (2)**

- System reveals whatever votes exist. Missing votes shown as "Did not vote" or similar. Facilitator decides whether to wait or proceed.

---

### Use Case UC-6.4 — Re-vote

| Attribute | Description |
|-----------|-------------|
| **Use Case** | Re-vote |
| **Actor** | Facilitator |
| **Preconditions** | Votes have been revealed for current item. |
| **Postconditions** | Previous round recorded in history. New round started. Votes cleared. |

**Main Flow**

1. Facilitator triggers "Re-vote" (or "New Round").
2. System stores previous round in session history.
3. System clears current votes.
4. System resets voting state for the same item.
5. All participants see voting controls again. "X of Y have voted" resets.
6. Participants and facilitator vote again.
7. Facilitator reveals when ready.

---

### Use Case UC-6.5 — Record Final Estimate

| Attribute | Description |
|-----------|-------------|
| **Use Case** | Record Final Estimate |
| **Actor** | Facilitator |
| **Preconditions** | Votes have been revealed for current item. |
| **Postconditions** | Item has one official final estimate. Item marked as estimated. Facilitator can add next item or close room. |

**Main Flow**

1. After reveal, facilitator selects or confirms the final estimate (e.g., from suggested value or manual choice).
2. Facilitator triggers "Record" or "Confirm."
3. System records the final estimate for the item.
4. System marks item as estimated.
5. System displays next steps: "Add Next Item" | "Close Room" | "Re-vote" (if applicable).
6. Facilitator adds next item or closes.

**Alternative Flow — Re-vote Before Recording**

- If facilitator triggers re-vote, final estimate is not recorded until a subsequent reveal and explicit record.

---

## 15.5 AI Assist

### Use Case UC-7.1 — Discrepancy Analysis

| Attribute | Description |
|-----------|-------------|
| **Use Case** | Discrepancy Analysis |
| **Actor** | Facilitator |
| **Preconditions** | Votes have been revealed. AI feature is available. |
| **Postconditions** | AI output shown as recommendation. Facilitator retains final decision. |

**Main Flow**

1. After reveal, facilitator triggers "Analyze" or similar.
2. System sends vote data to AI (no PII).
3. System displays loading state: "Analyzing..."
4. AI returns analysis (variation, possible causes).
5. System displays analysis as recommendation, clearly labeled "AI suggestion — you decide."
6. Facilitator uses or ignores; records final estimate as in UC-6.5.

**Error Handling**

- AI unavailable: "Analysis unavailable. You can still record the final estimate."
- Timeout: Same message. No blocking of core flow.

---

### Use Case UC-7.2 — Session Summary

| Attribute | Description |
|-----------|-------------|
| **Use Case** | Session Summary |
| **Actor** | Facilitator |
| **Preconditions** | Session has items (and optionally final estimates). |
| **Postconditions** | Summary generated. Can be exported. |

**Main Flow**

1. Facilitator triggers "Generate Summary."
2. System compiles: items, votes, final estimates, participants, date.
3. System displays summary in structured text.
4. Facilitator can copy or export (e.g., plain text, JSON).
5. Export downloads file or copies to clipboard.

**Error Handling**

- Generation fails: "Could not generate summary. Try again." No data loss.

---

## 15.6 History & Reporting

### Use Case UC-8.1 — Session History

| Attribute | Description |
|-----------|-------------|
| **Use Case** | Session History |
| **Actor** | Authenticated user |
| **Preconditions** | User is authenticated. History feature is available. |
| **Postconditions** | User sees list of past sessions. Can open details. |

**Main Flow**

1. User navigates to "History" or "My Sessions."
2. System fetches user's session history.
3. System displays list: room name, date, item count, final estimates summary.
4. User selects a session.
5. System displays detailed view: items, final estimates, participants.
6. User can navigate back to list or home.

**Alternative Flow — Empty History**

- No sessions: Display "No sessions yet. Create a room to get started." with link to create room.

**Error Handling**

- Load fails: "Could not load history. Try again." with retry.

---

### Use Case UC-8.2 — Export Results

| Attribute | Description |
|-----------|-------------|
| **Use Case** | Export Results |
| **Actor** | Facilitator |
| **Preconditions** | Session has data to export. |
| **Postconditions** | File downloaded or clipboard updated. |

**Main Flow**

1. Facilitator triggers "Export" (from session summary or history detail).
2. System offers format (e.g., JSON, CSV, plain text).
3. Facilitator selects format.
4. System generates export with: item name, final estimate, date, participants.
5. System triggers download or copy.
6. Facilitator receives file or confirmation.

**Error Handling**

- Export fails: "Export failed. Try again." Preserve session data.

---

## 15.7 Reconnection & Recovery

| Attribute | Description |
|-----------|-------------|
| **Use Case** | Reconnect After Connection Loss |
| **Actor** | Participant, Facilitator, Observer |
| **Trigger** | User refreshes page, loses network, or reopens tab. |
| **Preconditions** | User was in a room. Room may still be open or may be closed. |
| **Postconditions** | User sees current room state. No orphaned or inconsistent view. |

**Main Flow**

1. User reconnects (refresh, network restore, tab focus).
2. Client attempts to rejoin with same display name and room ID.
3. System validates: room exists, name available (or same user rejoining).
4. If room is open: User re-enters room. Current item, participant list, and voting state are restored. User may need to re-submit vote if it was lost.
5. If room is closed: User sees "Session ended" and summary. Clear exit options.
6. System never shows stale "voting in progress" for a closed room.

**Design Rules**

- Always fetch current room state on (re)connect. Do not rely only on cached state.
- If vote was lost, allow easy re-vote. Do not block user.
- Show "Reconnected" or "You're back" feedback so user knows state is fresh.

