import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../modules/users/user.model.js";
import { registerRoomHandlers } from "./room.socket.js";
import {
  registerMessageHandlers,
  registerTypingHandlers,
} from "./message.socket.js";
import { registerUserHandlers } from "./user.socket.js";
import { leaveRoom } from "../modules/rooms/room.helper.js";

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.sub).select("_id username");
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    registerRoomHandlers(io, socket);
    registerMessageHandlers(io, socket);
    registerTypingHandlers(io, socket);
    registerUserHandlers(io, socket);

    console.log(`${socket.user.username} connected`);

    socket.on("disconnect", async () => {
      if (socket.currentRoom) {
        await leaveRoom(io, socket, socket.currentRoom);
      }
      console.log(`${socket.user.username} disconnected`);
    });
  });

  return io;
};
