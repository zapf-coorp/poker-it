/**
 * Phase 1.2.5 — API client skeleton.
 * Verifies createHttpClient and createWebSocket accept base URL; minimal fetch wrapper.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { createHttpClient, createWebSocket } from "../src/api-client.js";

describe("Phase 1 — API client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("createHttpClient", () => {
    it("returns an object with get, post, patch, delete methods", () => {
      const client = createHttpClient("http://localhost:3033");
      expect(typeof client.get).toBe("function");
      expect(typeof client.post).toBe("function");
      expect(typeof client.patch).toBe("function");
      expect(typeof client.delete).toBe("function");
    });

    it("get: appends path to base URL and returns parsed JSON on success", async () => {
      const client = createHttpClient("http://localhost:3033");
      const mockData = { status: "ok" };
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockData),
        })
      );

      const result = await client.get<{ status: string }>("/health");
      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith("http://localhost:3033/health", expect.any(Object));
    });

    it("get: throws on non-ok response", async () => {
      const client = createHttpClient("http://localhost:3033");
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 404,
          statusText: "Not Found",
        })
      );

      await expect(client.get("/missing")).rejects.toThrow("HTTP 404: Not Found");
    });

    it("post: sends JSON body and returns parsed response", async () => {
      const client = createHttpClient("http://localhost:3033");
      const body = { name: "Test" };
      const mockResponse = { id: "123" };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await client.post<{ id: string }>("/api/rooms", body);
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3033/api/rooms",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      );
    });
  });

  describe("createWebSocket", () => {
    it("is a function that accepts baseUrl and path", () => {
      expect(typeof createWebSocket).toBe("function");
      expect(createWebSocket.length).toBe(2);
    });

    it("transforms http base URL to ws URL when WebSocket is available", () => {
      if (typeof WebSocket === "undefined") {
        // Node without WebSocket polyfill — skip URL assertion
        return;
      }
      const ws = createWebSocket("http://localhost:3033", "/ws");
      expect(ws).toBeDefined();
      expect((ws as WebSocket & { url?: string }).url).toContain("ws://");
    });
  });
});
