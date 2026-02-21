/**
 * In-memory data store for Planning Poker.
 * Phase 2.1, 3.1 — Room, Participant, Session, Item, Round, Vote.
 * See drivin-design/data-model.MD and tasks.MD §2.1, §3.1.
 */

import { randomUUID } from "node:crypto";
import {
  type Room,
  type Participant,
  type Session,
  type Item,
  type Round,
  type Vote,
  type VoteStatistics,
  RoomState,
  DeckType,
  ParticipantRole,
  RoundState,
} from "shared";
import { DECKS } from "shared";

// --- Data stores (tasks 2.1.1, 2.1.2, 2.1.3, 3.1.1, 3.1.2, 3.1.3) ---

export const rooms = new Map<string, Room>();
export const participants = new Map<string, Participant>();
export const sessions = new Map<string, Session>();
export const items = new Map<string, Item>();
export const rounds = new Map<string, Round>();
export const votes = new Map<string, Vote>();

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

// --- Estimation Process (Phase 3.1, 3.2) ---

const ITEM_TITLE_MAX_LENGTH = 200;
const ITEM_DESCRIPTION_MAX_LENGTH = 2000;

/** T-shirt size to number for averaging */
const TSHIRT_TO_NUM: Record<string, number> = { XS: 1, S: 2, M: 3, L: 4, XL: 5 };

function toNumeric(value: string, deckValues: string[]): number | null {
  const n = Number(value);
  if (Number.isFinite(n)) return n;
  return TSHIRT_TO_NUM[value] ?? null;
}

function computeVoteStatistics(voteList: Vote[], deckValues: string[]): VoteStatistics {
  const numericValues: number[] = [];
  const distribution: Record<string, number> = {};
  for (const v of voteList) {
    distribution[v.cardValue] = (distribution[v.cardValue] ?? 0) + 1;
    const n = toNumeric(v.cardValue, deckValues);
    if (n !== null) numericValues.push(n);
  }
  const sorted = [...numericValues].sort((a, b) => a - b);
  const len = sorted.length;
  const average = len > 0 ? sorted.reduce((a, b) => a + b, 0) / len : 0;
  const median = len > 0 ? (sorted[Math.floor((len - 1) / 2)]! + sorted[Math.ceil((len - 1) / 2)]!) / 2 : 0;
  const highest = voteList.reduce((best, v) => {
    const n = toNumeric(v.cardValue, deckValues);
    const b = toNumeric(best, deckValues);
    if (n === null) return best;
    if (b === null) return v.cardValue;
    return n > b ? v.cardValue : best;
  }, voteList[0]?.cardValue ?? "");
  const lowest = voteList.reduce((best, v) => {
    const n = toNumeric(v.cardValue, deckValues);
    const b = toNumeric(best, deckValues);
    if (n === null) return best;
    if (b === null) return v.cardValue;
    return n < b ? v.cardValue : best;
  }, voteList[0]?.cardValue ?? "");
  let suggestedEstimate = "";
  if (len > 0) {
    const rounded = Math.round(average);
    const numToDeck = deckValues.map((d) => ({ v: d, n: toNumeric(d, deckValues) }));
    const numericDeck = numToDeck.filter((x) => x.n !== null);
    if (numericDeck.length > 0) {
      const nearest = numericDeck.reduce((a, b) =>
        Math.abs((a.n ?? 0) - rounded) <= Math.abs((b.n ?? 0) - rounded) ? a : b
      );
      suggestedEstimate = nearest.v;
    } else {
      suggestedEstimate = String(rounded);
    }
  }
  return { average, median, highest, lowest, suggestedEstimate, voteDistribution: distribution };
}

export interface AddItemInput {
  roomId: string;
  title: string;
  description?: string | null;
  participantId: string;
}

