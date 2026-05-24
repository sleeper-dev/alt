import { User } from "./user.model.js";

export const searchUsers = async (req, res) => {
  try {
    const q = req.query.q?.trim();

    if (!q) {
      return res.json([]);
    }

    const users = await User.find({
      username: {
        $regex: `^${q}`,
        $options: "i",
      },
    })
      .select("_id username")
      .limit(5);

    res.json(users);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to search users",
    });
  }
};
