import { Router } from "express";

import {
    createComment,
    updateComment,
    deleteComment,
} from "../controllers/comment.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post(
    "/issues/:issueId/comments",
    authMiddleware,
    createComment
);

router.put(
    "/comments/:commentId",
    authMiddleware,
    updateComment
);

router.delete(
    "/comments/:commentId",
    authMiddleware,
    deleteComment
);

export default router;
