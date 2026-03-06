---
name: typescript-react-best-practices
description: Enforces TypeScript and React best practices with clean code and separation of concerns. Use when Composer writes or refactors React components, hooks, API layers, pages, or TypeScript code. Covers strict typing, layer boundaries, custom hooks, and presentational patterns.
---

# TypeScript + React Best Practices

## When to Apply

Apply this skill when:
- Writing new React components, hooks, or pages
- Refactoring existing React/TypeScript code
- Reviewing code for quality and maintainability
- Structuring API layers, state, or business logic

---

## 1. TypeScript Conventions

### Strict Typing

- Use `strict: true` in tsconfig. Avoid `any`; prefer `unknown` when type is truly unknown.
- Prefer `interface` for object shapes; use `type` for unions, intersections, or mapped types.
- Export types alongside components when they are part of the public API.

```typescript
// Good
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  loading?: boolean;
}

// Avoid
const Button = (props: any) => ...
```

### Props and Events

- Extend native HTML attributes when appropriate (`ButtonHTMLAttributes`, `InputHTMLAttributes`).
- Use `React.FormEvent`, `React.ChangeEvent`, `React.MouseEvent` for event handlers.
- Destructure props and spread the rest: `{ variant, loading, ...props }`.

```typescript
// Good
function Input({ label, error, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  return <input id={inputId} {...props} />;
}
```

### Discriminated Unions for State

- Use discriminated unions for complex state instead of optional booleans.

```typescript
// Good
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };
```

### Imports and Exports

- Use `import type` for type-only imports to enable better tree-shaking.
- Prefer named exports for components and hooks; default export only for pages/routes if project convention requires it.

```typescript
// Good
import type { ButtonHTMLAttributes } from "react";
export function Button({ ... }: ButtonProps) { ... }
```

---

## 2. Separation of Concerns

### Layer Boundaries

| Layer | Responsibility | Location |
|-------|----------------|----------|
| **UI** | Rendering, layout, user interaction | `components/`, `pages/` |
| **Logic** | State, side effects, orchestration | `hooks/`, custom hooks |
| **Data** | API calls, socket connections | `api.ts`, `services/` |
| **Domain** | Types, constants, business rules | `shared/`, `types/` |

### Rules

1. **Components stay presentational when possible.** Move data fetching, validation, and complex logic into hooks or services.
2. **API layer is thin.** Only HTTP/socket calls and response mapping. No UI logic.
3. **Shared types live in `shared/` or `types/`.** Avoid duplicating types across apps.
4. **Storage/state persistence** in a dedicated module (e.g. `storage.ts`), not inside components.

### Example Structure

```
src/
├── api.ts           # API client, socket factory
├── storage.ts       # localStorage/session persistence
├── hooks/           # useCreateRoom, useRoomSocket, etc.
├── components/      # Button, Input, Card (presentational)
├── pages/           # CreateRoom, JoinRoom (compose hooks + components)
└── types/           # App-specific types (if not in shared)
```

---

## 3. Clean Code in React

### Component Size

- Keep components under ~150 lines. Extract subcomponents or hooks when logic grows.
- One primary responsibility per component.

### Naming

- Components: PascalCase (`CreateRoom`, `Button`)
- Hooks: `use` prefix (`useCreateRoom`, `useRoomSocket`)
- Handlers: `handle` prefix (`handleSubmit`, `handleChange`)
- Booleans: `is`/`has` prefix (`isLoading`, `hasError`)

### State and Handlers

- Co-locate related state. Prefer `useReducer` when state transitions are complex.
- Extract submit/change handlers into named functions; avoid inline arrow functions for complex logic.

```typescript
// Good
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  if (!name.trim()) {
    setError("Room name is required");
    return;
  }
  setLoading(true);
  try {
    const res = await roomApi.createRoom(name.trim(), deckType, baseUrl);
    // ...
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to create room");
  } finally {
    setLoading(false);
  }
}
```

### Early Returns

- Use early returns to reduce nesting and improve readability.

```typescript
// Good
if (!name.trim()) {
  setError("Room name is required");
  return;
}
// main flow continues
```

---

## 4. Custom Hooks

- Extract reusable logic into custom hooks. Keep components focused on rendering.
- Hooks return `{ data, loading, error, refetch }` or similar; avoid returning raw setters when not needed.
- Name hooks after what they do: `useCreateRoom`, `useRoomParticipants`.

```typescript
// Good - logic in hook
function useCreateRoom() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function createRoom(name: string, deckType: DeckType) {
    setError("");
    setLoading(true);
    try {
      const res = await roomApi.createRoom(name, deckType, window.location.origin);
      setStoredParticipant(res.room.id, res.participant.id, true);
      navigate(`/room/${res.room.id}`, { state: { participantId: res.participant.id, isFacilitator: true } });
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { createRoom, loading, error };
}
```

---

## 5. Component Patterns

### Presentational vs Container

- **Presentational**: Receives data via props, no direct API calls. Easy to test and reuse.
- **Container/Page**: Uses hooks for data and logic, passes props to presentational components.

### Props Design

- Prefer explicit props over context when the tree is shallow.
- Use `children` for composition; avoid prop drilling beyond 2–3 levels.
- Optional props with sensible defaults: `variant = "primary"`.

### Styling

- Prefer CSS variables for theming (`var(--color-primary)`).
- Extract repeated inline styles into constants or a design tokens file when used in multiple places.
- Consider a shared `Select` or `Dropdown` component instead of raw `<select>` with duplicated styles.

---

## 6. Error Handling

- Catch errors at boundaries (API layer, async handlers).
- Surface user-facing messages; log technical details for debugging.
- Use `err instanceof Error ? err.message : "Fallback message"` for type-safe error messages.

---

## 7. Checklist Before Submitting

- [ ] No `any`; types are explicit where needed
- [ ] API/data logic is outside components (hooks or services)
- [ ] Components are focused; complex logic extracted to hooks
- [ ] Handlers are named (`handleSubmit`), not inline where logic is non-trivial
- [ ] Early returns used to reduce nesting
- [ ] Naming follows conventions (PascalCase components, `use` hooks, `handle` handlers)
- [ ] Shared types live in `shared/` or `types/`; no duplication

---

## Quick Reference

| Principle | Do | Avoid |
|-----------|----|-------|
| Typing | `interface`, `type`, strict | `any` |
| Logic | Hooks, services | Logic in components |
| API | Thin layer, mapping only | UI logic in API |
| State | Co-located, `useReducer` if complex | Scattered booleans |
| Handlers | Named functions | Inline arrows for complex logic |
| Errors | Catch, map to user message | Swallow or ignore |

---

## Anti-Patterns to Avoid

- **Logic in JSX**: Move conditionals and transformations into variables or helper functions.
- **Prop drilling 4+ levels**: Use composition or a focused context instead.
- **Inline styles duplicated 3+ times**: Extract to a shared component or design tokens.
- **`as` type assertions**: Prefer proper typing; use `as` only when interfacing with untyped libs.
- **Multiple `useState` for related data**: Consider `useReducer` or a single state object.
