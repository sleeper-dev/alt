import { roomPresence, userConnections } from "../../../socket/presence.js";
import { User } from "../../users/user.model.js";

export default {
  name: "whois",
  description: "Shows user online status",
  usage: "/whois @username",
  roles: [],

  async execute({ socket, args }) {
    const username = args[0]?.replace("@", "");

    if (!username) {
      return socket.emit("command:error", "No user specified");
    }

    const targetUser = await User.findOne({ username });

    if (!targetUser) {
      return socket.emit("command:error", "User not found");
    }

    const targetUserId = targetUser._id.toString();

    const isOnline = userConnections.has(targetUserId);

    if (isOnline) {
      const rooms = [];
      for (const [roomName, users] of roomPresence.entries()) {
        if (users.has(targetUserId)) {
          rooms.push(roomName);
        }
      }

      let message = `${username} is ONLINE`;

      if (rooms.length > 0) {
        message += `\nIn room(s): ${rooms.map((r) => `#${r}`).join(", ")}`;
      } else {
        message += `\nNot currently inside a room`;
      }

      return socket.emit("system:message", {
        content: message,
        createdAt: new Date(),
        system: true,
      });
    }

    const lastSeen = targetUser.lastSeen
      ? new Date(targetUser.lastSeen).toLocaleString()
      : "Unknown";

    const message = `${username} is OFFLINE\nLast seen: ${lastSeen}`;

    socket.emit("system:message", {
      content: message,
      createdAt: new Date(),
      system: true,
    });
  },
};
