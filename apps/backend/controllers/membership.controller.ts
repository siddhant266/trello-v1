import type { Request, Response } from "express";
import { prisma } from "db/client";

// Remove a member from an organization (admin only, cannot remove self if last admin)
export const removeMember = async (
    req: Request,
    res: Response
) => {
    try {
        const { organizationId, membershipId } = req.params;

        // Check requester is admin
        const requesterMembership = await prisma.membership.findFirst({
            where: {
                organizationId,
                userId: req.userId,
                role: "ADMIN",
            },
        });

        if (!requesterMembership) {
            return res.status(403).json({
                message: "Only organization admins can remove members",
            });
        }

        const targetMembership = await prisma.membership.findFirst({
            where: {
                id: membershipId,
                organizationId,
            },
        });

        if (!targetMembership) {
            return res.status(404).json({
                message: "Membership not found",
            });
        }

        // Prevent removing the last admin
        if (targetMembership.role === "ADMIN") {
            const adminCount = await prisma.membership.count({
                where: {
                    organizationId,
                    role: "ADMIN",
                },
            });

            if (adminCount <= 1) {
                return res.status(400).json({
                    message: "Cannot remove the last admin from the organization",
                });
            }
        }

        await prisma.membership.delete({
            where: { id: membershipId },
        });

        return res.status(200).json({
            message: "Member removed successfully",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// Leave an organization (user removes themselves)
export const leaveOrganization = async (
    req: Request,
    res: Response
) => {
    try {
        const { organizationId } = req.params;

        const membership = await prisma.membership.findFirst({
            where: {
                organizationId,
                userId: req.userId,
            },
        });

        if (!membership) {
            return res.status(404).json({
                message: "You are not a member of this organization",
            });
        }

        // Prevent last admin from leaving
        if (membership.role === "ADMIN") {
            const adminCount = await prisma.membership.count({
                where: {
                    organizationId,
                    role: "ADMIN",
                },
            });

            if (adminCount <= 1) {
                return res.status(400).json({
                    message: "Cannot leave: you are the last admin. Transfer admin role or delete the organization.",
                });
            }
        }

        await prisma.membership.delete({
            where: { id: membership.id },
        });

        return res.status(200).json({
            message: "Left organization successfully",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// Get all members of an organization
export const getMembers = async (
    req: Request,
    res: Response
) => {
    try {
        const { organizationId } = req.params;

        const requesterMembership = await prisma.membership.findFirst({
            where: {
                organizationId,
                userId: req.userId,
            },
        });

        if (!requesterMembership) {
            return res.status(403).json({
                message: "You are not a member of this organization",
            });
        }

        const members = await prisma.membership.findMany({
            where: { organizationId },
            include: {
                user: {
                    select: { id: true, email: true },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        return res.status(200).json({ members });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
