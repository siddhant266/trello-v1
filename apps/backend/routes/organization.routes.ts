import { Router } from "express";
import {
    createOrganization,
    deleteOrganization,
    getOrganizations
} from "../controllers/organization.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import {
    createInvitation,
    getMyInvitations,
} from "../controllers/invitation.controller";

const router = Router();

router.post("/", authMiddleware, createOrganization);
router.get("/", authMiddleware, getOrganizations);
router.delete("/:organizationId", authMiddleware, deleteOrganization);

// Invitations
router.post(
    "/:organizationId/invitations",
    authMiddleware,
    createInvitation
);

router.get(
    "/invitations",
    authMiddleware,
    getMyInvitations
);

export default router;