/**
 * useCreateRoom hook tests.
 * Covers: successful room creation (navigates, stores participant), loading state,
 * error state when API throws.
 * Per tasks.MD §2.5, configuration.MD §3 TDD mandate.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { useCreateRoom } from "./useCreateRoom";
import { DeckType, RoomState, ParticipantRole } from "shared";

vi.mock("../api", () => ({
  roomApi: {
    createRoom: vi.fn(),
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

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

const mockRoomResponse = {
  room: {
    id: "room-1",
    name: "Sprint 42",
    deckType: DeckType.FIBONACCI,
    deckValues: ["1", "2", "3", "5", "8"],
    state: RoomState.OPEN,
    facilitatorId: "p-1",
    createdAt: Date.now(),
    closedAt: null,
  },
  participant: {
    id: "p-1",
    roomId: "room-1",
    displayName: "Sprint 42",
    role: ParticipantRole.FACILITATOR,
    joinedAt: Date.now(),
    leftAt: null,
    isActive: true,
  },
  shareableLink: "http://localhost:5173/room/room-1",
};

describe("useCreateRoom", () => {
  beforeEach(() => {
    vi.mocked(roomApi.createRoom).mockResolvedValue(mockRoomResponse);
    sessionStorage.setItem(
      "poker-plan-it-auth",
      JSON.stringify({ user: { id: "1", email: "a@b.com", name: "Alice" }, token: "tok" })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("starts with isLoading=false and no error", () => {
    const { result } = renderHook(() => useCreateRoom(), { wrapper });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("sets isLoading=true during createRoom call then false after", async () => {
    let resolve: (v: typeof mockRoomResponse) => void = () => {};
    vi.mocked(roomApi.createRoom).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      })
    );
    const { result } = renderHook(() => useCreateRoom(), { wrapper });

    act(() => {
      result.current.createRoom("Sprint 42", DeckType.FIBONACCI);
    });
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolve(mockRoomResponse);
    });
    expect(result.current.isLoading).toBe(false);
  });

  it("calls roomApi.createRoom with trimmed name and deckType", async () => {
    const { result } = renderHook(() => useCreateRoom(), { wrapper });
    await act(async () => {
      await result.current.createRoom("  Sprint 42  ", DeckType.FIBONACCI);
    });
    expect(roomApi.createRoom).toHaveBeenCalledWith(
      "Sprint 42",
      DeckType.FIBONACCI,
      expect.any(String)
    );
  });

  it("calls setStoredParticipant with room id, participant id, and isFacilitator=true", async () => {
    const { result } = renderHook(() => useCreateRoom(), { wrapper });
    await act(async () => {
      await result.current.createRoom("Sprint 42", DeckType.FIBONACCI);
    });
    expect(setStoredParticipant).toHaveBeenCalledWith("room-1", "p-1", true);
  });

  it("sets error and clears loading when API throws", async () => {
    vi.mocked(roomApi.createRoom).mockRejectedValue(new Error("Server error"));
    const { result } = renderHook(() => useCreateRoom(), { wrapper });
    await act(async () => {
      try {
        await result.current.createRoom("Sprint 42", DeckType.FIBONACCI);
      } catch {
        // expected — hook re-throws
      }
    });
    expect(result.current.error).toBe("Server error");
    expect(result.current.isLoading).toBe(false);
  });

  it("setError clears the error message", async () => {
    vi.mocked(roomApi.createRoom).mockRejectedValue(new Error("Oops"));
    const { result } = renderHook(() => useCreateRoom(), { wrapper });
    await act(async () => {
      try {
        await result.current.createRoom("Sprint 42", DeckType.FIBONACCI);
      } catch {
        // expected
      }
    });
    expect(result.current.error).toBe("Oops");

    act(() => {
      result.current.setError("");
    });
    expect(result.current.error).toBe("");
  });
});
