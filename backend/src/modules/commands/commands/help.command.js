export default {
  name: "help",
  description: "Shows available commands",
  usage: "/help [command]",

  execute: async ({ socket, args, roomName, commands }) => {
    if (args.length > 0) {
      const cmdName = args[0].toLowerCase();
      const command = commands.find((item) => item.name === cmdName);

      console.log(command);

      if (!command) {
        return socket.emit("system:message", {
          roomName,
          content: `Command "${cmdName}" not found.`,
          createdAt: new Date(),
          system: true,
          private: true,
        });
      }

      return socket.emit("system:message", {
        roomName,
        content:
          `/${command.name}\n` +
          `${command.description}\n` +
          `Usage: ${command.usage}`,
        createdAt: new Date(),
        system: true,
        private: true,
      });
    }

    const list = Array.from(commands.values())
      .map((cmd) => `/${cmd.name} — ${cmd.description}`)
      .join("\n");

    socket.emit("system:message", {
      roomName,
      content: `Available commands:\n${list}`,
      createdAt: new Date(),
      system: true,
      private: true,
    });
  },
};
