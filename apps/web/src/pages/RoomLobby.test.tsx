/**
 * RoomLobby integration tests.
 * Covers: enter room, select/deselect cards, close room, countdown, redirect, message.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { MessageProvider } from "../context/MessageContext";
import { MessageList } from "../components/MessageList";
import { RoomLobby } from "./RoomLobby";
import {
  RoomState,
  DeckType,
  ParticipantRole,
  RoundState,
} from "shared";
import type { Room, Participant } from "shared";
import type { ItemWithRound } from "../types";

const ROOM_ID = "room-123";
const PARTICIPANT_ID = "participant-fac";
const ITEM_ID = "item-1";
const ROUND_ID = "round-1";

const mockRoom: Room = {
  id: ROOM_ID,
  name: "Sprint 42",
  deckType: DeckType.FIBONACCI,
  deckValues: ["0", "1", "2", "3", "5", "8", "13", "21"],
  state: RoomState.OPEN,
  facilitatorId: PARTICIPANT_ID,
  createdAt: Date.now(),
  closedAt: null,
};

const mockParticipants: Participant[] = [
  {
    id: PARTICIPANT_ID,
    roomId: ROOM_ID,
    displayName: "Alice",
    role: ParticipantRole.FACILITATOR,
    joinedAt: Date.now(),
    leftAt: null,
    isActive: true,
  },
];

const mockItemWithRound: ItemWithRound = {
  id: ITEM_ID,
  roomId: ROOM_ID,
  title: "User login",
  description: null,
  order: 0,
  finalEstimate: null,
  finalEstimateRecordedAt: null,
  createdAt: Date.now(),
  currentRoundId: ROUND_ID,
  currentRound: {
    id: ROUND_ID,
    state: RoundState.VOTING,
    roundNumber: 1,
    votedCount: 0,
  },
};

const mockRoomClosed: Room = {
  ...mockRoom,
  state: RoomState.CLOSED,
  closedAt: Date.now(),
};

vi.mock("../api", () => ({
  roomApi: {
    getRoom: vi.fn(),
    getParticipants: vi.fn(),
    getItems: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    castVote: vi.fn(),
    removeVote: vi.fn(),
    revealVotes: vi.fn(),
    revote: vi.fn(),
    recordFinalEstimate: vi.fn(),
    closeRoom: vi.fn(),
    leaveRoom: vi.fn(),
  },
  createRoomSocket: () => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  }),
}));

vi.mock("../storage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../storage")>();
  return {
    ...actual,
    getStoredParticipant: vi.fn(),
    setStoredParticipant: vi.fn(),
    clearStoredParticipant: vi.fn(),
  };
});

const { roomApi } = await import("../api");
const { getStoredParticipant } = await import("../storage");

function TestApp({ initialRoute = `/room/${ROOM_ID}` }: { initialRoute?: string }) {
  return (
    <AuthProvider>
      <MessageProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <MessageList />
          <Routes>
            <Route path="/room/:id" element={<RoomLobby />} />
            <Route path="/create" element={<div data-testid="create-page">Create Room</div>} />
            <Route path="/" element={<div data-testid="home-page">Home</div>} />
          </Routes>
        </MemoryRouter>
      </MessageProvider>
    </AuthProvider>
  );
}

describe("RoomLobby", () => {
  beforeEach(async () => {
    vi.mocked(getStoredParticipant).mockReturnValue({
      participantId: PARTICIPANT_ID,
      isFacilitator: true,
    });
    vi.mocked(roomApi.getRoom).mockResolvedValue(mockRoom);
    vi.mocked(roomApi.getParticipants).mockResolvedValue({
      participants: mockParticipants,
    });
    vi.mocked(roomApi.getItems).mockResolvedValue({
      items: [mockItemWithRound],
    });
    vi.mocked(roomApi.castVote).mockResolvedValue(undefined);
    vi.mocked(roomApi.removeVote).mockResolvedValue(undefined);
    vi.mocked(roomApi.closeRoom).mockResolvedValue(undefined);
    sessionStorage.setItem(
      "poker-plan-it-auth",
      JSON.stringify({
        user: { id: "1", email: "a@b.com", name: "Alice" },
        token: "mock-token-123",
      })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("enters room and shows room name, item, and voting deck", async () => {
    render(<TestApp />);

    await waitFor(() => {
      expect(screen.getByText("Sprint 42")).toBeInTheDocument();
    });
    expect(screen.getByText("User login")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "8" })).toBeInTheDocument();
  });

  it("selects and deselects a card", async () => {
    render(<TestApp />);

    await waitFor(() => {
      expect(screen.getByText("User login")).toBeInTheDocument();
    });

    const card5 = screen.getByRole("button", { name: "5" });
    fireEvent.click(card5);

    await waitFor(() => {
      expect(roomApi.castVote).toHaveBeenCalledWith(
        ROOM_ID,
        ITEM_ID,
        PARTICIPANT_ID,
        "5"
      );
    });

    vi.mocked(roomApi.getItems).mockResolvedValue({
      items: [
        {
          ...mockItemWithRound,
          currentRound: {
            ...mockItemWithRound.currentRound!,
            votedCount: 1,
          },
        },
      ],
    });

    fireEvent.click(card5);

    await waitFor(() => {
      expect(roomApi.removeVote).toHaveBeenCalledWith(
        ROOM_ID,
        ITEM_ID,
        PARTICIPANT_ID
      );
    });
  });

  it("shows countdown when room is closed and redirects to create with message", async () => {
    vi.mocked(roomApi.getRoom).mockResolvedValue(mockRoomClosed);
    vi.mocked(roomApi.getItems).mockResolvedValue({
      items: [{ ...mockItemWithRound, finalEstimate: "5" }],
    });

    render(<TestApp />);

    await waitFor(() => {
      expect(screen.getByText(/Room closed/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Redirecting to create a new room in/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go now" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Go now" }));

    await waitFor(() => {
      expect(screen.getByTestId("create-page")).toBeInTheDocument();
    });

    expect(
      screen.getByText(/The room "Sprint 42" was closed at \d{2}:\d{2}:\d{2}/)
    ).toBeInTheDocument();
  });

  it("shows Edit item button during voting", async () => {
    render(<TestApp />);

    await waitFor(() => {
      expect(screen.getByText("User login")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Edit item" })).toBeInTheDocument();
  });
});
