import { useState } from "react";
import { Link } from "react-router-dom";
import { DeckType, DECKS } from "shared";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { useCreateRoom } from "../hooks/useCreateRoom";

const pageStyles: React.CSSProperties = {
  maxWidth: 480,
  margin: "0 auto",
  padding: 24,
};

export function CreateRoom() {
  const [name, setName] = useState("");
  const [deckType, setDeckType] = useState<DeckType>(DeckType.FIBONACCI);
  const { createRoom, isLoading, error, setError } = useCreateRoom();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Room name is required");
      return;
    }
    try {
      await createRoom(name, deckType);
    } catch {
      // Error already set in hook
    }
  }

  const hasNameError = error && !name.trim();

  return (
    <div style={pageStyles}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>Create room</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <Input
            label="Room name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sprint 42"
            autoFocus
            error={hasNameError ? error : undefined}
          />
          <Select
            label="Deck"
            value={deckType}
            onChange={(e) => setDeckType(e.target.value as DeckType)}
          >
            {Object.entries(DECKS).map(([key, deck]) => (
              <option key={key} value={key}>
                {key} ({deck.deckValues.join(", ")})
              </option>
            ))}
          </Select>
          {error && (
            <p style={{ marginBottom: 16, color: "var(--color-error)", fontSize: "0.9rem" }}>
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" loading={isLoading} style={{ width: "100%" }}>
            Create room
          </Button>
        </form>
      </Card>
      <p style={{ marginTop: 16 }}>
        <Link to="/" style={{ color: "var(--color-primary)" }}>
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
