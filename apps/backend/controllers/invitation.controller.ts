import type { Request, Response } from "express";
import { prisma } from "db/client";

type AuthRequest = Request & {
    userId: string;
};

export const createInvitation = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const organizationId = req.params.organizationId as string;
        const { email } = req.body;

        // 1. Validate input
        if (!organizationId) {
            return res.status(400).json({
                message: "Organization ID is required",
            });
        }

        if (!email || typeof email !== "string") {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // 2. Check whether requester is an ADMIN
        const membership = await prisma.membership.findFirst({
            where: {
                organizationId,
                userId: req.userId,
                role: "ADMIN",
            },
        });

        if (!membership) {
            return res.status(403).json({
                message: "Only organization admins can send invitations",
            });
        }

        // 3. Find user by email
        const user = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        // 4. Check existing invitation
        const existingInvitation =
            await prisma.organizationJoinRequest.findUnique({
                where: {
                    email_organizationId: {
                        email: normalizedEmail,
                        organizationId,
                    },
                },
            });

        if (existingInvitation) {
            if (existingInvitation.status === "PENDING") {
                return res.status(409).json({
                    message: "Invitation already exists",
                });
            }

            return res.status(409).json({
                message: "An invitation already exists for this user",
            });
        }

        // 5. Create invitation
        const invitation = await prisma.organizationJoinRequest.create({
            data: {
                email: normalizedEmail,
                userId: user?.id ?? null,
                organizationId,
                invitedById: req.userId,
                role: "MEMBER",
                status: "PENDING",
                expiresAt: new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000
                ),
            },
        });

        return res.status(201).json({
            message: "Invitation sent successfully",
            invitation,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const getMyInvitations = async (
    req: Request,
    res: Response
) => {
    try {
        const invitations = await prisma.organizationJoinRequest.findMany({
            where: {
                userId: req.userId,
                status: "PENDING",
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                invitedBy: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            invitations,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const respondToInvitation = async (
    req: Request,
    res: Response
) => {
    try {
        const requestId = req.params.requestId as string;
        const { action } = req.body;

        if (!requestId) {
            return res.status(400).json({
                message: "Request ID is required",
            });
        }

        if (action !== "ACCEPT" && action !== "DECLINE") {
            return res.status(400).json({
                message: "Action must be ACCEPT or DECLINE",
            });
        }

        const invitation =
            await prisma.organizationJoinRequest.findFirst({
                where: {
                    id: requestId,
                    userId: req.userId,
                    status: "PENDING",
                    expiresAt: {
                        gt: new Date(),
                    },
                },
            });

        if (!invitation) {
            return res.status(404).json({
                message: "Invitation not found or expired",
            });
        }

        if (action === "DECLINE") {
            await prisma.organizationJoinRequest.update({
                where: {
                    id: requestId,
                },
                data: {
                    status: "DECLINED",
                },
            });

            return res.status(200).json({
                message: "Invitation declined",
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            const membership = await tx.membership.create({
                data: {
                    userId: req.userId,
                    organizationId: invitation.organizationId,
                    role: invitation.role,
                },
            });

            const updatedInvitation =
                await tx.organizationJoinRequest.update({
                    where: {
                        id: requestId,
                    },
                    data: {
                        status: "ACCEPTED",
                    },
                });

            return {
                membership,
                invitation: updatedInvitation,
            };
        });

        return res.status(200).json({
            message: "Invitation accepted",
            ...result,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const getOrganizationInvitations = async (
    req: Request,
    res: Response
) => {
    try {
        const { organizationId } = req.params;

        // Must be a member to view invitations
        const membership = await prisma.membership.findFirst({
            where: {
                organizationId,
                userId: req.userId,
            },
        });

        if (!membership) {
            return res.status(403).json({
                message: "You are not a member of this organization",
            });
        }

        const invitations = await prisma.organizationJoinRequest.findMany({
            where: { organizationId },
            include: {
                invitedBy: {
                    select: { id: true, email: true },
                },
                user: {
                    select: { id: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return res.status(200).json({ invitations });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};