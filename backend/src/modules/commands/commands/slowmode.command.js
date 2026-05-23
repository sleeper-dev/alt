export default {
  name: "slow",
  description: "Set room slowmode",
  usage: "/slow <seconds>",
  roles: ["owner"],

  async execute({ socket, args, io, room }) {
    const seconds = Number(args[0]);

    if (Number.isNaN(seconds) || seconds < 0) {
      return socket.emit("command:error", "Invalid slowmode value");
    }

    if (seconds > 300) {
      return socket.emit("command:error", "Maximum slowmode is 300 seconds");
    }

    room.slowMode = seconds;

    await room.save();

    io.to(room.name).emit("room:updated", {
      room: {
        _id: room._id,
        name: room.name,
        topic: room.topic,
        isPrivate: room.isPrivate,
        slowMode: room.slowMode,
      },
    });

    io.to(room.name).emit("system:message", {
      roomName: room.name,
      content:
        seconds === 0
          ? `${socket.user.username} disabled slowmode`
          : `${socket.user.username} enabled ${seconds}s slowmode`,
      createdAt: new Date(),
      system: true,
    });
  },
};
