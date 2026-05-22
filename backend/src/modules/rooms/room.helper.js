import {
  addUserToRoom,
  getRoomUsers,
  roomPresence,
} from "../../socket/presence.js";

import bcrypt from "bcrypt";

export const joinRoom = async ({ io, socket, room, password = "" }) => {
  const normalized = room.name.toLowerCase().trim();
  const userId = socket.user._id.toString();

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

  const wasAlreadyInRoom = roomPresence.get(normalized)?.has(userId);

  addUserToRoom(normalized, userId);

  if (!wasAlreadyInRoom) {
    socket.to(normalized).emit("system:message", {
      roomName: normalized,
      content: `--> ${socket.user.username} has joined the room`,
      createdAt: new Date(),
      system: true,
    });
  }

  await emitRoomUsers(io, normalized);

  socket.emit("room:joined", {
    room: normalized,
    systemMessage: `Joined #${normalized}`,
  });
};

export const leaveRoom = async (io, socket, roomName) => {
  if (!roomName) return;

  const normalized = roomName.toLowerCase().trim();
  const userId = socket.user._id.toString();

  socket.leave(normalized);

  const socketsInRoom = await io.in(normalized).fetchSockets();
  const stillInRoom = socketsInRoom.some(
    (s) => s.user._id.toString() === userId,
  );

  if (!stillInRoom) {
    const usersSet = roomPresence.get(normalized);

    if (usersSet) {
      usersSet.delete(userId);

      if (usersSet.size === 0) {
        roomPresence.delete(normalized);
      }
    }

    socket.to(normalized).emit("system:message", {
      roomName: normalized,
      content: `<-- ${socket.user.username} has left the room`,
      createdAt: new Date(),
      system: true,
    });
  }

  await emitRoomUsers(io, normalized);

  if (socket.currentRoom === normalized) socket.currentRoom = null;
  if (socket.joinedRooms) socket.joinedRooms.delete(normalized);

  socket.emit("room:left", { room: normalized });
};

export const emitRoomUsers = (io, roomName) => {
  const userIds = roomPresence.get(roomName);
  if (!userIds) return;

  const users = getRoomUsers(roomName);

  io.to(roomName).emit("room:users", {
    roomName,
    users,
  });
};
