const onlineUsers = new Map();

export const registerUserHandlers = (io, socket) => {
  onlineUsers.set(socket.id, {
    userId: socket.user._id.toString(),
    username: socket.user.username,
  });

  io.emit("onlineUsers", Array.from(onlineUsers.values()));

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.values()));
  });
};
