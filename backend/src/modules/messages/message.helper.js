import { User } from "../users/user.model.js";

export const parseMentions = async (content) => {
  const matches = [...content.matchAll(/(?:^|\s)@([a-zA-Z0-9_]+)/g)];

  if (matches.length === 0) {
    return [];
  }

  const usernames = [...new Set(matches.map((m) => m[1].toLowerCase()))];

  const users = await User.find({
    usernameLower: {
      $in: usernames.map((u) => u.toLowerCase()),
    },
  }).select("_id username");

  return users;
};
