import { getRoomUsers, roomPresence } from "../../socket/presence.js";

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
      content: `${socket.user.username} has left the room`,
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
