import { Router } from "express"
import { createInvitation, getMyInvitations, respondToInvitation } from "../controllers/invitation.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/invitations", authMiddleware, createInvitation);
router.get("/invitations", authMiddleware, getMyInvitations);
router.patch("/invitations/:invitationId", authMiddleware, respondToInvitation);

export default router;