export function addItem(input: AddItemInput): Item {
  const { roomId, title, description, participantId } = input;
  const room = rooms.get(roomId);
  if (!room) throw new Error("Room not found");
  if (room.state === RoomState.CLOSED) throw new Error("Room is closed");
  if (room.facilitatorId !== participantId) throw new Error("Only the facilitator can add items");

  const trimmedTitle = title?.trim() ?? "";
  if (!trimmedTitle) throw new Error("Title is required");
  if (trimmedTitle.length > ITEM_TITLE_MAX_LENGTH) throw new Error(`Title must be at most ${ITEM_TITLE_MAX_LENGTH} characters`);
  const desc = description?.trim() ?? null;
  if (desc && desc.length > ITEM_DESCRIPTION_MAX_LENGTH) throw new Error(`Description must be at most ${ITEM_DESCRIPTION_MAX_LENGTH} characters`);

  const roomItems = [...items.values()].filter((i) => i.roomId === roomId).sort((a, b) => a.order - b.order);
  const nextOrder = roomItems.length === 0 ? 1 : Math.max(...roomItems.map((i) => i.order)) + 1;

  const now = Date.now();
  const itemId = randomUUID();
  const roundId = randomUUID();

  const item: Item = {
    id: itemId,
    roomId,
    title: trimmedTitle,
    description: desc,
    order: nextOrder,
    finalEstimate: null,
    finalEstimateRecordedAt: null,
    createdAt: now,
    currentRoundId: roundId,
  };

  const round: Round = {
    id: roundId,
    itemId,
    roundNumber: 1,
    state: RoundState.VOTING,
    votesRevealedAt: null,
    createdAt: now,
    finalizedAt: null,
  };

  items.set(itemId, item);
  rounds.set(roundId, round);

  return item;
}

export interface UpdateItemInput {
  roomId: string;
  itemId: string;
  title?: string;
  description?: string | null;
  participantId: string;
}

export function updateItem(input: UpdateItemInput): Item {
  const { roomId, itemId, title, description, participantId } = input;
  const room = rooms.get(roomId);
  if (!room) throw new Error("Room not found");
  if (room.facilitatorId !== participantId) throw new Error("Only the facilitator can edit items");

  const item = items.get(itemId);
  if (!item || item.roomId !== roomId) throw new Error("Item not found");

  const round = item.currentRoundId ? rounds.get(item.currentRoundId) : null;
  const hasVotes = round ? [...votes.values()].some((v) => v.roundId === round.id) : false;
  if (hasVotes) throw new Error("Cannot edit item after voting has started");

  if (title !== undefined) {
    const t = title?.trim() ?? "";
    if (!t) throw new Error("Title is required");
    if (t.length > ITEM_TITLE_MAX_LENGTH) throw new Error(`Title must be at most ${ITEM_TITLE_MAX_LENGTH} characters`);
    item.title = t;
  }
  if (description !== undefined) {
    const d = description?.trim() ?? null;
    if (d && d.length > ITEM_DESCRIPTION_MAX_LENGTH) throw new Error(`Description must be at most ${ITEM_DESCRIPTION_MAX_LENGTH} characters`);
    item.description = d;
  }
  return item;
}

export function removeItem(roomId: string, itemId: string, participantId: string): void {
  const room = rooms.get(roomId);
  if (!room) throw new Error("Room not found");
  if (room.facilitatorId !== participantId) throw new Error("Only the facilitator can remove items");

  const item = items.get(itemId);
  if (!item || item.roomId !== roomId) throw new Error("Item not found");

  const itemRounds = [...rounds.values()].filter((r) => r.itemId === itemId);
  for (const r of itemRounds) {
    for (const [vid, v] of votes) {
      if (v.roundId === r.id) votes.delete(vid);
    }
    rounds.delete(r.id);
  }
  items.delete(itemId);
}

export interface CastVoteInput {
  roomId: string;
  itemId: string;
  participantId: string;
  cardValue: string;
}

export function castVote(input: CastVoteInput): Vote {
  const { roomId, itemId, participantId, cardValue } = input;
  const room = rooms.get(roomId);
  if (!room) throw new Error("Room not found");
  if (room.state === RoomState.CLOSED) throw new Error("Room is closed");

  const participant = participants.get(participantId);
  if (!participant || participant.roomId !== roomId || !participant.isActive) throw new Error("Participant not found");
  if (participant.role === ParticipantRole.OBSERVER) throw new Error("Observers cannot vote");

  const item = items.get(itemId);
  if (!item || item.roomId !== roomId) throw new Error("Item not found");
  if (!item.currentRoundId) throw new Error("No active round for this item");

  const round = rounds.get(item.currentRoundId);
  if (!round || round.itemId !== itemId) throw new Error("Round not found");
  if (round.state !== RoundState.VOTING) throw new Error("Voting is closed for this round");

  if (!room.deckValues.includes(cardValue)) throw new Error(`Invalid card value: ${cardValue}`);

  const existing = [...votes.values()].find((v) => v.roundId === round.id && v.participantId === participantId);
  const now = Date.now();

  if (existing) {
    existing.cardValue = cardValue;
    existing.votedAt = now;
    return existing;
  }

  const vote: Vote = {
    id: randomUUID(),
    roundId: round.id,
    participantId,
    cardValue,
    votedAt: now,
    isRevealed: false,
  };
  votes.set(vote.id, vote);
  return vote;
}

