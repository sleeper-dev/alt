import { User } from "../../users/user.model.js";

export default {
  name: "banlist",
  description: "List all banned users in the room",
  usage: "/banlist",
  roles: ["owner"],

  async execute({ socket, io, room }) {
    if (!room) return socket.emit("command:error", "Room not found");

    const bannedUsers = await User.find({
      _id: { $in: room.bannedUsers },
    }).select("username");

    const usernames = bannedUsers.map((u) => u.username).join(", ");

    io.to(room.name).emit("system:message", {
      roomName: room.name,
      content: !usernames
        ? "No banned users in this room"
        : `Banned users: ${usernames}`,
      createdAt: new Date(),
      system: true,
    });
  },
};
