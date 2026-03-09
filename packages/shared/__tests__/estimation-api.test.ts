/**
 * Phase 3.4 — Estimation API client.
 * Tests addItem, updateItem, removeItem, castVote, revealVotes, revote, recordFinalEstimate (tasks 3.4.1–3.4.7).
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { createRoomApi } from "../src/room-api.js";

describe("Phase 3 — Estimation API client", () => {
  const baseUrl = "http://localhost:3033";

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("3.4.1 addItem", () => {
    it("POSTs to /api/rooms/:id/items with title, description, participantId", async () => {
      const mockItem = {
        id: "item-1",
        roomId: "room-1",
        title: "Story",
        description: "Desc",
        order: 1,
        finalEstimate: null,
        currentRoundId: "round-1",
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockItem),
      });
      vi.stubGlobal("fetch", mockFetch);

      const api = createRoomApi(baseUrl);
      const result = await api.addItem("room-1", "facilitator-1", "Story", "Desc");

      expect(result).toEqual(mockItem);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toMatchObject({
        title: "Story",
        description: "Desc",
        participantId: "facilitator-1",
      });
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/rooms/room-1/items`,
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("3.4.2 updateItem", () => {
    it("PATCHes /api/rooms/:id/items/:itemId with updates and participantId", async () => {
      const mockItem = { id: "item-1", title: "Updated", description: "New desc" };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockItem),
      });
      vi.stubGlobal("fetch", mockFetch);

      const api = createRoomApi(baseUrl);
      const result = await api.updateItem("room-1", "item-1", "facilitator-1", {
        title: "Updated",
        description: "New desc",
      });

      expect(result.title).toBe("Updated");
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toMatchObject({
        title: "Updated",
        description: "New desc",
        participantId: "facilitator-1",
      });
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/rooms/room-1/items/item-1`,
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });

  describe("3.4.3 removeItem", () => {
    it("DELETEs /api/rooms/:id/items/:itemId with participantId in query", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const api = createRoomApi(baseUrl);
      await api.removeItem("room-1", "item-1", "facilitator-1");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/rooms/room-1/items/item-1"),
        expect.any(Object)
      );
      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain("participantId=facilitator-1");
    });
  });

  describe("3.4.4 castVote", () => {
    it("POSTs to /api/rooms/:id/items/:itemId/vote with participantId and cardValue", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const api = createRoomApi(baseUrl);
      await api.castVote("room-1", "item-1", "participant-1", "5");

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toMatchObject({
        participantId: "participant-1",
        cardValue: "5",
      });
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/rooms/room-1/items/item-1/vote`,
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("3.4.5 revealVotes", () => {
    it("POSTs to /api/rooms/:id/items/:itemId/reveal, returns votes and statistics", async () => {
      const mockResponse = {
        votes: [{ cardValue: "5", participantName: "Alice" }],
        statistics: {
          average: 5,
          median: 5,
          suggestedEstimate: "5",
          voteDistribution: { "5": 1 },
        },
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      vi.stubGlobal("fetch", mockFetch);

      const api = createRoomApi(baseUrl);
      const result = await api.revealVotes("room-1", "item-1", "facilitator-1");

      expect(result.votes).toHaveLength(1);
      expect(result.statistics.suggestedEstimate).toBe("5");
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.participantId).toBe("facilitator-1");
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/rooms/room-1/items/item-1/reveal`,
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("3.4.6 revote", () => {
    it("POSTs to /api/rooms/:id/items/:itemId/revote with participantId", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const api = createRoomApi(baseUrl);
      await api.revote("room-1", "item-1", "facilitator-1");

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.participantId).toBe("facilitator-1");
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/rooms/room-1/items/item-1/revote`,
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("3.4.7 recordFinalEstimate", () => {
    it("POSTs to /api/rooms/:id/items/:itemId/finalize with participantId and cardValue", async () => {
      const mockItem = {
        id: "item-1",
        finalEstimate: "8",
        finalEstimateRecordedAt: 1234567890,
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ item: mockItem }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const api = createRoomApi(baseUrl);
      const result = await api.recordFinalEstimate(
        "room-1",
        "item-1",
        "facilitator-1",
        "8"
      );

      expect(result.item.finalEstimate).toBe("8");
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toMatchObject({
        participantId: "facilitator-1",
        cardValue: "8",
      });
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/rooms/room-1/items/item-1/finalize`,
        expect.objectContaining({ method: "POST" })
      );
    });
  });
});
