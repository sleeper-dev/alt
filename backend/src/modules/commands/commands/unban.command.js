import { User } from "../../users/user.model.js";

export default {
  name: "unban",
  description: "Unban a user from the room",
  usage: "/unban @username",
  roles: ["owner"],

  async execute({ socket, args, io, room }) {
    const usernameToUnban = args[0]?.replace("@", "");
    if (!usernameToUnban) {
      return socket.emit("command:error", "No user specified");
    }

    const userToUnban = await User.findOne({ username: usernameToUnban });
    if (!userToUnban) {
      return socket.emit("command:error", "User not found");
    }

    if (!room.bannedUsers.some((id) => id.equals(userToUnban._id))) {
      return socket.emit("command:error", "User is not banned");
    }

    room.bannedUsers = room.bannedUsers.filter(
      (id) => !id.equals(userToUnban._id),
    );
    await room.save();

    io.to(room.name).emit("system:message", {
      roomName: room.name,
      content: `${usernameToUnban} was unbanned by ${socket.user.username}`,
      createdAt: new Date(),
      system: true,
    });

    const allSockets = Array.from(io.sockets.sockets.values());
    const unbannedSockets = allSockets.filter((s) =>
      s.user._id.equals(userToUnban._id),
    );

    for (const s of unbannedSockets) {
      s.emit("room:unbanned", { roomName: room.name });
    }
  },
};
