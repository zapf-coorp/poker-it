/**
 * Deck definitions for Planning Poker.
 * See drivin-design/.spec.MD §5.1 and data-model.MD §3.2.
 */

import { DeckType } from "./types.js";

export interface DeckDefinition {
  deckType: DeckType;
  deckValues: string[];
}

/** Fibonacci: 0, 1, 2, 3, 5, 8, 13, 21, ?, ☕ */
export const FIBONACCI: DeckDefinition = {
  deckType: DeckType.FIBONACCI,
  deckValues: ["0", "1", "2", "3", "5", "8", "13", "21", "?", "☕"],
};

/** Linear 0–10 */
export const LINEAR: DeckDefinition = {
  deckType: DeckType.LINEAR,
  deckValues: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
};

/** T-shirt sizes */
export const TSHIRT: DeckDefinition = {
  deckType: DeckType.TSHIRT,
  deckValues: ["XS", "S", "M", "L", "XL"],
};

export const DECKS: Record<string, DeckDefinition> = {
  FIBONACCI,
  LINEAR,
  TSHIRT,
};
