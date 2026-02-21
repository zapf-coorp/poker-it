import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ParticipantRole } from "shared";
import { roomApi } from "../api";
import type { Room } from "shared";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { setStoredParticipant } from "../storage";

export function JoinRoom() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [roomError, setRoomError] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [joinAsObserver, setJoinAsObserver] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    if (!id) {
      setRoomError("Room ID missing");
      setLoading(false);
      return;
    }
    roomApi
      .getRoom(id)
      .then(setRoom)
      .catch((err) => {
        setRoomError(err instanceof Error ? err.message : "Room not found");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !displayName.trim()) return;
    setJoinError("");
    setJoinLoading(true);
    try {
      const res = await roomApi.joinRoom(
        id,
        displayName.trim(),
        joinAsObserver ? ParticipantRole.OBSERVER : ParticipantRole.PARTICIPANT
      );
      setStoredParticipant(id, res.participant.id, res.participant.role === ParticipantRole.FACILITATOR);
      // Full navigation ensures RoomRoute re-evaluates and shows RoomLobby
      window.location.assign(`${window.location.origin}/room/${id}`);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setJoinLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 400, margin: "0 auto", padding: 24 }}>
        <p>Loading room...</p>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div style={{ maxWidth: 400, margin: "0 auto", padding: 24 }}>
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
      <div style={{ maxWidth: 400, margin: "0 auto", padding: 24 }}>
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
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>
        Join {room.name}
      </h1>
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
          {joinError && (
            <p style={{ marginBottom: 16, color: "var(--color-error)", fontSize: "0.9rem" }}>
              {joinError}
            </p>
          )}
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
