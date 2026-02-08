import jwt from "jsonwebtoken";

export const signAccessToken = (userId) => {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

export const signRefreshToken = (userId) => {
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};
