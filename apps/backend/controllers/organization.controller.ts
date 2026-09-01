import type { Request, Response } from "express";
import { prisma } from "db/client";



// CREATE ORGANIZATION
export const createOrganization = async (
    req: Request,
    res: Response
) => {
    try {
        const { name, description } = req.body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ message: "Organization name is required" });
        }

        const organization = await prisma.organization.create({
            data: {
                name: name.trim(),
                description: description?.trim(),
                memberships: {
                    create: {
                        userId: req.userId,
                        role: "ADMIN",
                    },
                },
            },
        });

        return res.status(201).json({
            message: "Organization created successfully",
            organization,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// GET SINGLE ORGANIZATION
export const getOrganization = async (
    req: Request,
    res: Response
) => {
    try {
        const organizationId = req.params.organizationId as string;

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

        const organization = await prisma.organization.findUnique({
            where: { id: organizationId },
            include: {
                memberships: {
                    include: {
                        user: {
                            select: { id: true, email: true },
                        },
                    },
                },
                boards: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!organization) {
            return res.status(404).json({
                message: "Organization not found",
            });
        }

        return res.status(200).json({ organization });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// GET USER'S ORGANIZATIONS
export const getOrganizations = async (
    req: Request,
    res: Response
) => {
    try {
        const organizations = await prisma.organization.findMany({
            where: {
                memberships: {
                    some: {
                        userId: req.userId,
                    },
                },
            },
            include: {
                memberships: {
                    where: {
                        userId: req.userId,
                    }
                }
            },
        });

        return res.status(200).json({
            organizations,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// DELETE ORGANIZATION
export const deleteOrganization = async (
    req: Request,
    res: Response
) => {
    try {
        const organizationId = req.params.organizationId as string;

        if (!organizationId) {
            return res.status(400).json({ message: "Organization ID is required" });
        }

        const membership = await prisma.membership.findFirst({
            where: {
                organizationId,
                userId: req.userId,
                role: "ADMIN",
            },
        });

        if (!membership) {
            return res.status(403).json({
                message: "Only organization admins can delete it",
            });
        }

        await prisma.organization.delete({
            where: {
                id: organizationId,
            },
        });

        return res.status(200).json({
            message: "Organization deleted successfully",
        });
    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Organization not found" });
        }
        throw error;
    }
};