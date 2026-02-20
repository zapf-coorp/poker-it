# UI Definition — Planning Poker

This document defines **UI/UX rules**, **themes**, **breakpoints**, **components**, and **screen-by-screen layouts** for the Planning Poker app. It supports `.spec.MD` (product spec), `configuration.MD` (workflow), and `quickstart.MD` (stack). Implementation must be **mobile-first**, then scale to tablet, small desktop, and large desktop, with **finger-friendly** touch on small devices and **mouse/keyboard-friendly** on larger ones. **Light and dark mode** are required.

---

## 1. Design Principles

1. **Mobile-first** — Layout and interaction are designed for the smallest viewport first; then enhanced for larger screens (progressive enhancement).
2. **Touch-first, pointer-friendly** — Primary interaction on mobile/tablet is touch (finger action space); on desktop, all actions must also work with mouse and keyboard (focus, Enter/Space, Tab order).
3. **Clarity over density** — One primary task per screen where possible; avoid crowding; use clear hierarchy (heading → body → actions).
4. **Consistent feedback** — Every user action has visible feedback (loading, success, error). Buttons show pressed/disabled states; forms show validation state.
5. **Accessible by default** — Sufficient color contrast (WCAG 2.1 AA for text and UI components); focus indicators; semantic HTML / accessible components; no information by color alone.
6. **Theme-aware** — Full support for a **clear (light)** and a **dark** mode; system preference respected when applicable; user can override.

---

## 2. Good UI Techniques (Mandatory)

- **Touch targets** — Minimum 44×44 px (dp) for interactive elements on touch devices (mobile, tablet). Extra padding is acceptable to meet this.
- **Spacing** — Consistent spacing scale (e.g. 4, 8, 12, 16, 24, 32, 48 px). Use margins/padding to separate sections and avoid accidental taps.
- **Typography** — Clear hierarchy: one primary heading per screen (e.g. 1.25–1.5 rem), body text readable (min ~1 rem, line-height 1.4–1.5). Prefer system fonts or a single custom font family for performance.
- **Color and contrast** — Text and interactive elements meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text and UI). In dark mode, avoid pure black/white; use softened backgrounds and foregrounds.
- **Focus visibility** — Visible focus ring (e.g. 2 px outline or box-shadow) on keyboard focus; never remove focus outline without a replacement.
- **Loading and errors** — Loading states for async actions (spinner or skeleton). Inline error messages near the relevant field; critical errors at top of view with option to dismiss.
- **Confirmation for destructive actions** — “Close room”, “Leave room”, “Remove item” use explicit confirmation (e.g. confirm dialog or inline “Are you sure?”) before executing.
- **Reduced motion** — Respect `prefers-reduced-motion`; avoid non-essential animations; keep transitions short (e.g. 150–250 ms) when used.

---

## 3. Breakpoints and Viewports

Layout and layout-specific behavior are defined per breakpoint. **Mobile is the default** (no media query); larger breakpoints add or rearrange.

| Breakpoint | Min width | Target | Primary input |
|------------|-----------|--------|----------------|
| **Mobile** | 0 | Phones (portrait/landscape) | Touch (finger) |
| **Tablet** | 600 px | Tablets, large phones landscape | Touch (finger) |
| **Small desktop** | 900 px | Small laptops, windows | Mouse + keyboard |
| **Large desktop** | 1200 px | Large monitors | Mouse + keyboard |

- **Mobile (default):** Single column; bottom or inline primary actions; cards full-width with safe padding (e.g. 16 px). Navigation: single level (back, or tab bar if multiple top-level screens).
- **Tablet:** Can use two columns where it helps (e.g. list + detail, or sidebar + main). Touch targets still ≥ 44 px.
- **Small desktop:** Sidebar optional; more content per row; hover states; keyboard shortcuts can be shown (e.g. in tooltips).
- **Large desktop:** Max content width (e.g. 960–1200 px) centered to avoid overly long lines; sidebars and panels fixed or resizable as needed.

---

## 4. Input Modes: Touch vs Mouse and Keyboard

### 4.1 Finger action space (mobile, tablet)

- **Primary actions** (e.g. “Create room”, “Vote”, “Reveal”) in easy thumb reach: bottom of viewport or clearly above the fold. Minimum tap target 44×44 px.
- **Card selection** (voting): Cards large enough to tap reliably; spacing between cards so the wrong card is not selected.
- **Lists** (participants, items): List items at least 44 px tall; swipe or long-press for secondary actions only if needed; prefer explicit buttons for primary actions.
- **No hover-dependent info** — All important information and actions available without hover. Use tap/click to reveal if necessary.

