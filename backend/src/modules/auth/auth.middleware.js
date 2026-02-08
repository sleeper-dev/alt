import jwt from "jsonwebtoken";
import { User } from "../users/user.model.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ message: "User not authorized" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};
