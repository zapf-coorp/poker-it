/**
 * Room Lobby — Estimation board.
 * Layout: desk/table center, player cards around it, stats sidebar, card deck at bottom.
 * See drivin-design/spec.MD §6, ui-definition.MD §7.3, §7.10.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import type { Room, Participant, Item, VoteStatistics } from "shared";
import { RoomState, ParticipantRole, RoundState } from "shared";
import { roomApi } from "../api";
import { getStoredParticipant, clearStoredParticipant } from "../storage";
import { useRoomSocket } from "../hooks/useRoomSocket";
import { useMessageContext } from "../context/MessageContext";
import type { ItemWithRound, RevealedVote } from "../types";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";
import { Select } from "../components/Select";
import { ItemFormModal } from "../components/ItemFormModal";
import "./../styles/RoomLobbyLayout.css";

/** Position a point around an ellipse (percent from center) */
function getEllipsePosition(index: number, total: number): { left: number; top: number } {
  if (total <= 0) return { left: 50, top: 50 };
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const left = 50 + 48 * Math.cos(angle);
  const top = 50 + 42 * Math.sin(angle);
  return { left, top };
}

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
  const [items, setItems] = useState<ItemWithRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [closeConfirm, setCloseConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const [addItemOpen, setAddItemOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [itemTitle, setItemTitle] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemFormError, setItemFormError] = useState("");
  const [removeConfirmItem, setRemoveConfirmItem] = useState<Item | null>(null);

  const [revealedVotes, setRevealedVotes] = useState<RevealedVote[]>([]);
  const [revealedStats, setRevealedStats] = useState<VoteStatistics | null>(null);
  const [revealedItemId, setRevealedItemId] = useState<string | null>(null);
  const [deckDescriptions, setDeckDescriptions] = useState<Record<string, string>>({});

  const [myVote, setMyVote] = useState<string | null>(null);
  const [finalEstimate, setFinalEstimate] = useState<string>("");
  const [countdown, setCountdown] = useState<number | null>(null);

  const shareableLink = id ? `${window.location.origin}/room/${id}` : "";

  const canVote =
    isFacilitator ||
    participants.some((p) => p.id === participantId && p.role === ParticipantRole.PARTICIPANT);
  const isObserver =
    participants.find((p) => p.id === participantId)?.role === ParticipantRole.OBSERVER;

  const currentItem =
    items.find((i) => !i.finalEstimate && i.currentRoundId) ??
    items.find((i) => !i.finalEstimate);
  const currentRound = currentItem?.currentRound;
  const isVoting = currentRound?.state === RoundState.VOTING;
  const isRevealed =
    currentRound?.state === RoundState.REVEALED && revealedItemId === currentItem?.id;

  const votingCount = currentRound?.votedCount ?? 0;
  const totalVoters = participants.filter(
    (p) =>
      (p.role === ParticipantRole.PARTICIPANT || p.role === ParticipantRole.FACILITATOR) &&
      p.isActive
  ).length;

  const voters = participants.filter(
    (p) =>
      (p.role === ParticipantRole.PARTICIPANT || p.role === ParticipantRole.FACILITATOR) &&
      p.isActive
  );

  const voteByParticipant = useMemo(() => {
    const map = new Map<string, RevealedVote>();
    revealedVotes.forEach((v) => map.set(v.participantId, v));
    return map;
  }, [revealedVotes]);

  const highest = revealedStats?.highest ?? "";
  const lowest = revealedStats?.lowest ?? "";

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

  const fetchItems = useCallback(async () => {
    if (!id) return;
    try {
      const { items: list } = await roomApi.getItems(id);
      setItems(list as ItemWithRound[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
    }
  }, [id]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    setMyVote(null);
    setRevealedVotes([]);
    setRevealedStats(null);
    setRevealedItemId(null);
    setFinalEstimate("");
  }, [currentItem?.id]);

  useRoomSocket(id, participantId ?? undefined, room, {
    setParticipants,
    setRoom,
    setItems,
    setRevealedVotes,
    setRevealedStats,
    setRevealedItemId,
    setDeckDescriptions,
    setMyVote,
    setFinalEstimate,
    fetchItems,
  });

  const { addMessage } = useMessageContext();
  const isClosed = room?.state === RoomState.CLOSED;

  const hasNotifiedRef = useRef(false);
  const notifyRoomClosedAndNavigate = useCallback(() => {
    if (!room || hasNotifiedRef.current) return;
    hasNotifiedRef.current = true;
    const closedAt = room.closedAt ? new Date(room.closedAt) : new Date();
    const timeStr = closedAt.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    addMessage(`The room "${room.name}" was closed at ${timeStr}`, "info");
    navigate("/create", { replace: true, state: { keepMessages: true } });
  }, [room, addMessage, navigate]);

  useEffect(() => {
    if (!isClosed || !room) {
      setCountdown(null);
      hasNotifiedRef.current = false;
      return;
    }
    hasNotifiedRef.current = false;
    setCountdown(5);
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          notifyRoomClosedAndNavigate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isClosed, room, notifyRoomClosedAndNavigate]);

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

  async function handleAddItem() {
    if (!id || !participantId || !isFacilitator) return;
    setItemFormError("");
    const title = itemTitle.trim();
    if (!title) {
      setItemFormError("Title is required");
      return;
    }
    setActionLoading(true);
    try {
      await roomApi.addItem(id, participantId, title, itemDesc.trim() || null);
      setAddItemOpen(false);
      setItemTitle("");
      setItemDesc("");
      fetchItems();
    } catch (err) {
      setItemFormError(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdateItem() {
    if (!id || !participantId || !editItem) return;
    setItemFormError("");
    const title = itemTitle.trim();
    if (!title) {
      setItemFormError("Title is required");
      return;
    }
    setActionLoading(true);
    try {
      await roomApi.updateItem(id, editItem.id, participantId, {
        title,
        description: itemDesc.trim() || null,
      });
      setEditItem(null);
      setItemTitle("");
      setItemDesc("");
      fetchItems();
    } catch (err) {
      setItemFormError(err instanceof Error ? err.message : "Failed to update item");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemoveItem() {
    if (!id || !participantId || !removeConfirmItem) return;
    setActionLoading(true);
    try {
      await roomApi.removeItem(id, removeConfirmItem.id, participantId);
      setRemoveConfirmItem(null);
      fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove item");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleVote(cardValue: string) {
    if (!id || !participantId || !currentItem || !canVote || isObserver) return;
    try {
      if (myVote === cardValue) {
        await roomApi.removeVote(id, currentItem.id, participantId);
        setMyVote(null);
      } else {
        await roomApi.castVote(id, currentItem.id, participantId, cardValue);
        setMyVote(cardValue);
      }
      fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to vote");
    }
  }

  async function handleReveal() {
    if (!id || !participantId || !currentItem || !isFacilitator) return;
    setActionLoading(true);
    try {
      const result = await roomApi.revealVotes(id, currentItem.id, participantId);
      setRevealedItemId(currentItem.id);
      setRevealedVotes(result.votes);
      setRevealedStats(result.statistics);
      setDeckDescriptions(room?.deckDescriptions ?? {});
      fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reveal votes");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRevote() {
    if (!id || !participantId || !currentItem || !isFacilitator) return;
    setActionLoading(true);
    try {
      await roomApi.revote(id, currentItem.id, participantId);
      setRevealedVotes([]);
      setRevealedStats(null);
      setRevealedItemId(null);
      setMyVote(null);
      fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to re-vote");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRecordFinal() {
    if (!id || !participantId || !currentItem || !isFacilitator) return;
    const value = finalEstimate || revealedStats?.suggestedEstimate;
    if (!value) return;
    setActionLoading(true);
    try {
      await roomApi.recordFinalEstimate(id, currentItem.id, participantId, value);
      setFinalEstimate("");
      fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record final estimate");
    } finally {
      setActionLoading(false);
    }
  }

  function openEditItem(item: Item) {
    setEditItem(item);
    setItemTitle(item.title);
    setItemDesc(item.description ?? "");
    setItemFormError("");
  }

  if (loading || !id) {
    return (
      <div className="room-lobby">
        <p>Loading...</p>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="room-lobby">
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
      <div className="room-lobby">
        <Card>
          <p>You need to join this room first.</p>
          <Link to={`/room/${id}/join`}>
            <Button variant="primary">Join room</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const statsContent = revealedStats && (
    <>
      <h3 style={{ fontSize: "0.95rem", margin: "0 0 12px" }}>Statistics</h3>
      <p style={{ margin: "4px 0", fontSize: "0.9rem" }}>
        Average: <strong>{revealedStats.average.toFixed(1)}</strong>
      </p>
      <p style={{ margin: "4px 0", fontSize: "0.9rem" }}>
        Median: <strong>{revealedStats.median.toFixed(1)}</strong>
      </p>
      <p style={{ margin: "4px 0", fontSize: "0.9rem" }}>
        Suggested: <strong>{revealedStats.suggestedEstimate}</strong>
      </p>
      <p style={{ margin: "8px 0 4px", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
        Distribution
      </p>
      <p style={{ margin: "0", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
        {Object.entries(revealedStats.voteDistribution)
          .map(([val, count]) => `${count}× ${val}`)
          .join(", ")}
      </p>
      <p style={{ margin: "8px 0 0", fontSize: "0.85rem" }}>
        Highest: {revealedStats.highest} · Lowest: {revealedStats.lowest}
      </p>
    </>
  );

  return (
    <div className="room-lobby">
      {/* Header: room name top-left */}
      <header className="room-lobby__header">
        <div className="room-lobby__header-left">
          <h1 style={{ fontSize: "1.25rem", margin: 0 }}>{room?.name ?? "Room"}</h1>
          <Badge status={isClosed ? "closed" : "open"} />
        </div>
        <div className="room-lobby__header-right">
          {!isClosed && (
            <>
              {leaveConfirm ? (
                <>
                  <span style={{ alignSelf: "center", fontSize: "0.85rem" }}>
                    Leave? You&apos;ll need the link to rejoin.
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
                    <span style={{ alignSelf: "center", fontSize: "0.85rem" }}>
                      Close room? No votes after closing.
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
            </>
          )}
        </div>
      </header>

      {isFacilitator && !isClosed && (
        <div style={{ flexShrink: 0 }}>
          <Button variant="secondary" onClick={copyShareLink} style={{ fontSize: "0.9rem" }}>
            {linkCopied ? "Copied!" : "Copy share link"}
          </Button>
        </div>
      )}

      {error && (
        <p style={{ color: "var(--color-error)", margin: 0 }}>{error}</p>
      )}

      {isClosed && countdown !== null && (
        <Card
          style={{
            flexShrink: 0,
            textAlign: "center",
            padding: "16px 24px",
            background: "var(--color-surface)",
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: "1rem" }}>
            Room closed. Redirecting to create a new room in{" "}
            <strong style={{ fontSize: "1.25rem" }}>{countdown}</strong> second
            {countdown !== 1 ? "s" : ""}…
          </p>
          <Button variant="primary" onClick={notifyRoomClosedAndNavigate}>
            Go now
          </Button>
        </Card>
      )}

      {/* Body: table + sidebar */}
      <div className="room-lobby__body">
        <main className="room-lobby__main">
          {/* Desk/table with player cards around it */}
          <div className="room-lobby__table" style={{ position: "relative" }}>
            {/* Player cards around the table */}
            {currentItem && voters.length > 0 && (
              <div className="room-lobby__player-cards">
                {voters.map((p, i) => {
                  const pos = getEllipsePosition(i, voters.length);
                  const vote = voteByParticipant.get(p.id);
                  const isHigh = isRevealed && vote && vote.cardValue === highest;
                  const isLow = isRevealed && vote && vote.cardValue === lowest;
                  const hasVoted = p.id === participantId && myVote !== null;
                  const displayValue = isRevealed && vote
                    ? vote.cardValue
                    : isVoting
                      ? hasVoted
                        ? "✓"
                        : "?"
                      : "";
                  return (
                    <div
                      key={p.id}
                      className="room-lobby__player-card-wrap"
                      style={{
                        left: `${pos.left}%`,
                        top: `${pos.top}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div
                        className={`room-lobby__player-card ${
                          isVoting || (isRevealed && !!vote) ? "room-lobby__player-card--voted" : ""
                        } ${hasVoted && isVoting ? "room-lobby__player-card--voted-confirm" : ""} ${
                          isHigh ? "room-lobby__player-card--revealed-high" : ""
                        } ${isLow ? "room-lobby__player-card--revealed-low" : ""}`}
                      >
                        {displayValue || (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              color: "var(--color-text-secondary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "100%",
                            }}
                          >
                            {p.displayName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="room-lobby__player-card-name">{p.displayName}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Content inside the table */}
            <div className="room-lobby__table-content">
              {!currentItem ? (
                <>
                  <h2>
                    {items.length === 0 ? "No item yet" : "All items estimated"}
                  </h2>
                  <p>
                    {isFacilitator && !isClosed && (
                      <Button
                        variant="primary"
                        onClick={() => {
                          setAddItemOpen(true);
                          setItemTitle("");
                          setItemDesc("");
                          setItemFormError("");
                        }}
                      >
                        {items.length === 0 ? "Add item" : "Add next item"}
                      </Button>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <h2>{currentItem.title}</h2>
                  {currentItem.description && (
                    <p style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                      {currentItem.description}
                    </p>
                  )}
                  {isVoting && (
                    <p style={{ marginTop: 12, fontSize: "0.95rem" }}>
                      {votingCount} of {totalVoters} voted
                    </p>
                  )}
                  {isRevealed && revealedStats && (
                    <div style={{ marginTop: 12 }}>
                      <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                        Suggested: {revealedStats.suggestedEstimate}
                      </p>
                    </div>
                  )}
                  {currentItem.finalEstimate && (
                    <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                      Final: {currentItem.finalEstimate}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Facilitator actions (reveal, re-vote, finalize) */}
          {currentItem && isFacilitator && !isClosed && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 16,
                justifyContent: "center",
              }}
            >
              {isVoting && (
                <>
                  <Button variant="primary" onClick={handleReveal} loading={actionLoading}>
                    Reveal votes
                  </Button>
                  <Button variant="secondary" onClick={() => openEditItem(currentItem)}>
                    Edit item
                  </Button>
                  {votingCount === 0 && (
                    <Button variant="destructive" onClick={() => setRemoveConfirmItem(currentItem)}>
                      Remove item
                    </Button>
                  )}
                </>
              )}
              {isRevealed && (
                <>
                  <Button variant="secondary" onClick={handleRevote} loading={actionLoading}>
                    Re-vote
                  </Button>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Select
                      value={finalEstimate || revealedStats?.suggestedEstimate || ""}
                      onChange={(e) => setFinalEstimate(e.target.value)}
                      wrapperStyle={{ marginBottom: 0, minWidth: 100 }}
                    >
                      <option value="">Select...</option>
                      {room?.deckValues.map((v) => (
                        <option key={v} value={v}>
                          {v}
                          {v === revealedStats?.suggestedEstimate ? " (suggested)" : ""}
                        </option>
                      ))}
                    </Select>
                    <Button
                      variant="primary"
                      onClick={handleRecordFinal}
                      loading={actionLoading}
                      disabled={!finalEstimate && !revealedStats?.suggestedEstimate}
                    >
                      Confirm final
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mobile: statistics below table */}
          {statsContent && (
            <Card className="room-lobby__stats-mobile" style={{ width: "100%", maxWidth: 400 }}>
              {statsContent}
            </Card>
          )}
        </main>

        {/* Right sidebar: statistics + estimated items (old monitor style) */}
        <aside className="room-lobby__sidebar">
          <div className="room-lobby__sidebar-inner">
            {statsContent}
            {items.filter((i) => i.finalEstimate).length > 0 ? (
              <>
                <h3 style={{ marginTop: statsContent ? 16 : 0 }}>Estimated items</h3>
                <ul>
                  {items
                    .filter((i) => i.finalEstimate)
                    .map((i) => (
                      <li key={i.id}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                          {i.title}
                        </span>
                        <span className="room-lobby__sidebar-estimate">{i.finalEstimate}</span>
                      </li>
                    ))}
                </ul>
              </>
            ) : (
              !statsContent && <p style={{ margin: 0, opacity: 0.5 }}>---</p>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom: card deck for voting */}
      {currentItem && isVoting && !isObserver && (
        <div className="room-lobby__deck">
          <p style={{ margin: "0 0 8px", fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
            Choose a card (tap to select, tap again to deselect, tap another to change)
          </p>
          <div className="room-lobby__deck-inner">
            {room?.deckValues.map((val) => (
              <button
                key={val}
                type="button"
                className={`room-lobby__deck-card ${
                  myVote === val ? "room-lobby__deck-card--selected" : ""
                }`}
                onClick={() => handleVote(val)}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Participants list (compact) */}
      <Card style={{ flexShrink: 0 }}>
        <h2 style={{ fontSize: "1rem", margin: "0 0 8px" }}>
          Participants ({participants.length})
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {participants.map((p) => (
            <span
              key={p.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                background: "var(--color-bg)",
                borderRadius: 999,
                fontSize: "0.9rem",
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  color: "var(--color-primary-text)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                {p.displayName.charAt(0).toUpperCase()}
              </span>
              {p.displayName}
              {p.role === ParticipantRole.FACILITATOR && (
                <span style={{ color: "var(--color-secondary)", fontSize: "0.8rem" }}>host</span>
              )}
              {p.role === ParticipantRole.OBSERVER && (
                <span style={{ color: "var(--color-text-secondary)", fontSize: "0.8rem" }}>
                  obs
                </span>
              )}
            </span>
          ))}
        </div>
      </Card>

      {addItemOpen && (
        <ItemFormModal
          title="Add item"
          itemTitle={itemTitle}
          itemDesc={itemDesc}
          error={itemFormError}
          onTitleChange={setItemTitle}
          onDescChange={setItemDesc}
          onSubmit={handleAddItem}
          onCancel={() => {
            setAddItemOpen(false);
            setItemTitle("");
            setItemDesc("");
            setItemFormError("");
          }}
          isLoading={actionLoading}
        />
      )}

      {editItem && (
        <ItemFormModal
          title="Edit item"
          itemTitle={itemTitle}
          itemDesc={itemDesc}
          error={itemFormError}
          onTitleChange={setItemTitle}
          onDescChange={setItemDesc}
          onSubmit={handleUpdateItem}
          onCancel={() => {
            setEditItem(null);
            setItemTitle("");
            setItemDesc("");
            setItemFormError("");
          }}
          isLoading={actionLoading}
        />
      )}

      {removeConfirmItem && (
        <Modal onClose={() => setRemoveConfirmItem(null)}>
          <h2 style={{ margin: "0 0 16px" }}>Remove item</h2>
          <p style={{ marginBottom: 16 }}>
            Remove &quot;{removeConfirmItem.title}&quot;? This cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="destructive" onClick={handleRemoveItem} loading={actionLoading}>
              Remove
            </Button>
            <Button variant="secondary" onClick={() => setRemoveConfirmItem(null)}>
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
