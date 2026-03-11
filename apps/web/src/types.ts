import type { Item, Vote } from "shared";
import { RoundState } from "shared";

export interface ItemWithRound extends Item {
  currentRound?: {
    id: string;
    state: RoundState;
    roundNumber: number;
    votedCount: number;
    /** Participant IDs who have voted (for showing ✓/?, visible to all). Values remain secret until reveal. */
    votedParticipantIds?: string[];
  };
}

export interface RevealedVote extends Vote {
  participantName: string;
}
