import {
  emitRoomUsers,
  joinRoom,
  leaveRoom,
} from "../modules/rooms/room.helper.js";
import { Room } from "../modules/rooms/room.model.js";
import bcrypt from "bcrypt";
import { addUserToRoom, roomPresence } from "./presence.js";

export const registerRoomHandlers = (io, socket) => {
  socket.on("room:join", async ({ roomName, password }) => {
    try {
      if (!roomName) return;

      const normalized = roomName.toLowerCase().trim();

      const room = await Room.findOne({
        name: normalized,
        isActive: true,
      }).select("+password");

      if (!room) {
        return socket.emit("room:join:error", "Room not found");
      }

      await joinRoom({
        io,
        socket,
        room,
        password,
      });
    } catch (err) {
      console.error(err);
      socket.emit("room:join:error", "Something went wrong");
    }
  });

  socket.on("room:leave", async () => {
    try {
      if (!socket.currentRoom) return;
      await leaveRoom(io, socket, socket.currentRoom);
    } catch (err) {
      console.error(err);
    }
  });
};
