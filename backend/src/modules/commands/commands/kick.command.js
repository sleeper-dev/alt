import { leaveRoom } from "../../rooms/room.helper.js";
import { User } from "../../users/user.model.js";

export default {
  name: "kick",
  description: "Kick a user from the room",
  usage: "/kick @username",
  roles: ["owner"],

  async execute({ socket, args, io, room }) {
    const usernameToKick = args[0]?.replace("@", "");
    if (!usernameToKick) {
      return socket.emit("command:error", "No user specified");
    }

    const userToKick = await User.findOne({ username: usernameToKick });
    if (!userToKick) {
      return socket.emit("command:error", "User not found");
    }

    if (userToKick._id.equals(socket.user._id)) {
      return socket.emit("command:error", "You cannot kick yourself");
    }

    const allSockets = Array.from(io.sockets.sockets.values());
    const targetSockets = allSockets.filter((s) =>
      s.user?._id.equals(userToKick._id),
    );

    if (targetSockets.length === 0) {
      return socket.emit("command:error", "User is not online");
    }

    let wasInRoom = false;

    for (const s of targetSockets) {
      if (s.rooms.has(room.name)) {
        wasInRoom = true;

        leaveRoom(io, s, room.name);
        s.emit("room:kicked", { roomName: room.name });
      }
    }

    if (!wasInRoom) {
      return socket.emit("command:error", "User is not in this room");
    }

    io.to(room.name).emit("system:message", {
      roomName: room.name,
      content: `${usernameToKick} was kicked by ${socket.user.username}`,
      createdAt: new Date(),
      system: true,
    });
  },
};
