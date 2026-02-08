import { Router } from "express";
import { login, logout, me, refresh, register } from "./auth.controller.js";
import { protect } from "./auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.post("/logout", protect, logout);
router.post("/refresh", refresh);

export default router;
