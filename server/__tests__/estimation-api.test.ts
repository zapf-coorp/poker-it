/**
 * Phase 3.2 — Server REST API for estimation.
 * Tests: Add item, Edit item, Remove item, Cast vote, Reveal votes, Re-vote, Record final estimate.
 * See drivin-design/tasks.MD §3.2, spec.MD §6.1–6.6.
 */

import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/index.js";
import { rooms, participants, sessions, items, rounds, votes } from "../src/store.js";
import { DeckType, ParticipantRole, RoundState } from "shared";

const AUTH_HEADER = { Authorization: "Bearer mock-token-valid" };

describe("Phase 3 — Estimation API", () => {
  beforeEach(() => {
    rooms.clear();
    participants.clear();
    sessions.clear();
    items.clear();
    rounds.clear();
    votes.clear();
  });

  async function createRoomWithItem() {
    const createRes = await request(app)
      .post("/api/rooms")
      .set(AUTH_HEADER)
      .send({ name: "Estimation Room", deckType: DeckType.FIBONACCI });
    const roomId = createRes.body.room.id;
    const facilitatorId = createRes.body.participant.id;

    const addRes = await request(app)
      .post(`/api/rooms/${roomId}/items`)
      .send({ title: "User Story 1", description: "As a user...", participantId: facilitatorId });
    const itemId = addRes.body.id;

    return { roomId, facilitatorId, itemId };
  }

  describe("3.2.1 POST /api/rooms/:id/items — Add item", () => {
    it("creates item with title and description, first round in VOTING", async () => {
      const { roomId, facilitatorId } = await createRoomWithItem();

      const res = await request(app)
        .post(`/api/rooms/${roomId}/items`)
        .send({ title: "Story 2", description: "Optional desc", participantId: facilitatorId })
        .expect(201);

      expect(res.body).toMatchObject({
        title: "Story 2",
        description: "Optional desc",
        roomId,
        order: 2,
        finalEstimate: null,
        currentRoundId: expect.any(String),
      });
    });

    it("returns 400 when title is missing", async () => {
      const { roomId, facilitatorId } = await createRoomWithItem();

      await request(app)
        .post(`/api/rooms/${roomId}/items`)
        .send({ description: "Desc only", participantId: facilitatorId })
        .expect(400);
    });

    it("returns 400 when non-facilitator adds item", async () => {
      const { roomId } = await createRoomWithItem();
      const joinRes = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Participant" });
      const participantId = joinRes.body.participant.id;

      const res = await request(app)
        .post(`/api/rooms/${roomId}/items`)
        .send({ title: "Hacked", participantId })
        .expect(400);
      expect(res.body.error).toContain("facilitator");
    });

    it("returns 403 when room is closed", async () => {
      const { roomId, facilitatorId } = await createRoomWithItem();

      await request(app)
        .post(`/api/rooms/${roomId}/close`)
        .send({ participantId: facilitatorId })
        .expect(200);

      await request(app)
        .post(`/api/rooms/${roomId}/items`)
        .send({ title: "Too late", participantId: facilitatorId })
        .expect(403);
    });
  });

  describe("3.2.2 PATCH /api/rooms/:id/items/:itemId — Edit item", () => {
    it("updates item title and description before voting", async () => {
      const { roomId, facilitatorId, itemId } = await createRoomWithItem();

      const res = await request(app)
        .patch(`/api/rooms/${roomId}/items/${itemId}`)
        .send({ title: "Updated Title", description: "Updated desc", participantId: facilitatorId })
        .expect(200);

      expect(res.body.title).toBe("Updated Title");
      expect(res.body.description).toBe("Updated desc");
    });

    it("returns 400 when participantId is missing", async () => {
      const { roomId, itemId } = await createRoomWithItem();

      await request(app)
        .patch(`/api/rooms/${roomId}/items/${itemId}`)
        .send({ title: "Updated" })
        .expect(400);
    });

    it("returns 400 when non-facilitator edits", async () => {
      const { roomId, itemId } = await createRoomWithItem();
      const joinRes = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Participant" });
      const participantId = joinRes.body.participant.id;

      const res = await request(app)
        .patch(`/api/rooms/${roomId}/items/${itemId}`)
        .send({ title: "Hacked", participantId })
        .expect(400);
      expect(res.body.error).toContain("facilitator");
    });
  });

  describe("3.2.3 DELETE /api/rooms/:id/items/:itemId — Remove item", () => {
    it("removes item and associated rounds/votes", async () => {
      const { roomId, facilitatorId, itemId } = await createRoomWithItem();

      await request(app)
        .delete(`/api/rooms/${roomId}/items/${itemId}`)
        .query({ participantId: facilitatorId })
        .expect(200);

      const itemsRes = await request(app).get(`/api/rooms/${roomId}/items`);
      expect(itemsRes.body.items).toHaveLength(0);
    });

    it("accepts participantId in query or body", async () => {
      const { roomId, facilitatorId, itemId } = await createRoomWithItem();

      await request(app)
        .delete(`/api/rooms/${roomId}/items/${itemId}`)
        .send({ participantId: facilitatorId })
        .expect(200);
    });

    it("returns 400 when non-facilitator removes", async () => {
      const { roomId, itemId } = await createRoomWithItem();
      const joinRes = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Participant" });
      const participantId = joinRes.body.participant.id;

      const res = await request(app)
        .delete(`/api/rooms/${roomId}/items/${itemId}`)
        .query({ participantId })
        .expect(400);
      expect(res.body.error).toContain("facilitator");
    });
  });

  describe("3.2.4 POST /api/rooms/:id/items/:itemId/vote — Cast vote", () => {
    it("creates vote for participant", async () => {
      const { roomId, itemId } = await createRoomWithItem();
      const joinRes = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Voter" });
      const participantId = joinRes.body.participant.id;

      await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/vote`)
        .send({ participantId, cardValue: "5" })
        .expect(200);

      const itemsRes = await request(app).get(`/api/rooms/${roomId}/items`);
      const item = itemsRes.body.items.find((i: { id: string }) => i.id === itemId);
      expect(item.currentRound.votedCount).toBe(1);
    });

    it("allows facilitator to vote", async () => {
      const { roomId, facilitatorId, itemId } = await createRoomWithItem();

      await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/vote`)
        .send({ participantId: facilitatorId, cardValue: "8" })
        .expect(200);
    });

    it("allows changing vote before reveal", async () => {
      const { roomId, itemId } = await createRoomWithItem();
      const joinRes = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Voter" });
      const participantId = joinRes.body.participant.id;

      await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/vote`)
        .send({ participantId, cardValue: "5" })
        .expect(200);
      await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/vote`)
        .send({ participantId, cardValue: "8" })
        .expect(200);
    });

    it("returns 400 when cardValue is invalid", async () => {
      const { roomId, itemId } = await createRoomWithItem();
      const joinRes = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Voter" });
      const participantId = joinRes.body.participant.id;

      await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/vote`)
        .send({ participantId, cardValue: "99" })
        .expect(400);
    });

    it("returns 400 when observer tries to vote", async () => {
      const { roomId, itemId } = await createRoomWithItem();
      const joinRes = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Observer", role: "OBSERVER" });
      const participantId = joinRes.body.participant.id;

      const res = await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/vote`)
        .send({ participantId, cardValue: "5" })
        .expect(400);
      expect(res.body.error).toContain("Observer");
    });
  });

  describe("3.2.5 POST /api/rooms/:id/items/:itemId/reveal — Reveal votes", () => {
    it("sets round to REVEALED, returns votes and statistics", async () => {
      const { roomId, facilitatorId, itemId } = await createRoomWithItem();
      const joinRes = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Voter" });
      const participantId = joinRes.body.participant.id;

      await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/vote`)
        .send({ participantId, cardValue: "5" });
      await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/vote`)
        .send({ participantId: facilitatorId, cardValue: "8" });

      const res = await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/reveal`)
        .send({ participantId: facilitatorId })
        .expect(200);

      expect(res.body.votes).toHaveLength(2);
      expect(res.body.statistics).toMatchObject({
        average: expect.any(Number),
        median: expect.any(Number),
        suggestedEstimate: expect.any(String),
        voteDistribution: expect.any(Object),
      });
    });

    it("returns 403 when non-facilitator reveals", async () => {
      const { roomId, itemId } = await createRoomWithItem();
      const joinRes = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Participant" });
      const participantId = joinRes.body.participant.id;

      await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/reveal`)
        .send({ participantId })
        .expect(403);
    });
  });

  describe("3.2.6 POST /api/rooms/:id/items/:itemId/revote — Re-vote", () => {
    it("creates new round, clears votes", async () => {
      const { roomId, facilitatorId, itemId } = await createRoomWithItem();
      const joinRes = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Voter" });
      const participantId = joinRes.body.participant.id;

      await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/vote`)
        .send({ participantId, cardValue: "5" });
      await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/reveal`)
        .send({ participantId: facilitatorId });

      await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/revote`)
        .send({ participantId: facilitatorId })
        .expect(200);

      const itemsRes = await request(app).get(`/api/rooms/${roomId}/items`);
      const item = itemsRes.body.items.find((i: { id: string }) => i.id === itemId);
      expect(item.currentRound.roundNumber).toBe(2);
      expect(item.currentRound.votedCount).toBe(0);
    });

    it("returns 403 when non-facilitator revotes", async () => {
      const { roomId, facilitatorId, itemId } = await createRoomWithItem();
      const joinRes = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Participant" });
      const participantId = joinRes.body.participant.id;

      await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/reveal`)
        .send({ participantId: facilitatorId });
      await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/revote`)
        .send({ participantId })
        .expect(403);
    });
  });

  describe("3.2.7 POST /api/rooms/:id/items/:itemId/finalize — Record final estimate", () => {
    it("sets item finalEstimate, round FINALIZED", async () => {
      const { roomId, facilitatorId, itemId } = await createRoomWithItem();
      const joinRes = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Voter" });
      const participantId = joinRes.body.participant.id;

      await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/vote`)
        .send({ participantId, cardValue: "5" });
      await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/vote`)
        .send({ participantId: facilitatorId, cardValue: "8" });
      await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/reveal`)
        .send({ participantId: facilitatorId });

      const res = await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/finalize`)
        .send({ participantId: facilitatorId, cardValue: "8" })
        .expect(200);

      expect(res.body.item.finalEstimate).toBe("8");
      expect(res.body.item.finalEstimateRecordedAt).toBeDefined();
      expect(res.body.item.currentRoundId).toBeNull();
    });

    it("returns 403 when non-facilitator finalizes", async () => {
      const { roomId, facilitatorId, itemId } = await createRoomWithItem();
      const joinRes = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Participant" });
      const participantId = joinRes.body.participant.id;

      await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/reveal`)
        .send({ participantId: facilitatorId });
      await request(app)
        .post(`/api/rooms/${roomId}/items/${itemId}/finalize`)
        .send({ participantId, cardValue: "5" })
        .expect(403);
    });
  });

  describe("GET /api/rooms/:id/items", () => {
    it("returns items with currentRound (state, votedCount)", async () => {
      const { roomId, itemId } = await createRoomWithItem();

      const res = await request(app).get(`/api/rooms/${roomId}/items`).expect(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0]).toMatchObject({
        id: itemId,
        title: "User Story 1",
        currentRound: {
          state: RoundState.VOTING,
          roundNumber: 1,
        },
      });
    });
  });
});
