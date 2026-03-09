/**
 * Auth types for Login use case (hard mocked).
 * Per spec.MD §4, data-model.MD §2.7.
 */

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}
