import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import { validateSocketAuth } from "./auth-validator";
import { registerSocketHandlers } from "./socket-handler";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types";

const PORT = process.env.PORT ?? 3001;
const NEXT_APP_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

const app = express();

app.use(cors({ origin: NEXT_APP_URL, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, ts: new Date().toISOString() });
});

const httpServer = createServer(app);

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>(httpServer, {
  cors: { origin: NEXT_APP_URL, credentials: true },
});

// Validate every incoming socket connection before any events fire
io.use(async (socket, next) => {
  try {
    await validateSocketAuth(socket);
    next();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    next(new Error(message));
  }
});

io.on("connection", (socket) => {
  console.log(`[socket] + ${socket.data.userId} (${socket.id})`);
  registerSocketHandlers(io, socket);

  socket.on("disconnect", (reason) => {
    console.log(`[socket] - ${socket.data.userId} (${reason})`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket server listening on port ${PORT}`);
});
