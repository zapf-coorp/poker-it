/**
 * Login / auth API tests.
 * mockLogin accepts any non-empty username and password.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mockLogin } from "./auth-api";

describe("auth-api — mockLogin", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns user and token for valid username and password", async () => {
    const promise = mockLogin("alice", "secret123");
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.user).toMatchObject({
      id: expect.any(String),
      email: expect.any(String),
      name: expect.any(String),
    });
    expect(result.user.email).toContain("alice");
    expect(result.user.name).toBe("alice");
    expect(result.token).toMatch(/^mock-token-/);
  });

  it("uses email as-is when username contains @", async () => {
    const promise = mockLogin("alice@example.com", "pass");
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.user.email).toBe("alice@example.com");
    expect(result.user.name).toBe("alice");
  });

  it("trims username before validating", async () => {
    const promise = mockLogin("  bob  ", "pass");
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.user.name).toBe("bob");
  });

  it("throws when username is empty", async () => {
    const promise = mockLogin("", "password");
    const expectPromise = expect(promise).rejects.toThrow("Invalid username or password");
    await vi.runAllTimersAsync();
    await expectPromise;
  });

  it("throws when username is only whitespace", async () => {
    const promise = mockLogin("   ", "password");
    const expectPromise = expect(promise).rejects.toThrow("Invalid username or password");
    await vi.runAllTimersAsync();
    await expectPromise;
  });

  it("throws when password is empty", async () => {
    const promise = mockLogin("alice", "");
    const expectPromise = expect(promise).rejects.toThrow("Invalid username or password");
    await vi.runAllTimersAsync();
    await expectPromise;
  });
});
