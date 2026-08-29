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