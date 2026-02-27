/**
 * Phase 2.4 — Room API client.
 * Tests createRoom, getRoom, joinRoom, leaveRoom, closeRoom (tasks 2.4.1–2.4.5).
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { createRoomApi } from "../src/room-api.js";
import { DeckType, ParticipantRole, RoomState } from "../src/types.js";

describe("Phase 2 — Room API client", () => {
  const baseUrl = "http://localhost:3000";

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("2.4.1 createRoom", () => {
    it("POSTs to /api/rooms with name and deckType, returns room, participant, shareableLink", async () => {
      const mockRoom = {
        id: "room-1",
        name: "Test Room",
        deckType: DeckType.FIBONACCI,
        deckValues: ["0", "1", "2"],
        state: RoomState.OPEN,
        facilitatorId: "p1",
        createdAt: 0,
        closedAt: null,
      };
      const mockParticipant = {
        id: "p1",
        roomId: "room-1",
        displayName: "Test Room",
        role: ParticipantRole.FACILITATOR,
        joinedAt: 0,
        leftAt: null,
        isActive: true,
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            room: mockRoom,
            participant: mockParticipant,
            shareableLink: "http://localhost:5173/room/room-1",
          }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const api = createRoomApi(baseUrl);
      const result = await api.createRoom("Test Room", DeckType.FIBONACCI);

      expect(result.room).toEqual(mockRoom);
      expect(result.participant).toEqual(mockParticipant);
      expect(result.shareableLink).toContain("/room/room-1");
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody).toMatchObject({ name: "Test Room", deckType: DeckType.FIBONACCI });
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/rooms`,
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("2.4.2 getRoom", () => {
    it("GETs /api/rooms/:id and returns room", async () => {
      const mockRoom = {
        id: "room-1",
        name: "My Room",
        deckType: DeckType.LINEAR,
        deckValues: ["0", "1", "2", "3", "4", "5"],
        state: RoomState.OPEN,
        facilitatorId: "p1",
        createdAt: 0,
        closedAt: null,
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRoom),
      });
      vi.stubGlobal("fetch", mockFetch);

      const api = createRoomApi(baseUrl);
      const result = await api.getRoom("room-1");

      expect(result).toEqual(mockRoom);
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/rooms/room-1`,
        expect.any(Object)
      );
    });
  });

  describe("2.4.3 joinRoom", () => {
    it("POSTs to /api/rooms/:id/join with displayName and role", async () => {
      const mockParticipant = {
        id: "p2",
        roomId: "room-1",
        displayName: "Alice",
        role: ParticipantRole.PARTICIPANT,
        joinedAt: 0,
        leftAt: null,
        isActive: true,
      };
      const mockRoom = {
        id: "room-1",
        name: "Test",
        state: RoomState.OPEN,
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            participant: mockParticipant,
            room: mockRoom,
          }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const api = createRoomApi(baseUrl);
      const result = await api.joinRoom("room-1", "Alice");

      expect(result.participant.displayName).toBe("Alice");
      expect(result.participant.role).toBe(ParticipantRole.PARTICIPANT);
      expect(result.room.id).toBe("room-1");
      const joinCallBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(joinCallBody).toMatchObject({ displayName: "Alice" });
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/rooms/room-1/join`,
        expect.objectContaining({ method: "POST" })
      );
    });

    it("sends role OBSERVER when joining as observer", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            participant: { role: ParticipantRole.OBSERVER },
            room: {},
          }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const api = createRoomApi(baseUrl);
      await api.joinRoom("room-1", "Bob", ParticipantRole.OBSERVER);

      const observerCallBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(observerCallBody.role).toBe(ParticipantRole.OBSERVER);
    });
  });

  describe("2.4.4 leaveRoom", () => {
    it("POSTs to /api/rooms/:id/leave with participantId", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const api = createRoomApi(baseUrl);
      await api.leaveRoom("room-1", "participant-123");

      const leaveCallBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(leaveCallBody.participantId).toBe("participant-123");
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/rooms/room-1/leave`,
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("2.4.5 closeRoom", () => {
    it("POSTs to /api/rooms/:id/close with participantId", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const api = createRoomApi(baseUrl);
      await api.closeRoom("room-1", "facilitator-456");

      const closeCallBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(closeCallBody.participantId).toBe("facilitator-456");
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/rooms/room-1/close`,
        expect.objectContaining({ method: "POST" })
      );
    });
  });
});
