import { User } from "../../users/user.model.js";

export default {
  name: "ban",
  description: "Ban a user from the room",
  usage: "/ban @username",
  roles: ["owner"],

  async execute({ socket, args, io, room }) {
    const usernameToBan = args[0]?.replace("@", "");
    if (!usernameToBan) {
      return socket.emit("command:error", "No user specified");
    }

    const userToBan = await User.findOne({ username: usernameToBan });
    if (!userToBan) {
      return socket.emit("command:error", "User not found");
    }

    if (userToBan._id.equals(socket.user._id)) {
      return socket.emit("command:error", "You cannot ban yourself");
    }

    if (room.bannedUsers.some((id) => id.equals(userToBan._id))) {
      return socket.emit("command:error", "User already banned");
    }

    room.bannedUsers.push(userToBan._id);
    await room.save();

    const allSockets = Array.from(io.sockets.sockets.values());
    const bannedSockets = allSockets.filter((s) =>
      s.user._id.equals(userToBan._id),
    );

    for (const s of bannedSockets) {
      s.emit("room:banned", { roomName: room.name });

      if (s.rooms.has(room.name)) {
        s.leave(room.name);
      }
    }

    io.to(room.name).emit("system:message", {
      roomName: room.name,
      content: `${usernameToBan} was banned by ${socket.user.username}`,
      createdAt: new Date(),
      system: true,
    });
  },
};
