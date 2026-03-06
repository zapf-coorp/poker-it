import { useState, useEffect, useCallback } from "react";
import { ParticipantRole } from "shared";
import type { Room } from "shared";
import { roomApi } from "../api";
import { setStoredParticipant } from "../storage";

export function useJoinRoom(roomId: string | undefined) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roomError, setRoomError] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  const fetchRoom = useCallback(async () => {
    if (!roomId) {
      setRoomError("Room ID missing");
      setIsLoading(false);
      return;
    }
    try {
      const r = await roomApi.getRoom(roomId);
      setRoom(r);
    } catch (err) {
      setRoomError(err instanceof Error ? err.message : "Room not found");
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  async function joinRoom(displayName: string, joinAsObserver: boolean) {
    if (!roomId || !displayName.trim()) return;
    setJoinError("");
    setJoinLoading(true);
    try {
      const res = await roomApi.joinRoom(
        roomId,
        displayName.trim(),
        joinAsObserver ? ParticipantRole.OBSERVER : ParticipantRole.PARTICIPANT
      );
      setStoredParticipant(roomId, res.participant.id, res.participant.role === ParticipantRole.FACILITATOR);
      window.location.assign(`${window.location.origin}/room/${roomId}`);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setJoinLoading(false);
    }
  }

  return { room, isLoading, roomError, joinRoom, joinLoading, joinError };
}
