import { Router } from "express";
import {
    getMeController,
    signinController,
    signupController,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", signupController);
router.post("/signin", signinController);
router.get("/me", authMiddleware, getMeController);

export default router;
