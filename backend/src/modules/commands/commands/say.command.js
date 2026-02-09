export default {
  name: "say",
  description: "Send a system message to the room",
  usage: "/say Your message here",
  roles: ["owner"],

  async execute({ socket, args, io, room }) {
    const message = args.join(" ").trim();

    if (!message) {
      return socket.emit("command:error", "You must provide a message");
    }

    io.to(room.name).emit("system:message", {
      roomName: room.name,
      content: message,
      createdAt: new Date(),
      system: true,
    });
  },
};
