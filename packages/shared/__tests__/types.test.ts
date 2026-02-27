/**
 * Phase 1.2.3 — Shared package types.
 * Verifies that Room, Participant, Item, Round, Vote, Session and enums
 * (RoomState, DeckType, ParticipantRole, RoundState) are exported and match data-model.MD.
 */

import { describe, it, expect } from "vitest";
import {
  RoomState,
  DeckType,
  ParticipantRole,
  RoundState,
  type Room,
  type Participant,
  type Item,
  type Round,
  type Vote,
  type Session,
} from "../src/types.js";

describe("Phase 1 — Shared types", () => {
  describe("Enums", () => {
    it("exports RoomState with OPEN and CLOSED", () => {
      expect(RoomState.OPEN).toBe("OPEN");
      expect(RoomState.CLOSED).toBe("CLOSED");
    });

    it("exports DeckType with FIBONACCI, LINEAR, TSHIRT", () => {
      expect(DeckType.FIBONACCI).toBe("FIBONACCI");
      expect(DeckType.LINEAR).toBe("LINEAR");
      expect(DeckType.TSHIRT).toBe("TSHIRT");
    });

    it("exports ParticipantRole with FACILITATOR, PARTICIPANT, OBSERVER", () => {
      expect(ParticipantRole.FACILITATOR).toBe("FACILITATOR");
      expect(ParticipantRole.PARTICIPANT).toBe("PARTICIPANT");
      expect(ParticipantRole.OBSERVER).toBe("OBSERVER");
    });

    it("exports RoundState with VOTING, REVEALED, FINALIZED", () => {
      expect(RoundState.VOTING).toBe("VOTING");
      expect(RoundState.REVEALED).toBe("REVEALED");
      expect(RoundState.FINALIZED).toBe("FINALIZED");
    });
  });

  describe("Interfaces — structure matches data-model.MD", () => {
    it("Room has required fields: id, name, deckType, deckValues, state, facilitatorId, createdAt, closedAt", () => {
      const room: Room = {
        id: "uuid",
        name: "Test",
        deckType: DeckType.FIBONACCI,
        deckValues: ["0", "1", "2"],
        state: RoomState.OPEN,
        facilitatorId: "uuid",
        createdAt: 0,
        closedAt: null,
      };
      expect(room.name).toBe("Test");
      expect(room.deckType).toBe(DeckType.FIBONACCI);
      expect(room.state).toBe(RoomState.OPEN);
    });

    it("Participant has required fields: id, roomId, displayName, role, joinedAt, leftAt, isActive", () => {
      const participant: Participant = {
        id: "uuid",
        roomId: "uuid",
        displayName: "Alice",
        role: ParticipantRole.PARTICIPANT,
        joinedAt: 0,
        leftAt: null,
        isActive: true,
      };
      expect(participant.displayName).toBe("Alice");
      expect(participant.role).toBe(ParticipantRole.PARTICIPANT);
    });

    it("Item has required fields: id, roomId, title, description, order, finalEstimate, finalEstimateRecordedAt, createdAt, currentRoundId", () => {
      const item: Item = {
        id: "uuid",
        roomId: "uuid",
        title: "Story",
        description: null,
        order: 1,
        finalEstimate: null,
        finalEstimateRecordedAt: null,
        createdAt: 0,
        currentRoundId: null,
      };
      expect(item.title).toBe("Story");
      expect(item.order).toBe(1);
    });

    it("Round has required fields: id, itemId, roundNumber, state, votesRevealedAt, createdAt, finalizedAt", () => {
      const round: Round = {
        id: "uuid",
        itemId: "uuid",
        roundNumber: 1,
        state: RoundState.VOTING,
        votesRevealedAt: null,
        createdAt: 0,
        finalizedAt: null,
      };
      expect(round.roundNumber).toBe(1);
      expect(round.state).toBe(RoundState.VOTING);
    });

    it("Vote has required fields: id, roundId, participantId, cardValue, votedAt, isRevealed", () => {
      const vote: Vote = {
        id: "uuid",
        roundId: "uuid",
        participantId: "uuid",
        cardValue: "5",
        votedAt: 0,
        isRevealed: false,
      };
      expect(vote.cardValue).toBe("5");
      expect(vote.isRevealed).toBe(false);
    });

    it("Session has required fields: id, roomId, startedAt, closedAt, facilitatorId, facilitatorName, totalItems, totalParticipants", () => {
      const session: Session = {
        id: "uuid",
        roomId: "uuid",
        startedAt: 0,
        closedAt: null,
        facilitatorId: "uuid",
        facilitatorName: "Alice",
        totalItems: 0,
        totalParticipants: 1,
      };
      expect(session.facilitatorName).toBe("Alice");
      expect(session.totalItems).toBe(0);
    });
  });
});
