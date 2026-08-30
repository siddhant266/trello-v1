import { Router } from "express";

import {
    removeMember,
    leaveOrganization,
    getMembers,
} from "../controllers/membership.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get(
    "/organizations/:organizationId/members",
    authMiddleware,
    getMembers
);

router.delete(
    "/organizations/:organizationId/members/:membershipId",
    authMiddleware,
    removeMember
);

router.delete(
    "/organizations/:organizationId/leave",
    authMiddleware,
    leaveOrganization
);

export default router;
