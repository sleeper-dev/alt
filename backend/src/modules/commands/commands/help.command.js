export default {
  name: "help",
  description: "Shows available commands",
  usage: "/help [command]",

  execute: async ({ socket, args, commands, room }) => {
    const canUseCommand = (command) => {
      if (command.roles?.includes("owner")) {
        if (!room.ownerId.equals(socket.user._id)) {
          return false;
        }
      }
      return true;
    };

    if (args.length > 0) {
      const cmdName = args[0].toLowerCase();
      const command = commands.find((item) => item.name === cmdName);

      if (!command || !canUseCommand(command)) {
        return socket.emit("system:message", {
          roomName: room.name,
          content: `Command "${cmdName}" not found.`,
          createdAt: new Date(),
          system: true,
        });
      }

      return socket.emit("system:message", {
        roomName: room.name,
        content:
          `/${command.name}\n` +
          `${command.description}\n` +
          `Usage: ${command.usage}`,
        createdAt: new Date(),
        system: true,
      });
    }

    const list = commands
      .filter(canUseCommand)
      .map((cmd) => `/${cmd.name} — ${cmd.description}`)
      .join("\n");

    socket.emit("system:message", {
      roomName: room.name,
      content: `Available commands:\n${list}`,
      createdAt: new Date(),
      system: true,
    });
  },
};
