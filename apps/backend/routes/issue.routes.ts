import { Router } from "express";

import {
    createIssue,
    getIssues,
    getIssue,
    updateIssue,
    deleteIssue,
    moveIssue,
    assignIssue,
    unassignIssue,
} from "../controllers/issue.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post(
    "/boards/:boardId/sections/:sectionId/issues",
    authMiddleware,
    createIssue
);

router.get(
    "/boards/:boardId/issues",
    authMiddleware,
    getIssues
);

router.get(
    "/issues/:issueId",
    authMiddleware,
    getIssue
);

router.put(
    "/issues/:issueId",
    authMiddleware,
    updateIssue
);

router.delete(
    "/issues/:issueId",
    authMiddleware,
    deleteIssue
);

router.patch(
    "/issues/:issueId/move",
    authMiddleware,
    moveIssue
);

router.post(
    "/issues/:issueId/assignees",
    authMiddleware,
    assignIssue
);

router.delete(
    "/issues/:issueId/assignees/:userId",
    authMiddleware,
    unassignIssue
);

export default router;
