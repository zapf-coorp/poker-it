/**
 * Room Lobby — Estimation board.
 * Phase 3: Add item, voting, reveal, re-vote, record final estimate.
 * See drivin-design/spec.MD §6, ui-definition.MD §7.3, §7.10.
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import type { Room, Participant, Item, Vote, VoteStatistics } from "shared";
import { RoomState, ParticipantRole, RoundState } from "shared";
import { roomApi } from "../api";
import { getStoredParticipant, clearStoredParticipant } from "../storage";
import { createRoomSocket } from "../api";
import type { Socket } from "socket.io-client";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { Input } from "../components/Input";
import { Link } from "react-router-dom";

interface ItemWithRound extends Item {
  currentRound?: {
    id: string;
    state: RoundState;
    roundNumber: number;
    votedCount: number;
  };
}

interface RevealedVote extends Vote {
  participantName: string;
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
  const [, setSocket] = useState<Socket | null>(null);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [closeConfirm, setCloseConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Add/Edit item modal
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [itemTitle, setItemTitle] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemFormError, setItemFormError] = useState("");
  const [removeConfirmItem, setRemoveConfirmItem] = useState<Item | null>(null);

  // Revealed state (from WebSocket or after reveal API)
  const [revealedVotes, setRevealedVotes] = useState<RevealedVote[]>([]);
  const [revealedStats, setRevealedStats] = useState<VoteStatistics | null>(null);
  const [revealedItemId, setRevealedItemId] = useState<string | null>(null);
  const [deckDescriptions, setDeckDescriptions] = useState<Record<string, string>>({});

  // My vote (for UI feedback)
  const [myVote, setMyVote] = useState<string | null>(null);
  const [finalEstimate, setFinalEstimate] = useState<string>("");

  const shareableLink = id ? `${window.location.origin}/room/${id}` : "";

  const canVote = isFacilitator || participants.some((p) => p.id === participantId && p.role === ParticipantRole.PARTICIPANT);
  const isObserver = participants.find((p) => p.id === participantId)?.role === ParticipantRole.OBSERVER;

  const currentItem = items.find((i) => !i.finalEstimate && i.currentRoundId) ?? items.find((i) => !i.finalEstimate);
  const currentRound = currentItem?.currentRound;
  const isVoting = currentRound?.state === RoundState.VOTING;
  const isRevealed = currentRound?.state === RoundState.REVEALED && revealedItemId === currentItem?.id;

  const votingCount = currentRound?.votedCount ?? 0;
  const totalVoters = participants.filter(
    (p) => (p.role === ParticipantRole.PARTICIPANT || p.role === ParticipantRole.FACILITATOR) && p.isActive
  ).length;

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
    s.on("itemAdded", () => fetchItems());
    s.on("itemUpdated", () => fetchItems());
    s.on("itemRemoved", (payload: { itemId: string }) => {
      setItems((prev) => prev.filter((i) => i.id !== payload.itemId));
      if (revealedItemId === payload.itemId) {
        setRevealedVotes([]);
        setRevealedStats(null);
        setRevealedItemId(null);
      }
    });
    s.on("voteCount", (payload: { itemId: string; votedCount: number; totalCount: number }) => {
      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== payload.itemId || !i.currentRound) return i;
          return { ...i, currentRound: { ...i.currentRound, votedCount: payload.votedCount } };
        })
      );
    });
    s.on(
      "votesRevealed",
      (payload: {
        itemId: string;
        votes: RevealedVote[];
        statistics: VoteStatistics;
        deckDescriptions?: Record<string, string>;
      }) => {
        setRevealedItemId(payload.itemId);
        setRevealedVotes(payload.votes);
        setRevealedStats(payload.statistics);
        setDeckDescriptions(payload.deckDescriptions ?? {});
        setItems((prev) =>
          prev.map((i) => {
            if (i.id !== payload.itemId || !i.currentRound) return i;
            return { ...i, currentRound: { ...i.currentRound, state: RoundState.REVEALED } };
          })
        );
      }
    );
    s.on("revoteStarted", (payload: { itemId: string }) => {
      setRevealedVotes([]);
      setRevealedStats(null);
      setRevealedItemId(null);
      setMyVote(null);
      fetchItems();
    });
    s.on("finalEstimateRecorded", ({ item }: { item: Item }) => {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...item, currentRound: undefined } : i)).sort((a, b) => a.order - b.order)
      );
      setRevealedVotes([]);
      setRevealedStats(null);
      setRevealedItemId(null);
      setFinalEstimate("");
    });
    setSocket(s);
    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [id, participantId, room?.id, revealedItemId, fetchItems]);

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
      await roomApi.castVote(id, currentItem.id, participantId, cardValue);
      setMyVote(cardValue);
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

      {/* Current item */}
      <Card style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.1rem", margin: "0 0 8px" }}>Current item</h2>
        {!currentItem ? (
          <p style={{ color: "var(--color-text-secondary)", margin: "0 0 12px" }}>
            {items.length === 0 ? "No item yet." : "All items estimated."}
            {isFacilitator && !isClosed && (
              <>
                {" "}
                <Button variant="primary" onClick={() => { setAddItemOpen(true); setItemTitle(""); setItemDesc(""); setItemFormError(""); }}>
                  {items.length === 0 ? "Add item" : "Add next item"}
                </Button>
              </>
            )}
          </p>
        ) : (
          <>
            <div style={{ marginBottom: 8 }}>
              <strong>{currentItem.title}</strong>
              {currentItem.description && (
                <p style={{ color: "var(--color-text-secondary)", margin: "4px 0 0", fontSize: "0.9rem" }}>
                  {currentItem.description}
                </p>
              )}
            </div>
            {isFacilitator && !isClosed && isVoting && votingCount === 0 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <Button variant="secondary" onClick={() => openEditItem(currentItem)}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => setRemoveConfirmItem(currentItem)}>
                  Remove item
                </Button>
              </div>
            )}

            {/* Voting */}
            {isVoting && (
              <>
                {isObserver ? (
                  <p style={{ color: "var(--color-text-secondary)" }}>You are observing; no vote.</p>
                ) : (
                  <>
                    <p style={{ color: "var(--color-text-secondary)", marginBottom: 12 }}>
                      {votingCount} of {totalVoters} have voted
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 12,
                        marginBottom: 16,
                      }}
                    >
                      {room?.deckValues.map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleVote(val)}
                          style={{
                            minWidth: 56,
                            minHeight: 72,
                            padding: "12px 16px",
                            borderRadius: 8,
                            border: myVote === val ? "3px solid var(--color-primary)" : "2px solid var(--color-border)",
                            background: myVote === val ? "var(--color-surface)" : "var(--color-bg)",
                            color: "var(--color-text)",
                            fontSize: "1.25rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    {isFacilitator && (
                      <Button variant="primary" onClick={handleReveal} loading={actionLoading}>
                        Reveal votes
                      </Button>
                    )}
                  </>
                )}
              </>
            )}

            {/* Revealed */}
            {isRevealed && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: "1rem", margin: "0 0 8px" }}>Votes</h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {revealedVotes.map((v) => (
                      <li
                        key={v.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 0",
                          borderBottom: "1px solid var(--color-border)",
                        }}
                      >
                        <span>{v.participantName}</span>
                        <span style={{ fontWeight: 600 }}>
                          {v.cardValue}
                          {deckDescriptions[v.cardValue] && (
                            <span style={{ color: "var(--color-text-secondary)", fontWeight: 400, marginLeft: 8 }}>
                              ({deckDescriptions[v.cardValue]})
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {revealedStats && (
                  <div style={{ marginBottom: 16, padding: 12, background: "var(--color-bg)", borderRadius: 8 }}>
                    <h3 style={{ fontSize: "1rem", margin: "0 0 8px" }}>Statistics</h3>
                    <p style={{ margin: "4px 0" }}>
                      Average: {revealedStats.average.toFixed(1)} · Median: {revealedStats.median.toFixed(1)}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      Suggested estimate: <strong>{revealedStats.suggestedEstimate}</strong>
                    </p>
                    <p style={{ margin: "4px 0", fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
                      Distribution:{" "}
                      {Object.entries(revealedStats.voteDistribution)
                        .map(([val, count]) => `${count} voted ${val}`)
                        .join(", ")}
                    </p>
                    <p style={{ margin: "4px 0", fontSize: "0.9rem" }}>
                      Highest: {revealedStats.highest} · Lowest: {revealedStats.lowest}
                    </p>
                  </div>
                )}
                {isFacilitator && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <Button variant="secondary" onClick={handleRevote} loading={actionLoading}>
                      Re-vote
                    </Button>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <select
                        value={finalEstimate || revealedStats?.suggestedEstimate || ""}
                        onChange={(e) => setFinalEstimate(e.target.value)}
                        style={{
                          minHeight: 44,
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: "2px solid var(--color-border)",
                          background: "var(--color-surface)",
                          color: "var(--color-text)",
                        }}
                      >
                        <option value="">Select...</option>
                        {room?.deckValues.map((v) => (
                          <option key={v} value={v}>
                            {v}
                            {v === revealedStats?.suggestedEstimate ? " (suggested)" : ""}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="primary"
                        onClick={handleRecordFinal}
                        loading={actionLoading}
                        disabled={!finalEstimate && !revealedStats?.suggestedEstimate}
                      >
                        Confirm final estimate
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Finalized */}
            {currentItem.finalEstimate && (
              <p style={{ color: "var(--color-secondary)", fontWeight: 600 }}>
                Final estimate: {currentItem.finalEstimate}
              </p>
            )}
          </>
        )}
      </Card>

      {/* Estimated items list */}
      {items.filter((i) => i.finalEstimate).length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: "1.1rem", margin: "0 0 12px" }}>Estimated items</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {items
              .filter((i) => i.finalEstimate)
              .map((i) => (
                <li
                  key={i.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <span>{i.title}</span>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: 999,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      background: "var(--color-secondary)",
                      color: "#1a1a1a",
                    }}
                  >
                    {i.finalEstimate}
                  </span>
                </li>
              ))}
          </ul>
          {isFacilitator && !isClosed && (
            <Button variant="primary" onClick={() => { setAddItemOpen(true); setItemTitle(""); setItemDesc(""); setItemFormError(""); }} style={{ marginTop: 12 }}>
              Add next item
            </Button>
          )}
        </Card>
      )}

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

      {/* Add item modal */}
      {addItemOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 24,
          }}
          onClick={() => setAddItemOpen(false)}
        >
          <Card
            style={{ maxWidth: 400, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 16px" }}>Add item</h2>
            <Input
              label="Title"
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              placeholder="Item title"
              error={itemFormError}
            />
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: "0.9rem" }}>Description (optional)</label>
              <textarea
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                placeholder="Description"
                rows={3}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: "2px solid var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text)",
                  fontSize: "1rem",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="primary" onClick={handleAddItem} loading={actionLoading}>
                Save
              </Button>
              <Button variant="secondary" onClick={() => setAddItemOpen(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit item modal */}
      {editItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 24,
          }}
          onClick={() => setEditItem(null)}
        >
          <Card
            style={{ maxWidth: 400, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 16px" }}>Edit item</h2>
            <Input
              label="Title"
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              placeholder="Item title"
              error={itemFormError}
            />
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: "0.9rem" }}>Description (optional)</label>
              <textarea
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                placeholder="Description"
                rows={3}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: "2px solid var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text)",
                  fontSize: "1rem",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="primary" onClick={handleUpdateItem} loading={actionLoading}>
                Save
              </Button>
              <Button variant="secondary" onClick={() => setEditItem(null)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Remove confirmation */}
      {removeConfirmItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 24,
          }}
          onClick={() => setRemoveConfirmItem(null)}
        >
          <Card
            style={{ maxWidth: 400, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
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
          </Card>
        </div>
      )}
    </div>
  );
}
