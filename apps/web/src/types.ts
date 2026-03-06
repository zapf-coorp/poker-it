import type { Item, Vote } from "shared";
import { RoundState } from "shared";

export interface ItemWithRound extends Item {
  currentRound?: {
    id: string;
    state: RoundState;
    roundNumber: number;
    votedCount: number;
  };
}

export interface RevealedVote extends Vote {
  participantName: string;
}
