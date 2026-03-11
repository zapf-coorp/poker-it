/**
 * JoinRoom page tests.
 * Covers: loading state, room not found, room closed, join form renders,
 * observer toggle, join error message, empty name disables button.
 * Per tasks.MD §2.6, configuration.MD §3 TDD mandate.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { MessageProvider } from "../context/MessageContext";
import { JoinRoom } from "./JoinRoom";
import { DeckType, RoomState } from "shared";

vi.mock("../hooks/useJoinRoom", () => ({
  useJoinRoom: vi.fn(),
}));

const { useJoinRoom } = await import("../hooks/useJoinRoom");

const mockRoom = {
  id: "room-1",
  name: "Sprint 42",
  deckType: DeckType.FIBONACCI,
  deckValues: ["1", "2", "3", "5", "8"],
  state: RoomState.OPEN,
  facilitatorId: "f-1",
  createdAt: Date.now(),
  closedAt: null,
};

const closedRoom = { ...mockRoom, state: RoomState.CLOSED, closedAt: Date.now() };

function makeHook(overrides?: Partial<ReturnType<typeof import("../hooks/useJoinRoom").useJoinRoom>>) {
  return {
    room: mockRoom,
    isLoading: false,
    roomError: "",
    joinRoom: vi.fn(),
    joinLoading: false,
    joinError: "",
    ...overrides,
  };
}

function TestApp() {
  return (
    <AuthProvider>
      <MessageProvider>
        <MemoryRouter initialEntries={["/room/room-1"]}>
          <Routes>
            <Route path="/room/:id" element={<JoinRoom />} />
            <Route path="/" element={<div data-testid="home">Home</div>} />
          </Routes>
        </MemoryRouter>
      </MessageProvider>
    </AuthProvider>
  );
}

describe("JoinRoom", () => {
  beforeEach(() => {
    vi.mocked(useJoinRoom).mockReturnValue(makeHook());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading text while room is being fetched", () => {
    vi.mocked(useJoinRoom).mockReturnValue(makeHook({ isLoading: true, room: null }));
    render(<TestApp />);
    expect(screen.getByText(/loading room/i)).toBeInTheDocument();
  });

  it("shows room not found error with link to create room", () => {
    vi.mocked(useJoinRoom).mockReturnValue(makeHook({ room: null, roomError: "Room not found" }));
    render(<TestApp />);
    expect(screen.getByText("Room not found")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create a room instead/i })).toBeInTheDocument();
  });

  it("shows closed room message with link to create room", () => {
    vi.mocked(useJoinRoom).mockReturnValue(makeHook({ room: closedRoom }));
    render(<TestApp />);
    expect(screen.getByText(/this room is closed/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create a room instead/i })).toBeInTheDocument();
  });

  it("renders the join form with room name in heading", () => {
    render(<TestApp />);
    expect(screen.getByRole("heading", { name: /join sprint 42/i })).toBeInTheDocument();
  });

  it("renders display name input and join button", () => {
    render(<TestApp />);
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^join$/i })).toBeInTheDocument();
  });

  it("renders the observer toggle checkbox", () => {
    render(<TestApp />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByText(/join as observer/i)).toBeInTheDocument();
  });

  it("join button is disabled when display name is empty", () => {
    render(<TestApp />);
    expect(screen.getByRole("button", { name: /^join$/i })).toBeDisabled();
  });

  it("join button is enabled when display name is typed", async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    await user.type(screen.getByLabelText(/your name/i), "Alice");
    expect(screen.getByRole("button", { name: /^join$/i })).toBeEnabled();
  });

  it("calls joinRoom with displayName and observer=false on submit", async () => {
    const user = userEvent.setup();
    const hook = makeHook();
    vi.mocked(useJoinRoom).mockReturnValue(hook);

    render(<TestApp />);
    await user.type(screen.getByLabelText(/your name/i), "Alice");
    await user.click(screen.getByRole("button", { name: /^join$/i }));

    await waitFor(() => {
      expect(hook.joinRoom).toHaveBeenCalledWith("Alice", false);
    });
  });

  it("calls joinRoom with joinAsObserver=true when toggle is checked", async () => {
    const user = userEvent.setup();
    const hook = makeHook();
    vi.mocked(useJoinRoom).mockReturnValue(hook);

    render(<TestApp />);
    await user.type(screen.getByLabelText(/your name/i), "Bob");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /^join$/i }));

    await waitFor(() => {
      expect(hook.joinRoom).toHaveBeenCalledWith("Bob", true);
    });
  });

  it("shows join error message when joinError is set", () => {
    vi.mocked(useJoinRoom).mockReturnValue(makeHook({ joinError: "This name is already in use." }));
    render(<TestApp />);
    expect(screen.getByText("This name is already in use.")).toBeInTheDocument();
  });

  it("renders a link to create a room", () => {
    render(<TestApp />);
    expect(screen.getByRole("link", { name: /create a room instead/i })).toBeInTheDocument();
  });
});
