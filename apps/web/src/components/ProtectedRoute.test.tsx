/**
 * ProtectedRoute tests — redirects to /login when not authenticated.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";

function TestApp({ initialRoute = "/create" }: { initialRoute?: string }) {
  return (
    <AuthProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <div data-testid="create-page">Create Room</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it("redirects to /login when not authenticated", () => {
    render(<TestApp />);

    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("create-page")).not.toBeInTheDocument();
  });

  it("shows protected content when authenticated", () => {
    sessionStorage.setItem(
      "poker-plan-it-auth",
      JSON.stringify({
        user: { id: "1", email: "a@b.com", name: "Alice" },
        token: "mock-token-123",
      })
    );

    render(<TestApp />);

    expect(screen.getByTestId("create-page")).toBeInTheDocument();
    expect(screen.getByText("Create Room")).toBeInTheDocument();
    expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();
  });
});
