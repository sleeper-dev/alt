import { Router } from "express";
import { createRoom, deleteRoom, getRooms } from "./room.controller.js";
import { protect } from "../auth/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", getRooms);
router.post("/", createRoom);
router.delete("/:roomName", deleteRoom);

export default router;
