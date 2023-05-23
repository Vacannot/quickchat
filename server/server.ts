import express from "express";
import http from "http";
import cors from "cors";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  ServerSocketData,
} from "./types";
import { getRooms } from "./roomStore";
import { Server, Socket } from "socket.io";

const app = express();
app.use(cors());

const server = http.createServer(app);
const port = process.env.PORT || 3001;

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  ServerSocketData
>(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "DELETE"],
  },
});

io.use((socket: Socket, next) => {
  const username: string = socket.handshake.auth.username;

  if (!username || username.length < 2) {
    return next(new Error("Invalid Username"));
  }
  socket.data.username = username;
  next();
});

io.on("connection", (socket) => {
  if (!socket.data.username) return;

  if (socket.data.username) {
    socket.emit("connected", socket.data.username);
    socket.emit("roomList", getRooms(io));
  }

  socket.on("leave", (room) => {
    socket.leave(room);
    socket.emit("left", room);
    io.emit("roomList", getRooms(io));
  });

  socket.on("typing", (room) => {
    if (socket.data.username) {
      socket.broadcast.to(room).emit("isTyping", socket.data.username);
    }
  });

  socket.on("message", (message, room) => {
    io.to(room).emit("message", {
      body: message,
      from: socket.data.username!,
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server is working on port https://localhost:${port}`);
});
