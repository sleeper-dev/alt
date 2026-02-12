import banCommand from "./commands/ban.command.js";
import banlistCommand from "./commands/banlist.command.js";
import deleteCommand from "./commands/delete.command.js";
import helpCommand from "./commands/help.command.js";
import kickCommand from "./commands/kick.command.js";
import leaveCommand from "./commands/leave.command.js";
import sayCommand from "./commands/say.command.js";
import unbanCommand from "./commands/unban.command.js";
import whoisCommand from "./commands/whois.command.js";

export const commands = [
  helpCommand,
  whoisCommand,
  leaveCommand,
  sayCommand,
  kickCommand,
  banCommand,
  unbanCommand,
  banlistCommand,
  deleteCommand,
];
