import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { DeckType } from "shared";
import { roomApi } from "../api";
import { setStoredParticipant } from "../storage";

export function useCreateRoom() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function createRoom(name: string, deckType: DeckType) {
    setError("");
    setIsLoading(true);
    try {
      const baseUrl = window.location.origin;
      const res = await roomApi.createRoom(name.trim(), deckType, baseUrl);
      setStoredParticipant(res.room.id, res.participant.id, true);
      navigate(`/room/${res.room.id}`, {
        state: { participantId: res.participant.id, isFacilitator: true },
      });
      return res;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create room";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return { createRoom, isLoading, error, setError };
}
