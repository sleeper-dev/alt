import { leaveRoom } from "../../rooms/room.helper.js";

export default {
  name: "leave",
  description: "Leave the current room",
  usage: "/leave",
  roles: [],

  async execute({ socket, io }) {
    const currentRoom = socket.currentRoom;

    if (!currentRoom) {
      return socket.emit("command:error", "You are not in a room");
    }

    await leaveRoom(io, socket, currentRoom);
  },
};
