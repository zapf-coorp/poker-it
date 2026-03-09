/**
 * Phase 2.2 — Server REST API for rooms.
 * Tests: Create room, Get room, Join room, Leave room, Close room.
 * See drivin-design/tasks.MD §2.2, spec.MD §5.1–5.5.
 */

import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/index.js";
import { rooms, participants, sessions } from "../src/store.js";
import { DeckType, RoomState, ParticipantRole } from "shared";

const AUTH_HEADER = { Authorization: "Bearer mock-token-valid" };

describe("Phase 2 — Room API", () => {
  beforeEach(() => {
    rooms.clear();
    participants.clear();
    sessions.clear();
  });

  describe("2.2.1 POST /api/rooms — Create room", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await request(app)
        .post("/api/rooms")
        .send({ name: "Planning Session", deckType: DeckType.FIBONACCI })
        .expect(401);
      expect(res.body.error).toContain("Authentication required");
    });

    it("creates room with name and deckType, returns room, participant, shareableLink", async () => {
      const res = await request(app)
        .post("/api/rooms")
        .set(AUTH_HEADER)
        .send({ name: "Planning Session", deckType: DeckType.FIBONACCI })
        .expect(201);

      expect(res.body).toMatchObject({
        room: {
          name: "Planning Session",
          deckType: DeckType.FIBONACCI,
          state: RoomState.OPEN,
          deckValues: expect.any(Array),
        },
        participant: {
          displayName: "Planning Session",
          role: ParticipantRole.FACILITATOR,
        },
        shareableLink: expect.stringContaining("/room/"),
      });
      expect(res.body.room.id).toBeDefined();
      expect(res.body.room.facilitatorId).toBe(res.body.participant.id);
      expect(res.body.shareableLink).toContain(res.body.room.id);
    });

    it("uses FIBONACCI deck when deckType omitted", async () => {
      const res = await request(app)
        .post("/api/rooms")
        .set(AUTH_HEADER)
        .send({ name: "Default Deck" })
        .expect(201);
      expect(res.body.room.deckType).toBe(DeckType.FIBONACCI);
      expect(res.body.room.deckValues).toContain("8");
    });

    it("accepts LINEAR and TSHIRT deck types", async () => {
      const linearRes = await request(app)
        .post("/api/rooms")
        .set(AUTH_HEADER)
        .send({ name: "Linear Room", deckType: DeckType.LINEAR })
        .expect(201);
      expect(linearRes.body.room.deckType).toBe(DeckType.LINEAR);
      expect(linearRes.body.room.deckValues).toContain("5");

      const tshirtRes = await request(app)
        .post("/api/rooms")
        .set(AUTH_HEADER)
        .send({ name: "T-shirt Room", deckType: DeckType.TSHIRT })
        .expect(201);
      expect(tshirtRes.body.room.deckType).toBe(DeckType.TSHIRT);
      expect(tshirtRes.body.room.deckValues).toContain("M");
    });

    it("returns 400 when name is missing", async () => {
      const res = await request(app)
        .post("/api/rooms")
        .set(AUTH_HEADER)
        .send({ deckType: DeckType.FIBONACCI })
        .expect(400);
      expect(res.body.error).toContain("name");
    });

    it("returns 400 when deckType is invalid", async () => {
      const res = await request(app)
        .post("/api/rooms")
        .set(AUTH_HEADER)
        .send({ name: "Test", deckType: "INVALID" })
        .expect(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe("2.2.2 GET /api/rooms/:id — Get room", () => {
    it("returns room by ID with deckValues, state, name", async () => {
      const createRes = await request(app)
        .post("/api/rooms")
        .set(AUTH_HEADER)
        .send({ name: "My Room", deckType: DeckType.FIBONACCI });
      const roomId = createRes.body.room.id;

      const res = await request(app).get(`/api/rooms/${roomId}`).expect(200);
      expect(res.body).toMatchObject({
        id: roomId,
        name: "My Room",
        deckType: DeckType.FIBONACCI,
        state: RoomState.OPEN,
        deckValues: expect.any(Array),
      });
    });

    it("returns 404 when room not found", async () => {
      await request(app)
        .get("/api/rooms/00000000-0000-0000-0000-000000000000")
        .expect(404);
    });
  });

  describe("2.2.3 POST /api/rooms/:id/join — Join room", () => {
    it("joins as participant by default, returns participant and room", async () => {
      const createRes = await request(app)
        .post("/api/rooms")
        .set(AUTH_HEADER)
        .send({ name: "Join Test", deckType: DeckType.FIBONACCI });
      const roomId = createRes.body.room.id;

      const res = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Alice" })
        .expect(201);

      expect(res.body.participant).toMatchObject({
        displayName: "Alice",
        role: ParticipantRole.PARTICIPANT,
        roomId,
      });
      expect(res.body.room.id).toBe(roomId);
    });

    it("joins as observer when role is OBSERVER", async () => {
      const createRes = await request(app)
        .post("/api/rooms")
        .set(AUTH_HEADER)
        .send({ name: "Observer Test", deckType: DeckType.FIBONACCI });
      const roomId = createRes.body.room.id;

      const res = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Bob", role: "OBSERVER" })
        .expect(201);

      expect(res.body.participant.role).toBe(ParticipantRole.OBSERVER);
    });

    it("returns 400 when displayName is missing", async () => {
      const createRes = await request(app)
        .post("/api/rooms")
        .set(AUTH_HEADER)
        .send({ name: "Test", deckType: DeckType.FIBONACCI });
      const roomId = createRes.body.room.id;

      await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({})
        .expect(400);
    });

    it("returns 404 when room not found", async () => {
      await request(app)
        .post("/api/rooms/00000000-0000-0000-0000-000000000000/join")
        .send({ displayName: "Alice" })
        .expect(404);
    });

    it("returns 403 when room is closed", async () => {
      const createRes = await request(app)
        .post("/api/rooms")
        .set(AUTH_HEADER)
        .send({ name: "Closed Room", deckType: DeckType.FIBONACCI });
      const roomId = createRes.body.room.id;
      const facilitatorId = createRes.body.participant.id;

      await request(app)
        .post(`/api/rooms/${roomId}/close`)
        .send({ participantId: facilitatorId })
        .expect(200);

      await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Late Joiner" })
        .expect(403);
    });
  });

  describe("2.2.4 POST /api/rooms/:id/leave — Leave room", () => {
    it("marks participant inactive, returns success", async () => {
      const createRes = await request(app)
        .post("/api/rooms")
        .set(AUTH_HEADER)
        .send({ name: "Leave Test", deckType: DeckType.FIBONACCI });
      const roomId = createRes.body.room.id;

      const joinRes = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Leaver" });
      const participantId = joinRes.body.participant.id;

      await request(app)
        .post(`/api/rooms/${roomId}/leave`)
        .send({ participantId })
        .expect(200);

      const participantsRes = await request(app).get(`/api/rooms/${roomId}/participants`);
      const activeNames = participantsRes.body.participants.map((p: { displayName: string }) => p.displayName);
      expect(activeNames).not.toContain("Leaver");
    });

    it("is idempotent when participant already left", async () => {
      const createRes = await request(app)
        .post("/api/rooms")
        .set(AUTH_HEADER)
        .send({ name: "Idempotent Leave", deckType: DeckType.FIBONACCI });
      const roomId = createRes.body.room.id;

      const joinRes = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Double Leave" });
      const participantId = joinRes.body.participant.id;

      await request(app)
        .post(`/api/rooms/${roomId}/leave`)
        .send({ participantId })
        .expect(200);
      await request(app)
        .post(`/api/rooms/${roomId}/leave`)
        .send({ participantId })
        .expect(200);
    });

    it("returns 400 when participantId is missing", async () => {
      const createRes = await request(app)
        .post("/api/rooms")
        .set(AUTH_HEADER)
        .send({ name: "Test", deckType: DeckType.FIBONACCI });
      const roomId = createRes.body.room.id;

      await request(app)
        .post(`/api/rooms/${roomId}/leave`)
        .send({})
        .expect(400);
    });
  });

  describe("2.2.5 POST /api/rooms/:id/close — Close room", () => {
    it("closes room when facilitator requests it", async () => {
      const createRes = await request(app)
        .post("/api/rooms")
        .set(AUTH_HEADER)
        .send({ name: "Close Test", deckType: DeckType.FIBONACCI });
      const roomId = createRes.body.room.id;
      const facilitatorId = createRes.body.participant.id;

      await request(app)
        .post(`/api/rooms/${roomId}/close`)
        .send({ participantId: facilitatorId })
        .expect(200);

      const getRes = await request(app).get(`/api/rooms/${roomId}`);
      expect(getRes.body.state).toBe(RoomState.CLOSED);
      expect(getRes.body.closedAt).toBeDefined();
    });

    it("returns 403 when non-facilitator tries to close", async () => {
      const createRes = await request(app)
        .post("/api/rooms")
        .set(AUTH_HEADER)
        .send({ name: "Close Auth Test", deckType: DeckType.FIBONACCI });
      const roomId = createRes.body.room.id;

      const joinRes = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Participant" });
      const participantId = joinRes.body.participant.id;

      const res = await request(app)
        .post(`/api/rooms/${roomId}/close`)
        .send({ participantId })
        .expect(403);
      expect(res.body.error).toContain("facilitator");
    });

    it("is idempotent when room already closed", async () => {
      const createRes = await request(app)
        .post("/api/rooms")
        .set(AUTH_HEADER)
        .send({ name: "Double Close", deckType: DeckType.FIBONACCI });
      const roomId = createRes.body.room.id;
      const facilitatorId = createRes.body.participant.id;

      await request(app)
        .post(`/api/rooms/${roomId}/close`)
        .send({ participantId: facilitatorId })
        .expect(200);
      await request(app)
        .post(`/api/rooms/${roomId}/close`)
        .send({ participantId: facilitatorId })
        .expect(200);
    });

    it("returns 400 when participantId is missing", async () => {
      const createRes = await request(app)
        .post("/api/rooms")
        .set(AUTH_HEADER)
        .send({ name: "Test", deckType: DeckType.FIBONACCI });
      const roomId = createRes.body.room.id;

      await request(app)
        .post(`/api/rooms/${roomId}/close`)
        .send({})
        .expect(400);
    });
  });

  describe("GET /api/rooms/:id/participants", () => {
    it("returns active participants in room", async () => {
      const createRes = await request(app)
        .post("/api/rooms")
        .set(AUTH_HEADER)
        .send({ name: "Participants Test", deckType: DeckType.FIBONACCI });
      const roomId = createRes.body.room.id;

      await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Alice" });
      await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .send({ displayName: "Bob", role: "OBSERVER" });

      const res = await request(app).get(`/api/rooms/${roomId}/participants`).expect(200);
      expect(res.body.participants).toHaveLength(3); // facilitator + Alice + Bob
      const names = res.body.participants.map((p: { displayName: string }) => p.displayName);
      expect(names).toContain("Participants Test");
      expect(names).toContain("Alice");
      expect(names).toContain("Bob");
    });
  });
});
