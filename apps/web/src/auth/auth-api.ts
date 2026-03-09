/**
 * Hard-mocked auth API. Accepts any credentials and returns success.
 * Per spec.MD UC-4.2 Login.
 */

import type { User } from "../types/auth";

function generateId(): string {
  return crypto.randomUUID();
}

export interface LoginResult {
  user: User;
  token: string;
}

/**
 * Mock login: any non-empty username and password succeeds.
 */
export async function mockLogin(username: string, password: string): Promise<LoginResult> {
  await new Promise((r) => setTimeout(r, 300));
  const trimmed = username.trim();
  if (!trimmed || !password) {
    throw new Error("Invalid username or password.");
  }
  return {
    user: {
      id: generateId(),
      email: trimmed.includes("@") ? trimmed : `${trimmed}@mock.local`,
      name: trimmed.split("@")[0] || trimmed,
    },
    token: `mock-token-${generateId()}`,
  };
}
