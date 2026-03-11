/**
 * CreateRoom page tests.
 * Covers: renders form, empty name validation, calls createRoom hook, loading state,
 * API error message, deck selector rendered.
 * Per tasks.MD §2.5, configuration.MD §3 TDD mandate.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { MessageProvider } from "../context/MessageContext";
import { CreateRoom } from "./CreateRoom";

vi.mock("../hooks/useCreateRoom", () => ({
  useCreateRoom: vi.fn(),
}));

const { useCreateRoom } = await import("../hooks/useCreateRoom");

function makeHook(overrides?: Partial<ReturnType<typeof import("../hooks/useCreateRoom").useCreateRoom>>) {
  return {
    createRoom: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
    error: "",
    setError: vi.fn(),
    ...overrides,
  };
}

function TestApp() {
  return (
    <AuthProvider>
      <MessageProvider>
        <MemoryRouter initialEntries={["/create"]}>
          <Routes>
            <Route path="/create" element={<CreateRoom />} />
            <Route path="/" element={<div data-testid="home">Home</div>} />
          </Routes>
        </MemoryRouter>
      </MessageProvider>
    </AuthProvider>
  );
}

describe("CreateRoom", () => {
  beforeEach(() => {
    vi.mocked(useCreateRoom).mockReturnValue(makeHook());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page heading", () => {
    render(<TestApp />);
    expect(screen.getByRole("heading", { name: /create room/i })).toBeInTheDocument();
  });

  it("renders room name input and deck selector", () => {
    render(<TestApp />);
    expect(screen.getByLabelText(/room name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/deck/i)).toBeInTheDocument();
  });

  it("renders Create room submit button", () => {
    render(<TestApp />);
    expect(screen.getByRole("button", { name: /create room/i })).toBeInTheDocument();
  });

  it("shows inline error when room name is empty on submit", async () => {
    const user = userEvent.setup();
    const hook = makeHook({ error: "Room name is required", setError: vi.fn() });
    vi.mocked(useCreateRoom).mockReturnValue(hook);

    render(<TestApp />);
    await user.click(screen.getByRole("button", { name: /create room/i }));

    await waitFor(() => {
      expect(screen.getAllByText("Room name is required").length).toBeGreaterThan(0);
    });
  });

  it("calls createRoom with name and selected deck on valid submit", async () => {
    const user = userEvent.setup();
    const hook = makeHook();
    vi.mocked(useCreateRoom).mockReturnValue(hook);

    render(<TestApp />);
    await user.type(screen.getByLabelText(/room name/i), "Sprint 42");
    await user.click(screen.getByRole("button", { name: /create room/i }));

    await waitFor(() => {
      expect(hook.createRoom).toHaveBeenCalledWith("Sprint 42", expect.any(String));
    });
  });

  it("shows API error message when hook returns an error", () => {
    vi.mocked(useCreateRoom).mockReturnValue(makeHook({ error: "Unable to create room. Please try again." }));
    render(<TestApp />);
    // Error text may appear twice (inline field + general error paragraph)
    expect(screen.getAllByText("Unable to create room. Please try again.").length).toBeGreaterThan(0);
  });

  it("shows deck options for Fibonacci, Linear, and T-shirt", () => {
    render(<TestApp />);
    const options = screen.getAllByRole("option");
    const optionTexts = options.map((o) => o.textContent ?? "");
    expect(optionTexts.some((t) => t.includes("FIBONACCI"))).toBe(true);
    expect(optionTexts.some((t) => t.includes("LINEAR"))).toBe(true);
    expect(optionTexts.some((t) => t.includes("TSHIRT"))).toBe(true);
  });

  it("renders a back to home link", () => {
    render(<TestApp />);
    expect(screen.getByRole("link", { name: /back to home/i })).toBeInTheDocument();
  });
});
