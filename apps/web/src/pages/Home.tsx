import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

function extractRoomId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/\/room\/([^/?#]+)/);
  return match ? match[1] : trimmed;
}

export function Home() {
  const navigate = useNavigate();
  const [roomInput, setRoomInput] = useState("");

  function handleJoinRoom(e: React.FormEvent) {
    e.preventDefault();
    const roomId = extractRoomId(roomInput);
    if (roomId) {
      navigate(`/room/${roomId}`);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>Poker Plan It</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 24 }}>
        Planning Poker for agile teams.
      </p>
      <Card>
        <Link to="/create" style={{ textDecoration: "none" }}>
          <Button variant="primary" style={{ width: "100%" }}>
            Create a room
          </Button>
        </Link>
        <form onSubmit={handleJoinRoom} style={{ marginTop: 16 }}>
          <Input
            label="Or paste room link / ID"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="Paste link or room ID"
          />
          <Button
            type="submit"
            variant="secondary"
            style={{ width: "100%", marginTop: 8 }}
            disabled={!roomInput.trim()}
          >
            Join room
          </Button>
        </form>
      </Card>
    </div>
  );
}
