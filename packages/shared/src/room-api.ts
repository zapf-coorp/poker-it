/**
 * Room API client for Planning Poker.
 * Phase 2.4 — createRoom, getRoom, joinRoom, leaveRoom, closeRoom, WebSocket.
 */

import type { Room, Participant } from "./types.js";
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
  };
}

/**
 * Room WebSocket events (for Socket.io).
 * Use socket.io-client to connect; events: participantJoined, participantLeft, roomClosed.
 */
export type RoomSocketEvent =
  | { type: "participantJoined"; participant: Participant }
  | { type: "participantLeft"; participant: Participant }
  | { type: "roomClosed"; roomId: string; state: string };
