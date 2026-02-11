import { roomPresence } from "../../../socket/presence.js";
import { Room } from "../../rooms/room.model.js";

export default {
  name: "delete",
  description: "Delete the current room (owner only)",
  usage: "/delete <roomName>",
  roles: ["owner"],

  async execute({ socket, args, io }) {
    const roomNameArg = args[0];

    if (!roomNameArg) {
      return socket.emit("command:error", "Usage: /delete <roomName>");
    }

    const room = await Room.findOne({ name: roomNameArg });

    if (!room) {
      return socket.emit("command:error", "Room not found");
    }

    if (socket.currentRoom !== room.name) {
      return socket.emit(
        "command:error",
        "You must be inside the room you want to delete",
      );
    }

    const sockets = await io.in(room.name).fetchSockets();

    for (const s of sockets) {
      s.leave(room.name);
      s.currentRoom = null;
      s.emit("room:deleted", { roomName: room.name });
    }

    roomPresence.delete(room.name);

    room.isActive = false;
    await room.save();
  },
};
