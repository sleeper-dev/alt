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
import {
  addUserConnection,
  removeUserConnection,
  removeUserFromRoom,
  roomPresence,
} from "./presence.js";

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
        return next(new Error("NO_TOKEN"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.sub).select("_id username");
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("AUTH_ERROR"));
    }
  });

  io.on("connection", async (socket) => {
    registerRoomHandlers(io, socket);
    registerMessageHandlers(io, socket);
    registerTypingHandlers(io, socket);
    registerUserHandlers(io, socket);

    console.log(`${socket.user.username} connected`);

    const userId = socket.user._id.toString();

    addUserConnection(userId, socket.user.username, socket.id);

    await User.findByIdAndUpdate(userId, {
      status: "online",
    });

    socket.on("disconnect", async () => {
      removeUserConnection(userId, socket.id);

      for (const [roomName, users] of roomPresence.entries()) {
        if (users.has(userId)) {
          removeUserFromRoom(roomName, userId);
        }
      }

      if (socket.currentRoom) {
        await leaveRoom(io, socket, socket.currentRoom);
      }
      console.log(`${socket.user.username} disconnected`);
    });
  });

  return io;
};
