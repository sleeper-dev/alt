import { joinRoom } from "../../rooms/room.helper.js";
import { Room } from "../../rooms/room.model.js";

export default {
  name: "random",
  description: "Join a random public room",
  usage: "/random",

  async execute({ socket, io }) {
    const rooms = await Room.find({
      isPrivate: false,
      isActive: true,
      bannedUsers: {
        $ne: socket.user._id,
      },
    });

    const availableRooms = rooms.filter((r) => r.name !== socket.currentRoom);

    if (availableRooms.length === 0) {
      return socket.emit("command:error", "No random rooms available");
    }

    const randomRoom =
      availableRooms[Math.floor(Math.random() * availableRooms.length)];

    await joinRoom({
      io,
      socket,
      room: randomRoom,
    });
  },
};
