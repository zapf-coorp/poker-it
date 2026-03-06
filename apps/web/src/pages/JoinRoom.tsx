import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useJoinRoom } from "../hooks/useJoinRoom";

const pageStyles: React.CSSProperties = {
  maxWidth: 400,
  margin: "0 auto",
  padding: 24,
};

const errorStyles: React.CSSProperties = {
  marginBottom: 16,
  color: "var(--color-error)",
  fontSize: "0.9rem",
};

export function JoinRoom() {
  const { id } = useParams<{ id: string }>();
  const [displayName, setDisplayName] = useState("");
  const [joinAsObserver, setJoinAsObserver] = useState(false);
  const { room, isLoading, roomError, joinRoom, joinLoading, joinError } = useJoinRoom(id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !displayName.trim()) return;
    await joinRoom(displayName, joinAsObserver);
  }

  if (isLoading) {
    return (
      <div style={pageStyles}>
        <p>Loading room...</p>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div style={pageStyles}>
        <Card>
          <p style={{ color: "var(--color-error)", marginBottom: 16 }}>
            {roomError || "Room not found"}
          </p>
          <Link to="/">
            <Button variant="secondary">Create a room instead</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (room.state === "CLOSED") {
    return (
      <div style={pageStyles}>
        <Card>
          <p style={{ color: "var(--color-error)", marginBottom: 16 }}>
            This room is closed. No one can join.
          </p>
          <Link to="/">
            <Button variant="secondary">Create a room instead</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div style={pageStyles}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>Join {room.name}</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <Input
            label="Your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
            required
            autoFocus
          />
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                minHeight: 44,
              }}
            >
              <input
                type="checkbox"
                checked={joinAsObserver}
                onChange={(e) => setJoinAsObserver(e.target.checked)}
                style={{ width: 20, height: 20 }}
              />
              <span>Join as observer (read-only)</span>
            </label>
          </div>
          {joinError && <p style={errorStyles}>{joinError}</p>}
          <Button
            type="submit"
            variant="primary"
            loading={joinLoading}
            disabled={!displayName.trim()}
            style={{ width: "100%" }}
          >
            Join
          </Button>
        </form>
      </Card>
      <p style={{ marginTop: 16 }}>
        <Link to="/" style={{ color: "var(--color-primary)" }}>
          ← Create a room instead
        </Link>
      </p>
    </div>
  );
}
