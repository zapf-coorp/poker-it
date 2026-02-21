/**
 * In-memory data store for Planning Poker.
 * Phase 2.1 — Room, Participant, Session storage and room creation logic.
 * See drivin-design/data-model.MD and tasks.MD §2.1.
 */

import { randomUUID } from "node:crypto";
import {
  type Room,
  type Participant,
  type Session,
  RoomState,
  DeckType,
  ParticipantRole,
} from "shared";
import { DECKS } from "shared";

// --- Data stores (tasks 2.1.1, 2.1.2, 2.1.3) ---

export const rooms = new Map<string, Room>();
export const participants = new Map<string, Participant>();
export const sessions = new Map<string, Session>();

// --- Room creation (task 2.1.4) ---

export interface CreateRoomInput {
  name: string;
  deckType: DeckType;
  /** Base URL for shareable link (e.g. "http://localhost:5173"). Omit for path-only. */
  baseUrl?: string;
}

export interface CreateRoomResult {
  room: Room;
  participant: Participant;
  session: Session;
  shareableLink: string;
}

const ROOM_NAME_MAX_LENGTH = 200;

/**
 * Create a room with facilitator participant and session.
 * Deck values come from shared deck constants.
 */
export function createRoom(input: CreateRoomInput): CreateRoomResult {
  const { name, deckType, baseUrl } = input;

  const trimmedName = name?.trim() ?? "";
  if (!trimmedName) {
    throw new Error("Room name is required");
  }
  if (trimmedName.length > ROOM_NAME_MAX_LENGTH) {
    throw new Error(`Room name must be at most ${ROOM_NAME_MAX_LENGTH} characters`);
  }

  const deck = DECKS[deckType];
  if (!deck) {
    throw new Error(`Unknown deck type: ${deckType}`);
  }

  const now = Date.now();
  const roomId = randomUUID();
  const participantId = randomUUID();

  const room: Room = {
    id: roomId,
    name: trimmedName,
    deckType,
    deckValues: [...deck.deckValues],
    state: RoomState.OPEN,
    facilitatorId: participantId,
    createdAt: now,
    closedAt: null,
  };

  const participant: Participant = {
    id: participantId,
    roomId,
    displayName: trimmedName,
    role: ParticipantRole.FACILITATOR,
    joinedAt: now,
    leftAt: null,
    isActive: true,
  };

  const session: Session = {
    id: roomId,
    roomId,
    startedAt: now,
    closedAt: null,
    facilitatorId: participantId,
    facilitatorName: trimmedName,
    totalItems: 0,
    totalParticipants: 1,
  };

  const path = `/room/${roomId}`;
  const shareableLink = baseUrl ? `${baseUrl.replace(/\/$/, "")}${path}` : path;

  rooms.set(roomId, room);
  participants.set(participantId, participant);
  sessions.set(roomId, session);

  return { room, participant, session, shareableLink };
}

// --- Join, leave, close (for Phase 2.2) ---

const DISPLAY_NAME_MAX_LENGTH = 100;

export interface JoinRoomInput {
  roomId: string;
  displayName: string;
  role?: ParticipantRole;
}

export interface JoinRoomResult {
  participant: Participant;
  room: Room;
}

export function joinRoom(input: JoinRoomInput): JoinRoomResult {
  const { roomId, displayName, role = ParticipantRole.PARTICIPANT } = input;

  const room = rooms.get(roomId);
  if (!room) {
    throw new Error("Room not found");
  }
  if (room.state === RoomState.CLOSED) {
    throw new Error("Room is closed");
  }

  const trimmedName = displayName?.trim() ?? "";
  if (!trimmedName) {
    throw new Error("Display name is required");
  }
  if (trimmedName.length > DISPLAY_NAME_MAX_LENGTH) {
    throw new Error(`Display name must be at most ${DISPLAY_NAME_MAX_LENGTH} characters`);
  }

  const now = Date.now();
  const participantId = randomUUID();

  const participant: Participant = {
    id: participantId,
    roomId,
    displayName: trimmedName,
    role,
    joinedAt: now,
    leftAt: null,
    isActive: true,
  };

  participants.set(participantId, participant);

  const session = sessions.get(roomId);
  if (session) {
    session.totalParticipants += 1;
  }

  return { participant, room };
}

export function leaveRoom(roomId: string, participantId: string): void {
  const participant = participants.get(participantId);
  if (!participant || participant.roomId !== roomId) {
    throw new Error("Participant not found");
  }
  if (!participant.isActive) {
    return; // Idempotent
  }

  const now = Date.now();
  participant.isActive = false;
  participant.leftAt = now;
}

export function closeRoom(roomId: string, participantId: string): void {
  const room = rooms.get(roomId);
  if (!room) {
    throw new Error("Room not found");
  }
  if (room.facilitatorId !== participantId) {
    throw new Error("Only the facilitator can close the room");
  }
  if (room.state === RoomState.CLOSED) {
    return; // Idempotent
  }

  const now = Date.now();
  room.state = RoomState.CLOSED;
  room.closedAt = now;

  const session = sessions.get(roomId);
  if (session) {
    session.closedAt = now;
  }
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function getActiveParticipants(roomId: string): Participant[] {
  return [...participants.values()]
    .filter((p) => p.roomId === roomId && p.isActive)
    .sort((a, b) => a.joinedAt - b.joinedAt);
}