### 4.2 Mouse and keyboard (small and large desktop)

- **Hover** — Optional hover states for buttons and cards (e.g. background change); not required for correctness.
- **Keyboard** — All interactive elements focusable in a logical order (Tab); primary actions activatable with Enter or Space; Escape closes modals or cancels.
- **Shortcuts** (optional for MVP) — Document in UI or tooltips if implemented (e.g. “Reveal votes”, “Next item”).

---

## 5. Color Palette — Poker Theme

The palette is inspired by **poker and casino aesthetics**: green felt tables, gold chips, red and black accents from playing cards, and warm cream tones. All colors meet WCAG 2.1 AA where contrast is required.

### 5.1 Inspiration

- **Casino green** — Traditional felt table color; promotes focus, calm, and concentration; associated with luck and money.
- **Gold / amber** — Chips, luxury, success; used for secondary accents and highlights.
- **Red and black** — Playing card suits; red for action and urgency; black for structure and depth.
- **Cream / warm neutrals** — Soft, felt-adjacent backgrounds; avoids harsh white.

### 5.2 Palette tokens

| Token | Hex | Usage |
|-------|-----|--------|
| **Felt green** | `#0d6b0d` | Primary (buttons, links, badges); dark enough for white text (WCAG AA). |
| **Felt green dark** | `#0a4d0a` | Primary hover/pressed; darker variant for dark mode. |
| **Felt green light** | `#1a8c1a` | Primary accent on dark backgrounds. |
| **Gold** | `#c9a227` | Secondary accent; success, highlights, chips. |
| **Gold light** | `#e6c04a` | Gold on dark backgrounds. |
| **Card red** | `#b91c1c` | Destructive actions; error; card-suit accent. |
| **Card red light** | `#dc2626` | Red on dark backgrounds. |
| **Card black** | `#1a1a1a` | Text, borders; card-suit accent. |
| **Cream** | `#f5f0e8` | Light mode background (warm off-white). |
| **Cream surface** | `#faf8f5` | Light mode cards (slightly lighter). |
| **Dark felt** | `#0d2d0d` | Dark mode background (deep green-black). |
| **Dark felt surface** | `#143d14` | Dark mode cards (slightly lighter). |

### 5.3 Themes: Clear (Light) and Dark Mode

Two themes are **required**: **Clear (light)** and **Dark**.

### 5.4 Semantic tokens (implementation)

| Role | Clear (light) | Dark |
|------|----------------|------|
| **Background (page)** | `#f5f0e8` (cream) | `#0d2d0d` (dark felt) |
| **Surface (card, panel)** | `#faf8f5` (cream surface) | `#143d14` (dark felt surface) |
| **Text (primary)** | `#1a1a1a` (card black) | `#e8e8e8` |
| **Text (secondary)** | `#555` | `#a8a8a8` |
| **Border / divider** | `#e0d9cf` | `#1a4d1a` |
| **Primary (brand)** | `#0d6b0d` (felt green) | `#1a8c1a` (felt green light) |
| **Primary text on primary** | `#ffffff` | `#ffffff` |
| **Secondary accent** | `#c9a227` (gold) | `#e6c04a` (gold light) |
| **Success** | `#0d6b0d` or `#16a34a` | `#1a8c1a` |
| **Error / destructive** | `#b91c1c` (card red) | `#dc2626` (card red light) |
| **Focus ring** | `2px solid #0d6b0d` | `2px solid #1a8c1a` |

- **Contrast:** All text and interactive elements meet WCAG 2.1 AA in both themes.
- **System preference:** If the app supports it, default to `prefers-color-scheme` and allow manual override (e.g. toggle in header or settings).

---

## 6. Component System

Reusable building blocks; use consistently across screens.

### 6.1 Buttons

- **Primary** — Filled with primary color; for the main action on the screen (e.g. “Create room”, “Reveal votes”). Min height 44 px on touch targets.
- **Secondary** — Outline or ghost; for secondary actions (e.g. “Cancel”, “Back”).
- **Destructive** — For dangerous actions (e.g. “Close room”, “Leave room”); use error color; pair with confirmation.
- **Disabled** — Reduced opacity and not interactive; clear visual difference from enabled.

### 6.2 Cards

- **Surface** — Rounded corners (e.g. 8–12 px), subtle shadow (light) or border (dark). Used for: room card, estimation item, participant list container.
- **Voting card** — Poker-inspired: surface color with subtle border; selected state uses primary (felt green) border or background tint; value (number or symbol) centered, large and readable.
- **Content:** Title (optional), body, optional footer with actions. Padding consistent (e.g. 16 px).

