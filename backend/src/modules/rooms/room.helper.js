export const leaveRoom = async (io, socket, roomName) => {
  if (!roomName) return;
  const normalized = roomName.toLowerCase().trim();

  socket.to(normalized).emit("system:message", {
    roomName: normalized,
    content: `${socket.user.username} has left the room`,
    createdAt: new Date(),
    system: true,
  });

  socket.leave(normalized);

  await emitRoomUsers(io, roomName);

  if (socket.currentRoom === normalized) socket.currentRoom = null;
  if (socket.joinedRooms) socket.joinedRooms.delete(normalized);

  socket.emit("room:left", { room: normalized });
};

export const emitRoomUsers = async (io, roomName) => {
  const sockets = await io.in(roomName).fetchSockets();

  const users = sockets.map((s) => ({
    userId: s.user._id,
    username: s.user.username,
  }));

  io.to(roomName).emit("room:users", {
    roomName,
    users,
  });
};
