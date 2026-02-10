import banCommand from "./commands/ban.command.js";
import banlistCommand from "./commands/banlist.command.js";
import helpCommand from "./commands/help.command.js";
import sayCommand from "./commands/say.command.js";
import unbanCommand from "./commands/unban.command.js";
import whoisCommand from "./commands/whois.command.js";

export const commands = [
  helpCommand,
  whoisCommand,
  sayCommand,
  banCommand,
  unbanCommand,
  banlistCommand,
];
