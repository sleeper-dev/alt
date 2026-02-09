import { Room } from "../rooms/room.model.js";
import { commands } from "./index.js";

export const handleCommand = async ({ socket, io, rawCommand }) => {
  if (!rawCommand.startsWith("/")) return;

  const parts = rawCommand.slice(1).split(" ");
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1);

  const command = commands.find((c) => c.name === commandName);

  if (!command) {
    return socket.emit("command:error", "Unknown command");
  }

  const roomName = socket.currentRoom;
  if (!roomName) {
    return socket.emit("command:error", "You are not in a room");
  }

  const room = await Room.findOne({ name: roomName });
  if (!room) {
    return socket.emit("command:error", "Room not found");
  }

  if (command.roles?.includes("owner")) {
    if (!room.ownerId.equals(socket.user._id)) {
      return socket.emit("command:error", "Not authorized");
    }
  }

  try {
    await command.execute({ socket, args, io, room, commands });
  } catch (err) {
    console.error(err);
    socket.emit("command:error", "Command failed");
  }
};
