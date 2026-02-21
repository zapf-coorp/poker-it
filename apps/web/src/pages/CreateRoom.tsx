import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeckType, DECKS } from "shared";
import { roomApi } from "../api";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Link } from "react-router-dom";
import { setStoredParticipant } from "../storage";

export function CreateRoom() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [deckType, setDeckType] = useState<DeckType>(DeckType.FIBONACCI);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    roomId: string;
    participantId: string;
    shareableLink: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Room name is required");
      return;
    }
    setLoading(true);
    try {
      const baseUrl = window.location.origin;
      const res = await roomApi.createRoom(name.trim(), deckType, baseUrl);
      setResult({
        roomId: res.room.id,
        participantId: res.participant.id,
        shareableLink: res.shareableLink,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard");
    }
  }

  function openRoom() {
    if (result) {
      setStoredParticipant(result.roomId, result.participantId, true);
      navigate(`/room/${result.roomId}`, {
        state: { participantId: result.participantId, isFacilitator: true },
      });
    }
  }

  if (result) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>Room created</h1>
        <Card>
          <p style={{ marginBottom: 16 }}>Share this link with participants:</p>
          <div
            style={{
              padding: 12,
              background: "var(--color-bg)",
              borderRadius: 8,
              marginBottom: 16,
              wordBreak: "break-all",
              fontSize: "0.9rem",
            }}
          >
            {result.shareableLink}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Button variant="primary" onClick={copyLink}>
              {copied ? "Copied!" : "Copy link"}
            </Button>
            <Button variant="secondary" onClick={openRoom}>
              Open room
            </Button>
          </div>
        </Card>
        <p style={{ marginTop: 16 }}>
          <Link to="/" style={{ color: "var(--color-primary)" }}>
            ← Back to home
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>Create room</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <Input
            label="Room name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sprint 42"
            autoFocus
            error={error && !name.trim() ? error : undefined}
          />
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="deck"
              style={{
                display: "block",
                marginBottom: 4,
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              Deck
            </label>
            <select
              id="deck"
              value={deckType}
              onChange={(e) => setDeckType(e.target.value as DeckType)}
              style={{
                width: "100%",
                minHeight: 44,
                padding: "12px 16px",
                fontSize: "1rem",
                border: "2px solid var(--color-border)",
                borderRadius: 8,
                background: "var(--color-surface)",
                color: "var(--color-text)",
              }}
            >
              {Object.entries(DECKS).map(([key, deck]) => (
                <option key={key} value={key}>
                  {key} ({deck.deckValues.join(", ")})
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p style={{ marginBottom: 16, color: "var(--color-error)", fontSize: "0.9rem" }}>
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" loading={loading} style={{ width: "100%" }}>
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
