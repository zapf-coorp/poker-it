/**
 * Phase 1.5.2 — Server health route.
 * Verifies GET /health returns 200 and { status: "ok" }.
 */

import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/index.js";

describe("Phase 1 — Server health", () => {
  it("GET /health returns 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
  });

  it("GET /health returns { status: 'ok' }", async () => {
    const res = await request(app).get("/health");
    expect(res.body).toEqual({ status: "ok" });
  });
});
