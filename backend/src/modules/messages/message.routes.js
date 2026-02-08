import { Router } from "express";
import { protect } from "../auth/auth.middleware.js";
import { getMessages } from "./message.controller.js";

const router = Router();

router.use(protect);

router.get("/:roomName", getMessages);

export default router;
