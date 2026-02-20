/**
 * Data model types for Planning Poker.
 * See drivin-design/data-model.MD for full specification.
 */

export enum RoomState {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export enum DeckType {
  FIBONACCI = "FIBONACCI",
  LINEAR = "LINEAR",
  TSHIRT = "TSHIRT",
}

export enum ParticipantRole {
  FACILITATOR = "FACILITATOR",
  PARTICIPANT = "PARTICIPANT",
  OBSERVER = "OBSERVER",
}

export enum RoundState {
  VOTING = "VOTING",
  REVEALED = "REVEALED",
  FINALIZED = "FINALIZED",
}

export interface Room {
  id: string;
  name: string;
  deckType: DeckType;
  deckValues: string[];
  state: RoomState;
  facilitatorId: string;
  createdAt: number;
  closedAt: number | null;
  userId?: string | null;
}

export interface Participant {
  id: string;
  roomId: string;
  displayName: string;
  role: ParticipantRole;
  joinedAt: number;
  leftAt: number | null;
  isActive: boolean;
  userId?: string | null;
  sessionId?: string | null;
}

export interface Item {
  id: string;
  roomId: string;
  title: string;
  description: string | null;
  order: number;
  finalEstimate: string | null;
  finalEstimateRecordedAt: number | null;
  createdAt: number;
  currentRoundId: string | null;
}

export interface Round {
  id: string;
  itemId: string;
  roundNumber: number;
  state: RoundState;
  votesRevealedAt: number | null;
  createdAt: number;
  finalizedAt: number | null;
}

export interface Vote {
  id: string;
  roundId: string;
  participantId: string;
  cardValue: string;
  votedAt: number;
  isRevealed: boolean;
}

export interface Session {
  id: string;
  roomId: string;
  startedAt: number;
  closedAt: number | null;
  facilitatorId: string;
  facilitatorName: string;
  totalItems: number;
  totalParticipants: number;
  userId?: string | null;
}
