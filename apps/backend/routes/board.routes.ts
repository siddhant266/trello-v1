import { Router } from "express";

import {
    createBoard,
    getBoards,
    updateBoard,
    deleteBoard,
} from "../controllers/board.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post(
    "/organizations/:organizationId/boards",
    authMiddleware,
    createBoard
);

router.get(
    "/organizations/:organizationId/boards",
    authMiddleware,
    getBoards
);

router.put(
    "/organizations/:organizationId/boards/:boardId",
    authMiddleware,
    updateBoard
);

router.delete(
    "/organizations/:organizationId/boards/:boardId",
    authMiddleware,
    deleteBoard
);

export default router;