/**
 * useJoinRoom hook tests.
 * Covers: fetches room on mount, handles 404/network error, joinRoom happy path,
 * observer role, joinRoom error, loading states.
 * Per tasks.MD §2.6, configuration.MD §3 TDD mandate.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useJoinRoom } from "./useJoinRoom";
import { DeckType, ParticipantRole, RoomState } from "shared";

vi.mock("../api", () => ({
  roomApi: {
    getRoom: vi.fn(),
    joinRoom: vi.fn(),
  },
  createRoomSocket: vi.fn(),
}));

vi.mock("../storage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../storage")>();
  return {
    ...actual,
    setStoredParticipant: vi.fn(),
    getStoredParticipant: vi.fn(),
    clearStoredParticipant: vi.fn(),
  };
});

const { roomApi } = await import("../api");
const { setStoredParticipant } = await import("../storage");

const mockRoom = {
  id: "room-1",
  name: "Sprint 42",
  deckType: DeckType.FIBONACCI,
  deckValues: ["1", "2", "3", "5"],
  state: RoomState.OPEN,
  facilitatorId: "f-1",
  createdAt: Date.now(),
  closedAt: null,
};

const mockParticipant = {
  id: "p-2",
  roomId: "room-1",
  displayName: "Alice",
  role: ParticipantRole.PARTICIPANT,
  joinedAt: Date.now(),
  leftAt: null,
  isActive: true,
};

// Prevent jsdom navigation by replacing window.location.assign with a spy
const assignSpy = vi.fn();

describe("useJoinRoom", () => {
  beforeEach(() => {
    vi.mocked(roomApi.getRoom).mockResolvedValue(mockRoom);
    vi.mocked(roomApi.joinRoom).mockResolvedValue({ participant: mockParticipant, room: mockRoom });
    // Replace location.assign to avoid jsdom NotSupportedError
    Object.defineProperty(window, "location", {
      writable: true,
      configurable: true,
      value: { assign: assignSpy, origin: "http://localhost:5173", href: "" },
    });
    assignSpy.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("starts with isLoading=true and fetches the room on mount", async () => {
    const { result } = renderHook(() => useJoinRoom("room-1"));
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.room).toEqual(mockRoom);
  });

  it("sets roomError when room is not found (API throws)", async () => {
    vi.mocked(roomApi.getRoom).mockRejectedValue(new Error("Room not found"));
    const { result } = renderHook(() => useJoinRoom("room-99"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.roomError).toBe("Room not found");
    expect(result.current.room).toBeNull();
  });

  it("sets roomError when roomId is undefined", async () => {
    const { result } = renderHook(() => useJoinRoom(undefined));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.roomError).toBe("Room ID missing");
  });

  it("joinRoom calls roomApi.joinRoom with trimmed displayName as PARTICIPANT", async () => {
    const { result } = renderHook(() => useJoinRoom("room-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.joinRoom("  Alice  ", false);
    });

    expect(roomApi.joinRoom).toHaveBeenCalledWith("room-1", "Alice", ParticipantRole.PARTICIPANT);
  });

  it("joinRoom sends OBSERVER role when joinAsObserver=true", async () => {
    const { result } = renderHook(() => useJoinRoom("room-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.joinRoom("Bob", true);
    });

    expect(roomApi.joinRoom).toHaveBeenCalledWith("room-1", "Bob", ParticipantRole.OBSERVER);
  });

  it("calls setStoredParticipant after successful join", async () => {
    const { result } = renderHook(() => useJoinRoom("room-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.joinRoom("Alice", false);
    });

    expect(setStoredParticipant).toHaveBeenCalledWith("room-1", "p-2", false);
  });

  it("sets joinError when joinRoom API throws", async () => {
    vi.mocked(roomApi.joinRoom).mockRejectedValue(new Error("Name already in use"));
    const { result } = renderHook(() => useJoinRoom("room-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.joinRoom("Alice", false);
    });

    expect(result.current.joinError).toBe("Name already in use");
    expect(result.current.joinLoading).toBe(false);
  });

  it("does not call joinRoom when displayName is empty", async () => {
    const { result } = renderHook(() => useJoinRoom("room-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.joinRoom("  ", false);
    });

    expect(roomApi.joinRoom).not.toHaveBeenCalled();
  });
});
