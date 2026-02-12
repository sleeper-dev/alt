export default {
  name: "unlock",
  description: "Make the room public",
  usage: "/unlock",
  roles: ["owner"],

  async execute({ socket, io, room }) {
    if (!room.isPrivate) {
      return socket.emit("command:error", "Room is already public");
    }

    room.isPrivate = false;
    room.password = null;
    await room.save();

    io.to(room.name).emit("system:message", {
      roomName: room.name,
      content: `Room was unlocked by ${socket.user.username}`,
      createdAt: new Date(),
      system: true,
    });

    io.emit("room:updated", {
      room: {
        _id: room._id,
        name: room.name,
        isPrivate: room.isPrivate,
      },
    });
  },
};
