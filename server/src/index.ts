/**
 * Planning Poker server — REST API + WebSocket.
 * Phase 2.2, 2.3 — Room management and real-time presence.
 */

import { createServer } from "node:http";
import express from "express";
import { Server as SocketIOServer } from "socket.io";
import {
  createRoom,
  joinRoom,
  leaveRoom,
  closeRoom,
  getRoom,
  getActiveParticipants,
  addItem,
  updateItem,
  removeItem,
  castVote,
  revealVotes,
  revote,
  recordFinalEstimate,
  getItemsByRoom,
  getRoundById,
  getVotesByRound,
  getVoteCountForRound,
  getVotingParticipantCount,
  rooms,
  participants,
} from "./store.js";
import {
  DeckType,
  RoomState,
  ParticipantRole,
} from "shared";

const app = express();
const parsedPort = parseInt(process.env.PORT ?? "", 10);
const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 3000;

app.use(express.json());

// CORS for web app
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// --- REST API (Phase 2.2) ---

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// 2.2.1 POST /api/rooms — Create room
app.post("/api/rooms", (req, res) => {
  try {
    const { name, deckType, baseUrl: clientBaseUrl } = req.body;
    if (!name || typeof name !== "string") {
      res.status(400).json({ error: "Room name is required" });
      return;
    }
    const dt = deckType ?? DeckType.FIBONACCI;
    if (!Object.values(DeckType).includes(dt)) {
      res.status(400).json({ error: "Invalid deck type" });
      return;
    }

    const origin =
      (typeof clientBaseUrl === "string" ? clientBaseUrl : null) ??
      req.get("origin") ??
      req.get("referer")?.replace(/\/$/, "") ??
      "http://localhost:5173";
    const baseUrl = origin.replace(/\/$/, "");

    const result = createRoom({ name, deckType: dt, baseUrl });

    res.status(201).json({
      room: result.room,
      participant: result.participant,
      shareableLink: result.shareableLink,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create room";
    res.status(400).json({ error: msg });
  }
});

// 2.2.2 GET /api/rooms/:id — Get room
app.get("/api/rooms/:id", (req, res) => {
  const room = getRoom(req.params.id);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }
  res.json(room);
});

// 2.2.3 POST /api/rooms/:id/join — Join room
app.post("/api/rooms/:id/join", (req, res) => {
  try {
    const roomId = req.params.id;
    const { displayName, role } = req.body;
    if (!displayName || typeof displayName !== "string") {
      res.status(400).json({ error: "Display name is required" });
      return;
    }
    const r = role === "OBSERVER" ? ParticipantRole.OBSERVER : ParticipantRole.PARTICIPANT;

    const result = joinRoom({ roomId, displayName, role: r });

    // Emit via WebSocket (io is set below)
    const io = (app as unknown as { io?: SocketIOServer }).io;
    if (io) {
      io.to(roomId).emit("participantJoined", result.participant);
    }

    res.status(201).json({ participant: result.participant, room: result.room });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to join room";
    const status = msg.includes("not found") ? 404 : msg.includes("closed") ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// 2.2.4 POST /api/rooms/:id/leave — Leave room
app.post("/api/rooms/:id/leave", (req, res) => {
  try {
    const { participantId } = req.body;
    if (!participantId || typeof participantId !== "string") {
      res.status(400).json({ error: "participantId is required" });
      return;
    }
    const roomId = req.params.id;
    const participant = participants.get(participantId);
    leaveRoom(roomId, participantId);

    const io = (app as unknown as { io?: SocketIOServer }).io;
    if (io && participant) {
      io.to(roomId).emit("participantLeft", participant);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to leave room";
    res.status(400).json({ error: msg });
  }
});

// 2.2.5 POST /api/rooms/:id/close — Close room
app.post("/api/rooms/:id/close", (req, res) => {
  try {
    const { participantId } = req.body;
    if (!participantId || typeof participantId !== "string") {
      res.status(400).json({ error: "participantId is required" });
      return;
    }
    const roomId = req.params.id;
    closeRoom(roomId, participantId);

    const io = (app as unknown as { io?: SocketIOServer }).io;
    if (io) {
      io.to(roomId).emit("roomClosed", { roomId, state: RoomState.CLOSED });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to close room";
    const status = msg.includes("facilitator") ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// GET /api/rooms/:id/participants — List active participants
app.get("/api/rooms/:id/participants", (req, res) => {
  const room = getRoom(req.params.id);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }
  const list = getActiveParticipants(req.params.id);
  res.json({ participants: list });
});

// --- Estimation API (Phase 3.2) ---

// GET /api/rooms/:id/items — List items with current round state
app.get("/api/rooms/:id/items", (req, res) => {
  const room = getRoom(req.params.id);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }
  const list = getItemsByRoom(req.params.id);
  const itemsWithRound = list.map((item) => {
    const round = item.currentRoundId ? getRoundById(item.currentRoundId) : null;
    const currentRound = round
      ? {
          id: round.id,
          state: round.state,
          roundNumber: round.roundNumber,
          votedCount: getVoteCountForRound(round.id),
        }
      : null;
    return { ...item, currentRound };
  });
  res.json({ items: itemsWithRound });
});

// POST /api/rooms/:id/items — Add item
app.post("/api/rooms/:id/items", (req, res) => {
  try {
    const roomId = req.params.id;
    const { title, description, participantId } = req.body;
    if (!title || typeof title !== "string") {
      res.status(400).json({ error: "Title is required" });
      return;
    }
    if (!participantId || typeof participantId !== "string") {
      res.status(400).json({ error: "participantId is required" });
      return;
    }
    const item = addItem({ roomId, title, description: description ?? null, participantId });
    const io = (app as unknown as { io?: SocketIOServer }).io;
    if (io) io.to(roomId).emit("itemAdded", item);
    res.status(201).json(item);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to add item";
    const status = msg.includes("not found") ? 404 : msg.includes("closed") ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// PATCH /api/rooms/:id/items/:itemId — Edit item
app.patch("/api/rooms/:id/items/:itemId", (req, res) => {
  try {
    const { id: roomId, itemId } = req.params;
    const { title, description, participantId } = req.body;
    if (!participantId || typeof participantId !== "string") {
      res.status(400).json({ error: "participantId is required" });
      return;
    }
    const item = updateItem({ roomId, itemId, title, description, participantId });
    const io = (app as unknown as { io?: SocketIOServer }).io;
    if (io) io.to(roomId).emit("itemUpdated", item);
    res.json(item);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update item";
    const status = msg.includes("not found") ? 404 : 400;
    res.status(status).json({ error: msg });
  }
});

// DELETE /api/rooms/:id/items/:itemId — Remove item (participantId in query for DELETE)
app.delete("/api/rooms/:id/items/:itemId", (req, res) => {
  try {
    const { id: roomId, itemId } = req.params;
    const participantId = req.query.participantId ?? req.body?.participantId;
    if (!participantId || typeof participantId !== "string") {
      res.status(400).json({ error: "participantId is required (query or body)" });
      return;
    }
    removeItem(roomId, itemId, participantId);
    const io = (app as unknown as { io?: SocketIOServer }).io;
    if (io) io.to(roomId).emit("itemRemoved", { itemId });
    res.status(200).json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to remove item";
    const status = msg.includes("not found") ? 404 : 400;
    res.status(status).json({ error: msg });
  }
});

// POST /api/rooms/:id/items/:itemId/vote — Cast vote
app.post("/api/rooms/:id/items/:itemId/vote", (req, res) => {
  try {
    const { id: roomId, itemId } = req.params;
    const { participantId, cardValue } = req.body;
    if (!participantId || typeof participantId !== "string") {
      res.status(400).json({ error: "participantId is required" });
      return;
    }
    if (!cardValue || typeof cardValue !== "string") {
      res.status(400).json({ error: "cardValue is required" });
      return;
    }
    castVote({ roomId, itemId, participantId, cardValue });
    const item = rooms.get(roomId) ? getItemsByRoom(roomId).find((i) => i.id === itemId) : null;
    const roundId = item?.currentRoundId;
    if (roundId) {
      const votedCount = getVoteCountForRound(roundId);
      const totalCount = getVotingParticipantCount(roomId);
      const io = (app as unknown as { io?: SocketIOServer }).io;
      if (io) io.to(roomId).emit("voteCount", { itemId, votedCount, totalCount });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to cast vote";
    const status = msg.includes("not found") ? 404 : msg.includes("closed") ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// POST /api/rooms/:id/items/:itemId/reveal — Reveal votes
app.post("/api/rooms/:id/items/:itemId/reveal", (req, res) => {
  try {
    const { id: roomId, itemId } = req.params;
    const { participantId } = req.body;
    if (!participantId || typeof participantId !== "string") {
      res.status(400).json({ error: "participantId is required" });
      return;
    }
    const room = getRoom(roomId);
    const result = revealVotes(roomId, itemId, participantId);
    const io = (app as unknown as { io?: SocketIOServer }).io;
    if (io) {
      io.to(roomId).emit("votesRevealed", {
        itemId,
        votes: result.votes,
        statistics: result.statistics,
        deckDescriptions: room?.deckDescriptions ?? undefined,
      });
    }
    res.status(200).json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to reveal votes";
    const status = msg.includes("not found") ? 404 : msg.includes("facilitator") ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// POST /api/rooms/:id/items/:itemId/revote — Re-vote
app.post("/api/rooms/:id/items/:itemId/revote", (req, res) => {
  try {
    const { id: roomId, itemId } = req.params;
    const { participantId } = req.body;
    if (!participantId || typeof participantId !== "string") {
      res.status(400).json({ error: "participantId is required" });
      return;
    }
    revote(roomId, itemId, participantId);
    const io = (app as unknown as { io?: SocketIOServer }).io;
    if (io) io.to(roomId).emit("revoteStarted", { itemId });
    res.status(200).json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to re-vote";
    const status = msg.includes("not found") ? 404 : msg.includes("facilitator") ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// POST /api/rooms/:id/items/:itemId/finalize — Record final estimate
app.post("/api/rooms/:id/items/:itemId/finalize", (req, res) => {
  try {
    const { id: roomId, itemId } = req.params;
    const { participantId, cardValue } = req.body;
    if (!participantId || typeof participantId !== "string") {
      res.status(400).json({ error: "participantId is required" });
      return;
    }
    if (!cardValue || typeof cardValue !== "string") {
      res.status(400).json({ error: "cardValue is required" });
      return;
    }
    const item = recordFinalEstimate(roomId, itemId, participantId, cardValue);
    const io = (app as unknown as { io?: SocketIOServer }).io;
    if (io) io.to(roomId).emit("finalEstimateRecorded", { item, finalEstimate: cardValue });
    res.status(200).json({ item });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to record final estimate";
    const status = msg.includes("not found") ? 404 : msg.includes("facilitator") ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// --- HTTP server + Socket.io (Phase 2.3) ---

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: { origin: "*" },
});

(app as unknown as { io?: SocketIOServer }).io = io;

// Map: socketId -> { roomId, participantId }
const socketSessions = new Map<string, { roomId: string; participantId: string }>();

io.on("connection", (socket) => {
  socket.on("joinRoom", (payload: { roomId: string; participantId: string }) => {
    const { roomId, participantId } = payload;
    if (!roomId || !participantId) return;
    const room = getRoom(roomId);
    if (!room) return;
    const participant = participants.get(participantId);
    if (!participant || participant.roomId !== roomId || !participant.isActive) return;

    socket.join(roomId);
    socketSessions.set(socket.id, { roomId, participantId });
  });

  socket.on("disconnect", () => {
    const session = socketSessions.get(socket.id);
    socketSessions.delete(socket.id);
    if (session) {
      const { roomId, participantId } = session;
      const participant = participants.get(participantId);
      if (participant && participant.isActive) {
        leaveRoom(roomId, participantId);
        io.to(roomId).emit("participantLeft", participant);
      }
    }
  });
});

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port} (accepting connections from all interfaces)`);
});
