/**
 * Room API client for Planning Poker.
 * Phase 2.4, 3.4 — Room management and estimation.
 */

import type { Room, Participant, Item, Vote, VoteStatistics } from "./types.js";
import { DeckType, ParticipantRole } from "./types.js";
import { createHttpClient } from "./api-client.js";

export interface CreateRoomResponse {
  room: Room;
  participant: Participant;
  shareableLink: string;
}

export interface JoinRoomResponse {
  participant: Participant;
  room: Room;
}

export interface RevealVotesResponse {
  votes: Array<Vote & { participantName: string }>;
  statistics: VoteStatistics;
}

/**
 * Create a room API client bound to a base URL.
 */
export function createRoomApi(baseUrl: string) {
  const http = createHttpClient(baseUrl);

  return {
    async createRoom(
      name: string,
      deckType: DeckType,
      baseUrl?: string
    ): Promise<CreateRoomResponse> {
      return http.post<CreateRoomResponse>("/api/rooms", { name, deckType, baseUrl });
    },

    async getRoom(roomId: string): Promise<Room> {
      return http.get<Room>(`/api/rooms/${roomId}`);
    },

    async joinRoom(
      roomId: string,
      displayName: string,
      role?: ParticipantRole
    ): Promise<JoinRoomResponse> {
      return http.post<JoinRoomResponse>(`/api/rooms/${roomId}/join`, {
        displayName,
        role: role ?? ParticipantRole.PARTICIPANT,
      });
    },

    async leaveRoom(roomId: string, participantId: string): Promise<void> {
      await http.post(`/api/rooms/${roomId}/leave`, { participantId });
    },

    async closeRoom(roomId: string, participantId: string): Promise<void> {
      await http.post(`/api/rooms/${roomId}/close`, { participantId });
    },

    async getParticipants(roomId: string): Promise<{ participants: Participant[] }> {
      return http.get<{ participants: Participant[] }>(`/api/rooms/${roomId}/participants`);
    },

    // Estimation (Phase 3.4)
    async getItems(roomId: string): Promise<{ items: Item[] }> {
      return http.get<{ items: Item[] }>(`/api/rooms/${roomId}/items`);
    },

    async addItem(
      roomId: string,
      participantId: string,
      title: string,
      description?: string | null
    ): Promise<Item> {
      return http.post<Item>(`/api/rooms/${roomId}/items`, {
        title,
        description: description ?? null,
        participantId,
      });
    },

    async updateItem(
      roomId: string,
      itemId: string,
      participantId: string,
      updates: { title?: string; description?: string | null }
    ): Promise<Item> {
      return http.patch<Item>(`/api/rooms/${roomId}/items/${itemId}`, {
        ...updates,
        participantId,
      });
    },

    async removeItem(roomId: string, itemId: string, participantId: string): Promise<void> {
      await http.delete(`/api/rooms/${roomId}/items/${itemId}`, { participantId });
    },

    async castVote(
      roomId: string,
      itemId: string,
      participantId: string,
      cardValue: string
    ): Promise<void> {
      await http.post(`/api/rooms/${roomId}/items/${itemId}/vote`, {
        participantId,
        cardValue,
      });
    },

    async revealVotes(
      roomId: string,
      itemId: string,
      participantId: string
    ): Promise<RevealVotesResponse> {
      return http.post<RevealVotesResponse>(`/api/rooms/${roomId}/items/${itemId}/reveal`, {
        participantId,
      });
    },

    async revote(roomId: string, itemId: string, participantId: string): Promise<void> {
      await http.post(`/api/rooms/${roomId}/items/${itemId}/revote`, { participantId });
    },

    async recordFinalEstimate(
      roomId: string,
      itemId: string,
      participantId: string,
      cardValue: string
    ): Promise<{ item: Item }> {
      return http.post<{ item: Item }>(`/api/rooms/${roomId}/items/${itemId}/finalize`, {
        participantId,
        cardValue,
      });
    },
  };
}

/**
 * Room WebSocket events (for Socket.io).
 * Events: participantJoined, participantLeft, roomClosed,
 * itemAdded, itemUpdated, itemRemoved, voteCount, votesRevealed, revoteStarted, finalEstimateRecorded.
 */
export type RoomSocketEvent =
  | { type: "participantJoined"; participant: Participant }
  | { type: "participantLeft"; participant: Participant }
  | { type: "roomClosed"; roomId: string; state: string }
  | { type: "itemAdded"; item: Item }
  | { type: "itemUpdated"; item: Item }
  | { type: "itemRemoved"; itemId: string }
  | { type: "voteCount"; itemId: string; votedCount: number; totalCount: number }
  | {
      type: "votesRevealed";
      itemId: string;
      votes: Array<Vote & { participantName: string }>;
      statistics: VoteStatistics;
      deckDescriptions?: Record<string, string>;
    }
  | { type: "revoteStarted"; itemId: string }
  | { type: "finalEstimateRecorded"; item: Item; finalEstimate: string };
