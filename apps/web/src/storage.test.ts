/**
 * storage.ts tests.
 * Covers: get/set/clear for participant and auth storage.
 * Per tasks.MD §2.9, configuration.MD §3 TDD mandate.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getStoredParticipant,
  setStoredParticipant,
  clearStoredParticipant,
  getStoredAuth,
  setStoredAuth,
  clearStoredAuth,
} from "./storage";

describe("storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe("participant storage", () => {
    it("returns null when no participant is stored for a room", () => {
      expect(getStoredParticipant("room-abc")).toBeNull();
    });

    it("stores and retrieves participant as facilitator", () => {
      setStoredParticipant("room-1", "p-1", true);
      const result = getStoredParticipant("room-1");
      expect(result).toEqual({ participantId: "p-1", isFacilitator: true });
    });

    it("stores and retrieves participant as non-facilitator", () => {
      setStoredParticipant("room-2", "p-2", false);
      const result = getStoredParticipant("room-2");
      expect(result).toEqual({ participantId: "p-2", isFacilitator: false });
    });

    it("isolates storage per room ID", () => {
      setStoredParticipant("room-A", "p-A", true);
      setStoredParticipant("room-B", "p-B", false);
      expect(getStoredParticipant("room-A")?.participantId).toBe("p-A");
      expect(getStoredParticipant("room-B")?.participantId).toBe("p-B");
    });

    it("clears stored participant for a room", () => {
      setStoredParticipant("room-1", "p-1", true);
      clearStoredParticipant("room-1");
      expect(getStoredParticipant("room-1")).toBeNull();
    });

    it("returns null when sessionStorage has malformed JSON", () => {
      sessionStorage.setItem("poker-plan-it-room-bad", "NOT_JSON");
      expect(getStoredParticipant("bad")).toBeNull();
    });
  });

  describe("auth storage", () => {
    it("returns null when no auth is stored", () => {
      expect(getStoredAuth()).toBeNull();
    });

    it("stores and retrieves auth session", () => {
      const user = { id: "u1", email: "alice@example.com", name: "Alice" };
      setStoredAuth(user, "token-abc");
      const result = getStoredAuth();
      expect(result).toEqual({ user, token: "token-abc" });
    });

    it("clears stored auth", () => {
      setStoredAuth({ id: "u1", email: "a@b.com", name: "Alice" }, "tok");
      clearStoredAuth();
      expect(getStoredAuth()).toBeNull();
    });

    it("returns null when sessionStorage has malformed auth JSON", () => {
      sessionStorage.setItem("poker-plan-it-auth", "BAD_JSON");
      expect(getStoredAuth()).toBeNull();
    });

    it("returns null when stored auth is missing user or token", () => {
      sessionStorage.setItem("poker-plan-it-auth", JSON.stringify({ user: null, token: null }));
      expect(getStoredAuth()).toBeNull();
    });
  });
});
