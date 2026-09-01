import { Router } from "express";
import {
    createOrganization,
    deleteOrganization,
    getOrganization,
    getOrganizations,
} from "../controllers/organization.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import {
    createInvitation,
    getMyInvitations,
    getOrganizationInvitations,
} from "../controllers/invitation.controller";

const router = Router();

router.post("/", authMiddleware, createOrganization);
router.get("/", authMiddleware, getOrganizations);
router.get("/:organizationId", authMiddleware, getOrganization);
router.delete("/:organizationId", authMiddleware, deleteOrganization);

// Invitations — scoped to an org
router.post(
    "/:organizationId/invitations",
    authMiddleware,
    createInvitation
);

router.get(
    "/:organizationId/invitations",
    authMiddleware,
    getOrganizationInvitations
);

// My personal invitations (no org scope)
router.get(
    "/invitations/me",
    authMiddleware,
    getMyInvitations
);

export default router;