import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import roomRoutes from "../modules/rooms/room.routes.js";
import messageRoutes from "../modules/messages/message.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

router.use("/auth", authRoutes);
router.use("/rooms", roomRoutes);
router.use("/messages", messageRoutes);

export default router;
