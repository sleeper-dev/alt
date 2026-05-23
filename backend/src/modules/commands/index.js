import banCommand from "./commands/ban.command.js";
import banlistCommand from "./commands/banlist.command.js";
import deleteCommand from "./commands/delete.command.js";
import helpCommand from "./commands/help.command.js";
import kickCommand from "./commands/kick.command.js";
import leaveCommand from "./commands/leave.command.js";
import lockCommand from "./commands/lock.command.js";
import meCommand from "./commands/me.command.js";
import randomCommand from "./commands/random.command.js";
import sayCommand from "./commands/say.command.js";
import slowmodeCommand from "./commands/slowmode.command.js";
import topicCommand from "./commands/topic.command.js";
import unbanCommand from "./commands/unban.command.js";
import unlockCommand from "./commands/unlock.command.js";
import whoisCommand from "./commands/whois.command.js";

export const commands = [
  helpCommand,
  whoisCommand,
  meCommand,
  randomCommand,
  leaveCommand,
  sayCommand,
  kickCommand,
  banCommand,
  unbanCommand,
  banlistCommand,
  lockCommand,
  unlockCommand,
  deleteCommand,
  topicCommand,
  slowmodeCommand,
];
