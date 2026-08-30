import { Router } from "express";

import {
    getMyInvitations,
    respondToInvitation,
} from "../controllers/invitation.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Get pending invitations for the logged-in user
router.get(
    "/invitations",
    authMiddleware,
    getMyInvitations
);

// Accept or decline an invitation
router.patch(
    "/invitations/:requestId",
    authMiddleware,
    respondToInvitation
);

export default router;