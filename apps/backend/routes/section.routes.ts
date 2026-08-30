import { Router } from "express";

import {
    createSection,
    getSections,
} from "../controllers/section.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post(
    "/boards/:boardId/sections",
    authMiddleware,
    createSection
);

router.get(
    "/boards/:boardId/sections",
    authMiddleware,
    getSections
);

export default router;