export interface RevealVotesResult {
  votes: Array<Vote & { participantName: string }>;
  statistics: VoteStatistics;
}

export function revealVotes(roomId: string, itemId: string, participantId: string): RevealVotesResult {
  const room = rooms.get(roomId);
  if (!room) throw new Error("Room not found");
  if (room.facilitatorId !== participantId) throw new Error("Only the facilitator can reveal votes");

  const item = items.get(itemId);
  if (!item || item.roomId !== roomId) throw new Error("Item not found");
  if (!item.currentRoundId) throw new Error("No active round");

  const round = rounds.get(item.currentRoundId);
  if (!round || round.itemId !== itemId) throw new Error("Round not found");
  if (round.state !== RoundState.VOTING) throw new Error("Votes already revealed");

  const now = Date.now();
  round.state = RoundState.REVEALED;
  round.votesRevealedAt = now;

  const voteList = [...votes.values()].filter((v) => v.roundId === round.id);
  for (const v of voteList) v.isRevealed = true;

  const statistics = computeVoteStatistics(voteList, room.deckValues);
  const votesWithNames = voteList.map((v) => {
    const p = participants.get(v.participantId);
    return { ...v, participantName: p?.displayName ?? "Unknown" };
  });
  return { votes: votesWithNames, statistics };
}

export function revote(roomId: string, itemId: string, participantId: string): Round {
  const room = rooms.get(roomId);
  if (!room) throw new Error("Room not found");
  if (room.facilitatorId !== participantId) throw new Error("Only the facilitator can re-vote");

  const item = items.get(itemId);
  if (!item || item.roomId !== roomId) throw new Error("Item not found");
  if (!item.currentRoundId) throw new Error("No active round");

  const oldRound = rounds.get(item.currentRoundId);
  if (!oldRound || oldRound.itemId !== itemId) throw new Error("Round not found");
  if (oldRound.state !== RoundState.REVEALED) throw new Error("Can only re-vote after reveal");

  const now = Date.now();
  const roundId = randomUUID();
  const roundNumber = oldRound.roundNumber + 1;

  const newRound: Round = {
    id: roundId,
    itemId,
    roundNumber,
    state: RoundState.VOTING,
    votesRevealedAt: null,
    createdAt: now,
    finalizedAt: null,
  };
  rounds.set(roundId, newRound);
  item.currentRoundId = roundId;
  return newRound;
}

export function recordFinalEstimate(roomId: string, itemId: string, participantId: string, cardValue: string): Item {
  const room = rooms.get(roomId);
  if (!room) throw new Error("Room not found");
  if (room.facilitatorId !== participantId) throw new Error("Only the facilitator can record final estimate");

  const item = items.get(itemId);
  if (!item || item.roomId !== roomId) throw new Error("Item not found");
  if (!room.deckValues.includes(cardValue)) throw new Error(`Invalid card value: ${cardValue}`);

  const round = item.currentRoundId ? rounds.get(item.currentRoundId) : null;
  if (!round || round.itemId !== itemId) throw new Error("Round not found");
  if (round.state !== RoundState.REVEALED) throw new Error("Must reveal votes before recording final estimate");

  const now = Date.now();
  item.finalEstimate = cardValue;
  item.finalEstimateRecordedAt = now;
  item.currentRoundId = null;
  round.state = RoundState.FINALIZED;
  round.finalizedAt = now;

  const session = sessions.get(roomId);
  if (session) {
    session.totalItems = [...items.values()].filter((i) => i.roomId === roomId && i.finalEstimate != null).length;
  }

  return item;
}

export function getItemsByRoom(roomId: string): Item[] {
  return [...items.values()]
    .filter((i) => i.roomId === roomId)
    .sort((a, b) => a.order - b.order);
}

export function getRoundById(roundId: string): Round | undefined {
  return rounds.get(roundId);
}

export function getVotesByRound(roundId: string): Vote[] {
  return [...votes.values()].filter((v) => v.roundId === roundId);
}

export function getVoteCountForRound(roundId: string): number {
  return getVotesByRound(roundId).length;
}

export function getVotingParticipantCount(roomId: string): number {
  return getActiveParticipants(roomId).filter(
    (p) => p.role === ParticipantRole.PARTICIPANT || p.role === ParticipantRole.FACILITATOR
  ).length;
}
