import { Router } from "express";
import { searchUsers } from "./user.controller.js";
import { protect } from "../auth/auth.middleware.js";

const router = Router();

router.get("/search", protect, searchUsers);

export default router;
