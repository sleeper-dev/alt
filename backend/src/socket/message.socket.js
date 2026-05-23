import { handleCommand } from "../modules/commands/commandHandler.js";
import { Message } from "../modules/messages/messages.model.js";
import { Room } from "../modules/rooms/room.model.js";

export const registerMessageHandlers = (io, socket, slowModeTracker) => {
  socket.on("message:send", async ({ roomName, content }) => {
    try {
      if (!roomName || !content?.trim()) return;

      const normalized = roomName.toLowerCase().trim();

      const room = await Room.findOne({ name: normalized });
      if (!room) return;

      const isOwner = socket.user._id.equals(room.ownerId);

      if (!isOwner && room.slowMode > 0) {
        const key = `${normalized}:${socket.user._id}`;

        const lastMessageAt = slowModeTracker.get(key);

        if (lastMessageAt) {
          const diff = (Date.now() - lastMessageAt) / 1000;

          if (diff < room.slowMode) {
            const remaining = Math.ceil(room.slowMode - diff);

            return socket.emit(
              "command:error",
              `Slowmode enabled. Wait ${remaining}s.`,
            );
          }
        }

        slowModeTracker.set(key, Date.now());
      }

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
      roomName: normalized,
      userId: socket.user._id,
      username: socket.user.username,
    });
  });

  socket.on("typing:stop", ({ roomName }) => {
    if (!roomName) return;

    const normalized = roomName.toLowerCase().trim();

    socket.to(normalized).emit("typing:stop", {
      roomName: normalized,
      userId: socket.user._id,
    });
  });
};
