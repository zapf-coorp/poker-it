import { useEffect } from "react";
import type { Participant, Room, VoteStatistics } from "shared";
import { RoomState, RoundState } from "shared";
import { createRoomSocket } from "../api";
import type { ItemWithRound, RevealedVote } from "../types";

interface UseRoomSocketCallbacks {
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  setRoom: React.Dispatch<React.SetStateAction<Room | null>>;
  setItems: React.Dispatch<React.SetStateAction<ItemWithRound[]>>;
  setRevealedVotes: React.Dispatch<React.SetStateAction<RevealedVote[]>>;
  setRevealedStats: React.Dispatch<React.SetStateAction<VoteStatistics | null>>;
  setRevealedItemId: React.Dispatch<React.SetStateAction<string | null>>;
  setDeckDescriptions: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setMyVote: React.Dispatch<React.SetStateAction<string | null>>;
  setFinalEstimate: React.Dispatch<React.SetStateAction<string>>;
  fetchItems: () => Promise<void>;
}

export function useRoomSocket(
  roomId: string | undefined,
  participantId: string | undefined,
  room: Room | null,
  callbacks: UseRoomSocketCallbacks
) {
  const {
    setParticipants,
    setRoom,
    setItems,
    setRevealedVotes,
    setRevealedStats,
    setRevealedItemId,
    setDeckDescriptions,
    setMyVote,
    setFinalEstimate,
    fetchItems,
  } = callbacks;

  useEffect(() => {
    if (!roomId || !participantId || !room) return;
    const s = createRoomSocket();
    s.on("connect", () => {
      s.emit("joinRoom", { roomId, participantId });
    });
    s.on("participantJoined", (p: Participant) => {
      setParticipants((prev) => {
        if (prev.some((x) => x.id === p.id)) return prev;
        return [...prev, p].sort((a, b) => a.joinedAt - b.joinedAt);
      });
    });
    s.on("participantLeft", (p: Participant) => {
      setParticipants((prev) => prev.filter((x) => x.id !== p.id));
    });
    s.on("roomClosed", () => {
      setRoom((prev) => (prev ? { ...prev, state: RoomState.CLOSED } : null));
    });
    s.on("itemAdded", () => {
      setMyVote(null);
      setRevealedVotes([]);
      setRevealedStats(null);
      setRevealedItemId(null);
      fetchItems();
    });
    s.on("itemUpdated", () => fetchItems());
    s.on("itemRemoved", (payload: { itemId: string }) => {
      setItems((prev) => prev.filter((i) => i.id !== payload.itemId));
      setRevealedItemId((prev) => {
        if (prev === payload.itemId) {
          setRevealedVotes([]);
          setRevealedStats(null);
          return null;
        }
        return prev;
      });
    });
    s.on(
      "voteCount",
      (payload: { itemId: string; votedCount: number; votedParticipantIds?: string[] }) => {
        setItems((prev) =>
          prev.map((i) => {
            if (i.id !== payload.itemId || !i.currentRound) return i;
            return {
              ...i,
              currentRound: {
                ...i.currentRound,
                votedCount: payload.votedCount,
                votedParticipantIds: payload.votedParticipantIds ?? i.currentRound.votedParticipantIds,
              },
            };
          })
        );
      }
    );
    s.on(
      "votesRevealed",
      (payload: {
        itemId: string;
        votes: RevealedVote[];
        statistics: VoteStatistics;
        deckDescriptions?: Record<string, string>;
      }) => {
        setRevealedItemId(payload.itemId);
        setRevealedVotes(payload.votes);
        setRevealedStats(payload.statistics);
        setDeckDescriptions(payload.deckDescriptions ?? {});
        setItems((prev) =>
          prev.map((i) => {
            if (i.id !== payload.itemId || !i.currentRound) return i;
            return { ...i, currentRound: { ...i.currentRound, state: RoundState.REVEALED } };
          })
        );
      }
    );
    s.on("revoteStarted", () => {
      setRevealedVotes([]);
      setRevealedStats(null);
      setRevealedItemId(null);
      setMyVote(null);
      fetchItems();
    });
    s.on("finalEstimateRecorded", () => {
      setRevealedVotes([]);
      setRevealedStats(null);
      setRevealedItemId(null);
      setFinalEstimate("");
      setMyVote(null);
      fetchItems();
    });
    return () => {
      s.disconnect();
    };
  }, [roomId, participantId, room?.id, fetchItems]);
}
