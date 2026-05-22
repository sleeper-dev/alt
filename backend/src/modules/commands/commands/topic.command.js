export default {
  name: "topic",
  description: "Change room topic",
  usage: "/topic <new topic>",
  roles: ["owner"],

  async execute({ socket, args, io, room }) {
    const newTopic = args.join(" ").trim();

    if (!newTopic) {
      return socket.emit("command:error", "No topic provided");
    }

    if (newTopic.length > 200) {
      return socket.emit(
        "command:error",
        "Topic cannot be longer than 200 characters",
      );
    }

    const oldTopic = room.topic;

    room.topic = newTopic;
    await room.save();

    io.emit("room:updated", {
      room: {
        _id: room._id,
        name: room.name,
        topic: room.topic,
      },
    });

    io.to(room.name).emit("system:message", {
      roomName: room.name,
      content: `${socket.user.username} changed the topic${
        oldTopic ? ` from "${oldTopic}"` : ""
      } to "${newTopic}"`,
      createdAt: new Date(),
      system: true,
    });
  },
};
