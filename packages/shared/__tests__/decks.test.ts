/**
 * Phase 1.2.4 — Deck constants.
 * Verifies FIBONACCI, LINEAR, TSHIRT deck definitions match spec.MD §5.1 and data-model.MD §3.2.
 */

import { describe, it, expect } from "vitest";
import { DeckType } from "../src/types.js";
import { FIBONACCI, LINEAR, TSHIRT, DECKS } from "../src/decks.js";

describe("Phase 1 — Deck definitions", () => {
  describe("FIBONACCI", () => {
    it("has deckType FIBONACCI", () => {
      expect(FIBONACCI.deckType).toBe(DeckType.FIBONACCI);
    });

    it("has deckValues: 0, 1, 2, 3, 5, 8, 13, 21, ?, ☕", () => {
      expect(FIBONACCI.deckValues).toEqual(["0", "1", "2", "3", "5", "8", "13", "21", "?", "☕"]);
    });
  });

  describe("LINEAR", () => {
    it("has deckType LINEAR", () => {
      expect(LINEAR.deckType).toBe(DeckType.LINEAR);
    });

    it("has deckValues 0 through 10", () => {
      expect(LINEAR.deckValues).toEqual(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
    });
  });

  describe("TSHIRT", () => {
    it("has deckType TSHIRT", () => {
      expect(TSHIRT.deckType).toBe(DeckType.TSHIRT);
    });

    it("has deckValues XS, S, M, L, XL", () => {
      expect(TSHIRT.deckValues).toEqual(["XS", "S", "M", "L", "XL"]);
    });
  });

  describe("DECKS", () => {
    it("maps each DeckType to its definition", () => {
      expect(DECKS[DeckType.FIBONACCI]).toBe(FIBONACCI);
      expect(DECKS[DeckType.LINEAR]).toBe(LINEAR);
      expect(DECKS[DeckType.TSHIRT]).toBe(TSHIRT);
    });
  });
});
