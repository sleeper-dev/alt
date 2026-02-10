import { emitRoomUsers, leaveRoom } from "../modules/rooms/room.helper.js";
import { Room } from "../modules/rooms/room.model.js";
import bcrypt from "bcrypt";

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

      if (room.bannedUsers.some((id) => id.equals(socket.user._id))) {
        return socket.emit("room:join:error", "You are banned from this room");
      }

      const isOwner = socket.user._id.equals(room.ownerId);

      if (room.isPrivate && !isOwner) {
        if (!password) {
          return socket.emit("room:join:error", "Room password required");
        }

        const isMatch = await bcrypt.compare(password, room.password);
        if (!isMatch) {
          return socket.emit("room:join:error", "Invalid room password");
        }
      }

      if (socket.currentRoom && socket.currentRoom !== normalized) {
        await leaveRoom(io, socket, socket.currentRoom);
      }

      socket.join(normalized);
      socket.currentRoom = normalized;
      await emitRoomUsers(io, normalized);

      socket.to(normalized).emit("system:message", {
        roomName: normalized,
        content: `${socket.user.username} has joined the room`,
        createdAt: new Date(),
        system: true,
      });

      socket.emit("room:joined", { room: normalized });
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