### 6.3 Form controls

- **Text input** — Label above or floating; clear border; error state (border + message below). Min height 44 px on touch.
- **Select / Dropdown** — Full-width on mobile; label visible; selected value clearly shown.
- **Checkbox / Toggle** — For “Join as observer” etc.; tap target ≥ 44 px.

### 6.4 Feedback

- **Toast / Snackbar** — Short-lived success or error (e.g. “Link copied”, “Room closed”). Non-blocking; auto-dismiss or dismiss button.
- **Inline error** — Under the field; red (theme-aware).
- **Loading** — Spinner or skeleton for the affected area; button can show spinner + disabled during submit.

### 6.5 Navigation and chrome

- **Header** — App title or screen title; optional back; optional theme toggle and “Leave”/“Close” where relevant. Sticky on mobile if useful.
- **Bottom bar (mobile)** — Optional; use for 2–4 primary destinations if the app has multiple top-level screens (e.g. “Room”, “History” post-MVP).

### 6.6 Badges and status

- **Badge** — Small pill for status: “Open” (felt green), “Closed” (card black / muted), “Voting” (gold accent), “Revealed” (felt green or gold). Theme-aware foreground/background contrast.
- **Avatar / initial** — For participants: circle with initial or icon; optional name beside.

---

## 7. Screen Inventory and Layouts

Screens are derived from `.spec.MD` user stories. For each: **purpose**, **who sees it**, **layout**, **key elements**, **states**, **responsive notes**.

---

### 7.1 Landing / Join by link

- **Purpose:** Entry when user opens shareable room link (or room code). Get display name and role (participant vs observer) then enter room.
- **Who:** Anyone with the link.
- **Layout (mobile):** Single column; centered card; title “Join [Room name]” or “Join planning session”; form: display name (required), “Join as observer” toggle, “Join” button.
- **Layout (desktop):** Same card, max width ~400 px, centered.
- **Elements:** Text input “Your name”; checkbox/toggle “Join as observer (read-only)”; primary button “Join”. Link “Create a room instead” if no room context.
- **States:** Empty; validation error (e.g. name empty); loading (joining); error (room not found, room closed) with message and “Back” or “Create room”.
- **Responsive:** Touch-friendly inputs and button (44 px min height). Keyboard: Tab through fields, Enter to submit.

---

### 7.2 Create Room

- **Purpose:** Facilitator creates a new room with name and deck type; then gets shareable link.
- **Who:** User acting as facilitator (no account required in MVP).
- **Layout (mobile):** Single column; screen title “Create room”; form card: room name, deck type selector, “Create room” button.
- **Layout (desktop):** Same, card max width ~480 px, centered.
- **Elements:** Text input “Room name” (required); select “Deck” (Fibonacci, Linear 0–10, T-shirt); primary button “Create room”. After success: “Room created” + shareable link + “Copy link” button (one-click copy); optional “Open room” to go to room.
- **States:** Empty; validation errors; loading; success with link and copy.
- **Responsive:** Touch-friendly; keyboard submit on Enter.

---

### 7.3 Room Lobby / Estimation Board (unified room view)

- **Purpose:** Main room view: current estimation item, participants, and (for participant) voting cards or (for facilitator) reveal/finalize/add item/close room. Single screen that updates state (no item → lobby; voting → show cards; revealed → show results).
- **Who:** Facilitator, participant, observer (observer sees same layout but no vote controls and no facilitator actions).

**Layout (mobile):**

- **Header:** Room name; badge (Open/Closed); [Menu] or [Leave] for participant, [Close room] for facilitator (in menu or header).
- **Section 1 — Current item:** Card with title and description; if no item: “No item yet” and (facilitator only) “Add item”.
- **Section 2 — Participants:** Horizontal scroll or list of avatars/names; “N participants” or “N voted” during voting (no values). Observers listed separately or with “(observer)”.
- **Section 3 (participant) — Voting:** Deck of cards (values from room deck); user taps to vote; selected card visually distinct; “Change vote” possible until reveal. If observer: message “You are observing; no vote.”
- **Section 3 (facilitator) — Actions:** Buttons: “Reveal votes” (when voting), “Re-vote”, “Record final estimate”, “Add item”, “Close room”. Shown in logical order; destructive (“Close room”) last or in menu.
- **Section 4 — After reveal:** All votes visible; highlight highest/lowest; show average/median; (facilitator) “Record final estimate” and “Re-vote”.

**Layout (tablet):** Same flow; two columns possible: left = item + participants, right = cards + actions.

**Layout (desktop):** Same; optional sidebar for participant list; keyboard shortcuts for facilitator if implemented.

