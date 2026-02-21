import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import type { Room, Participant } from "shared";
import { RoomState, ParticipantRole } from "shared";
import { roomApi } from "../api";
import { getStoredParticipant, clearStoredParticipant } from "../storage";
import { createRoomSocket } from "../api";
import type { Socket } from "socket.io-client";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { Link } from "react-router-dom";

export function RoomLobby() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const stored = id ? getStoredParticipant(id) : null;
  const participantId =
    (location.state as { participantId?: string })?.participantId ?? stored?.participantId;
  const isFacilitator =
    (location.state as { isFacilitator?: boolean })?.isFacilitator ?? stored?.isFacilitator ?? false;

  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [closeConfirm, setCloseConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const shareableLink = id ? `${window.location.origin}/room/${id}` : "";

  async function copyShareLink() {
    if (!shareableLink) return;
    try {
      await navigator.clipboard.writeText(shareableLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard");
    }
  }

  const fetchRoom = useCallback(async () => {
    if (!id) return;
    try {
      const r = await roomApi.getRoom(id);
      setRoom(r);
      const { participants: list } = await roomApi.getParticipants(id);
      setParticipants(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load room");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  // WebSocket for real-time updates
  useEffect(() => {
    if (!id || !participantId || !room) return;
    const s = createRoomSocket();
    s.on("connect", () => {
      s.emit("joinRoom", { roomId: id, participantId });
    });
    s.on("participantJoined", (p: Participant) => {
      setParticipants((prev) => {
        if (prev.some((x) => x.id === p.id)) return prev;
        return [...prev, p].sort((a, b) => a.joinedAt - b.joinedAt);
      });
    });
    s.on("participantLeft", (p: Participant) => {
      setParticipants((prev) => prev.filter((x) => x.id !== p.id));
    });
    s.on("roomClosed", () => {
      setRoom((prev) => (prev ? { ...prev, state: RoomState.CLOSED } : null));
    });
    setSocket(s);
    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [id, participantId, room?.id]);

  async function handleLeave() {
    if (!id || !participantId) return;
    setActionLoading(true);
    try {
      await roomApi.leaveRoom(id, participantId);
      clearStoredParticipant(id);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to leave");
    } finally {
      setActionLoading(false);
      setLeaveConfirm(false);
    }
  }

  async function handleClose() {
    if (!id || !participantId) return;
    setActionLoading(true);
    try {
      await roomApi.closeRoom(id, participantId);
      setRoom((prev) => (prev ? { ...prev, state: RoomState.CLOSED } : null));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close room");
    } finally {
      setActionLoading(false);
      setCloseConfirm(false);
    }
  }

  if (loading || !id) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
        <Card>
          <p style={{ color: "var(--color-error)" }}>{error}</p>
          <Link to="/">
            <Button variant="secondary">Back to home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!participantId) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
        <Card>
          <p>You need to join this room first.</p>
          <Link to={`/room/${id}/join`}>
            <Button variant="primary">Join room</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isClosed = room?.state === RoomState.CLOSED;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", margin: 0 }}>{room?.name ?? "Room"}</h1>
          <Badge status={isClosed ? "closed" : "open"} />
        </div>
        {!isClosed && (
          <div style={{ display: "flex", gap: 8 }}>
            {leaveConfirm ? (
              <>
                <span style={{ alignSelf: "center", fontSize: "0.9rem" }}>
                  Leave this room? You will need the link to rejoin.
                </span>
                <Button variant="destructive" onClick={handleLeave} loading={actionLoading}>
                  Leave
                </Button>
                <Button variant="secondary" onClick={() => setLeaveConfirm(false)}>
                  Cancel
                </Button>
              </>
            ) : isFacilitator ? (
              closeConfirm ? (
                <>
                  <span style={{ alignSelf: "center", fontSize: "0.9rem" }}>
                    Close this room? No one will be able to vote after closing.
                  </span>
                  <Button variant="destructive" onClick={handleClose} loading={actionLoading}>
                    Close room
                  </Button>
                  <Button variant="secondary" onClick={() => setCloseConfirm(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="destructive" onClick={() => setCloseConfirm(true)}>
                    Close room
                  </Button>
                  <Button variant="secondary" onClick={() => setLeaveConfirm(true)}>
                    Leave
                  </Button>
                </>
              )
            ) : (
              <Button variant="secondary" onClick={() => setLeaveConfirm(true)}>
                Leave
              </Button>
            )}
          </div>
        )}
      </header>

      {error && (
        <p style={{ color: "var(--color-error)", marginBottom: 16 }}>{error}</p>
      )}

      {isFacilitator && !isClosed && (
        <Card style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: "1.1rem", margin: "0 0 8px" }}>Share link</h2>
          <p style={{ color: "var(--color-text-secondary)", margin: "0 0 12px", fontSize: "0.9rem" }}>
            Share this link with participants so they can join:
          </p>
          <div
            style={{
              padding: 12,
              background: "var(--color-bg)",
              borderRadius: 8,
              marginBottom: 12,
              wordBreak: "break-all",
              fontSize: "0.9rem",
            }}
          >
            {shareableLink}
          </div>
          <Button variant="primary" onClick={copyShareLink}>
            {linkCopied ? "Copied!" : "Copy link"}
          </Button>
        </Card>
      )}

      <Card style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.1rem", margin: "0 0 8px" }}>Current item</h2>
        <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>
          No item yet. (Estimation items coming in Phase 3)
        </p>
      </Card>

      <Card>
        <h2 style={{ fontSize: "1.1rem", margin: "0 0 12px" }}>
          Participants ({participants.length})
        </h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {participants.map((p) => (
            <li
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom: "1px solid var(--color-border)",
                minHeight: 44,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  color: "var(--color-primary-text)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                {p.displayName.charAt(0).toUpperCase()}
              </div>
              <span>
                {p.displayName}
                {p.role === ParticipantRole.FACILITATOR && (
                  <span style={{ color: "var(--color-secondary)", marginLeft: 8 }}>(facilitator)</span>
                )}
                {p.role === ParticipantRole.OBSERVER && (
                  <span style={{ color: "var(--color-text-secondary)", marginLeft: 8 }}>
                    (observer)
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
