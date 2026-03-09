import { useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAuthContext } from "../context/AuthContext";

const pageStyles: React.CSSProperties = {
  maxWidth: 400,
  margin: "0 auto",
  padding: 24,
};

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthContext();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    setIsLoading(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid username or password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={pageStyles}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>Log in</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 24, fontSize: "0.9rem" }}>
        Log in to create a room.
      </p>
      <Card>
        <form onSubmit={handleSubmit}>
          <Input
            label="Username or email"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username or email"
            autoComplete="username"
            autoFocus
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
          />
          {error && (
            <p style={{ marginBottom: 16, color: "var(--color-error)", fontSize: "0.9rem" }}>
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" loading={isLoading} style={{ width: "100%" }}>
            Log in
          </Button>
        </form>
      </Card>
      <p style={{ marginTop: 16, fontSize: "0.9rem" }}>
        <Link to="/" style={{ color: "var(--color-primary)" }}>
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