**States:** No item; voting (secret); revealed; finalized (next item or end). Room closed: no voting, read-only summary.

**Responsive:** Cards and buttons 44 px min height on touch. Desktop: hover and keyboard focus.

---

### 7.4 Add / Edit Item (facilitator)

- **Purpose:** Add or edit estimation item (title, description). Used before or between rounds.
- **Who:** Facilitator only.
- **Layout:** Modal or inline form. Title “Add item” / “Edit item”; fields: “Title” (required), “Description” (optional); “Save” and “Cancel”. If edit: “Remove item” (destructive, with confirmation).
- **Elements:** Text input title; textarea description; primary “Save”; secondary “Cancel”; destructive “Remove item” (edit only).
- **States:** Empty; validation error; loading; success (close and refresh list).
- **Responsive:** On mobile, modal or full-screen overlay with safe padding. Touch-friendly.

---

### 7.5 Record Final Estimate (facilitator)

- **Purpose:** After reveal, facilitator sets the single official estimate for the current item.
- **Who:** Facilitator only.
- **Layout:** Inline on the same room view: after votes are shown, a selector (same deck values or “Use X” suggestion) and “Confirm final estimate” button. Or small modal: “Record final estimate” with card choices and “Confirm”.
- **Elements:** Set of options (deck values) or single select; primary “Confirm”; optional “Re-vote” instead.
- **States:** Revealed; facilitator selects value and confirms; then state moves to finalized.
- **Responsive:** Touch-friendly selection; keyboard for desktop.

---

### 7.6 Session History (list)

- **Purpose:** List past sessions (room name, date, summary) for the current room or (post-MVP) for the user.
- **Who:** Facilitator or authenticated user (MVP: in-session history for current room).
- **Layout (mobile):** List of cards: room name, date, item count or “N items estimated”; tap for detail.
- **Layout (desktop):** Table or card grid; sort by date.
- **Elements:** Card per session; primary tap/click opens session detail.
- **States:** Empty (“No sessions yet”); loading; list.
- **Responsive:** List items ≥ 44 px tap target.

---

### 7.7 Session Detail

- **Purpose:** View one session: items with final estimates, participants, date.
- **Who:** Facilitator, or authenticated user with access.
- **Layout:** Header with room name and date; list of items (title, final estimate); list of participants; (facilitator) “Export” button.
- **Elements:** Item rows; participant list; “Export” (e.g. structured text).
- **States:** Loading; content; error.
- **Responsive:** Read-only; same touch/desktop rules.

---

### 7.8 Account (post-MVP): Login, Create account, Logout

- **Login:** Screen with email, password, “Log in”; link “Create account”. Error message on failure.
- **Create account:** Name, email, password, “Create account”; link “Log in”.
- **Logout:** Trigger in header or profile; no separate screen. After logout, redirect to landing or join.
- **Layout:** Centered card, same as Join/Create room. Touch-friendly and keyboard-friendly.
- **Theme:** Same clear/dark and component system.

---

### 7.9 Leave room / Close room confirmation

- **Leave room:** Confirmation: “Leave this room? You will need the link to rejoin.” Buttons: “Leave” (destructive), “Cancel”.
- **Close room:** Confirmation: “Close this room? No one will be able to vote after closing.” Buttons: “Close room” (destructive), “Cancel”.
- **Responsive:** Modal or inline; buttons 44 px min on touch; Escape cancels; focus trap in modal.

---

## 8. Accessibility Checklist

- **Contrast:** All text and controls meet WCAG 2.1 AA in both themes.
- **Focus:** Visible focus indicator; logical Tab order; no focus trap except in modals (then Escape exits).
- **Labels:** All form inputs have visible or aria-label; buttons have clear text or aria-label.
- **Roles:** Use semantic HTML (headings, buttons, links, list); or ARIA roles where needed (e.g. listbox for deck).
- **Motion:** Respect `prefers-reduced-motion`; avoid flashing content.
- **Screen reader (goal):** Key flows (join, vote, reveal, close) understandable with screen reader; announce live updates (e.g. “Votes revealed”) where applicable.

---

## 9. Reference to Other Docs

| Document | Purpose |
|----------|--------|
| `drivin-design/.spec.MD` | Product and user stories; success criteria. |
| `drivin-design/configuration.MD` | Workflow and AI rules. |
| `drivin-design/quickstart.MD` | Stack (React, Expo, shared). |
| `drivin-design/ui-definition.MD` | This file — UI rules, themes, components, screens. |

When implementing UI, use this document for layout, components, themes, and input behavior; use `.spec.MD` for what the screen must do (success criteria).
