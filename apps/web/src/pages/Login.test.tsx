/**
 * Login page tests.
 * Covers: renders form, validation errors, successful login, API error message,
 * redirect when already authenticated.
 * Per tasks.MD §6.3, configuration.MD §3 TDD mandate.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Login } from "./Login";
import { AuthProvider } from "../context/AuthContext";
import { MessageProvider } from "../context/MessageContext";

vi.mock("../auth/auth-api", () => ({
  mockLogin: vi.fn(),
}));

const { mockLogin } = await import("../auth/auth-api");

function TestApp({ initialRoute = "/login" }: { initialRoute?: string }) {
  return (
    <AuthProvider>
      <MessageProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<div data-testid="home">Home</div>} />
            <Route path="/create" element={<div data-testid="create">Create Room</div>} />
          </Routes>
        </MemoryRouter>
      </MessageProvider>
    </AuthProvider>
  );
}

describe("Login", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.mocked(mockLogin).mockResolvedValue({
      user: { id: "u1", email: "alice@example.com", name: "alice" },
      token: "mock-token-abc",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("renders the Login heading", () => {
    render(<TestApp />);
    expect(screen.getByRole("heading", { name: /log in/i })).toBeInTheDocument();
  });

  it("renders username/email and password inputs", () => {
    render(<TestApp />);
    expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders a Log in submit button", () => {
    render(<TestApp />);
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("shows error when username is empty on submit", async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    await user.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("shows error when password is empty on submit", async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    await user.type(screen.getByLabelText(/username or email/i), "alice");
    await user.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("calls mockLogin with username and password on valid submit", async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    await user.type(screen.getByLabelText(/username or email/i), "alice");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("alice", "secret123");
    });
  });

  it("shows API error message when login fails", async () => {
    vi.mocked(mockLogin).mockRejectedValue(new Error("Invalid username or password"));
    const user = userEvent.setup();
    render(<TestApp />);
    await user.type(screen.getByLabelText(/username or email/i), "wrong");
    await user.type(screen.getByLabelText(/password/i), "bad");
    await user.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
    });
  });

  it("redirects to home when already authenticated", () => {
    sessionStorage.setItem(
      "poker-plan-it-auth",
      JSON.stringify({ user: { id: "1", email: "a@b.com", name: "Alice" }, token: "tok" })
    );
    render(<TestApp />);
    expect(screen.getByTestId("home")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /log in/i })).not.toBeInTheDocument();
  });

  it("renders a back to home link", () => {
    render(<TestApp />);
    expect(screen.getByRole("link", { name: /back to home/i })).toBeInTheDocument();
  });
});
