import bcrypt from "bcrypt";

export default {
  name: "lock",
  description: "Lock room or change its password",
  usage: "/lock <password>",
  roles: ["owner"],

  async execute({ socket, io, room, args }) {
    const newPassword = args[0];

    if (!newPassword || newPassword.length < 3) {
      return socket.emit(
        "command:error",
        "Password must be at least 3 characters",
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    const wasPrivate = room.isPrivate;

    room.isPrivate = true;
    room.password = hashed;
    await room.save();

    if (wasPrivate) {
      io.to(room.name).emit("system:message", {
        roomName: room.name,
        content: `Room password was changed by ${socket.user.username}`,
        createdAt: new Date(),
        system: true,
      });
    } else {
      io.to(room.name).emit("system:message", {
        roomName: room.name,
        content: `Room was locked by ${socket.user.username}`,
        createdAt: new Date(),
        system: true,
      });
    }

    io.emit("room:updated", {
      room: {
        _id: room._id,
        name: room.name,
        isPrivate: room.isPrivate,
      },
    });
  },
};
