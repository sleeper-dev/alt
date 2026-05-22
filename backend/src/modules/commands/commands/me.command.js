export default {
  name: "me",
  description: "Send an action message",
  usage: "/me <action>",

  async execute({ socket, args, io, room }) {
    const action = args.join(" ").trim();

    if (!action) {
      return socket.emit("command:error", "No action provided");
    }

    io.to(room.name).emit("system:message", {
      roomName: room.name,
      content: `${socket.user.username} ${action}`,
      createdAt: new Date(),
      system: true,
      action: true,
    });
  },
};
