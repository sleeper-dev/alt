import { handleCommand } from "../modules/commands/commandHandler.js";
import { Message } from "../modules/messages/messages.model.js";
import { Room } from "../modules/rooms/room.model.js";

export const registerMessageHandlers = (io, socket) => {
  socket.on("message:send", async ({ roomName, content }) => {
    try {
      if (!roomName || !content?.trim()) return;

      const normalized = roomName.toLowerCase().trim();

      const room = await Room.findOne({ name: normalized });
      if (!room) return;

      const message = await Message.create({
        room: room._id,
        sender: socket.user._id,
        content: content.trim(),
      });

      io.to(normalized).emit("message:new", {
        id: message._id,
        roomName: normalized,
        content: message.content,
        sender: { username: socket.user.username, _id: socket.user._id },
        createdAt: message.createdAt,
      });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("command:send", async ({ command }) => {
    await handleCommand({
      socket,
      io,
      rawCommand: command,
    });
  });
};

export const registerTypingHandlers = (io, socket) => {
  socket.on("typing:start", ({ roomName }) => {
    if (!roomName) return;

    const normalized = roomName.toLowerCase().trim();

    socket.to(normalized).emit("typing:start", {
      userId: socket.user._id,
      username: socket.user.username,
    });
  });

  socket.on("typing:stop", ({ roomName }) => {
    if (!roomName) return;

    const normalized = roomName.toLowerCase().trim();

    socket.to(normalized).emit("typing:stop", {
      userId: socket.user._id,
    });
  });
};
