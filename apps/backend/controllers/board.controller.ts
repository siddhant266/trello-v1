import type { Request, Response } from "express";
import { prisma } from "db/client";

export const createBoard = async (req: Request, res: Response) => {
    try {
        const { organizationId } = req.params;
        const { name, description } = req.body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Board name is required",
            });
        }

        const membership = await prisma.membership.findFirst({
            where: {
                organizationId: organizationId as string,
                userId: req.userId,
            },
        });

        if (!membership || membership.role !== "ADMIN") {
            return res.status(403).json({
                message: "Only organization admins can create boards",
            });
        }

        const board = await prisma.board.create({
            data: {
                name: name.trim(),
                description: description?.trim(),
                organizationId: organizationId as string,
            },
        });

        return res.status(201).json({
            message: "Board created successfully",
            board,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const getBoards = async (req: Request, res: Response) => {
    try {
        const { organizationId } = req.params;

        const membership = await prisma.membership.findFirst({
            where: {
                organizationId: organizationId as string,
                userId: req.userId,
            },
        });

        if (!membership) {
            return res.status(403).json({
                message: "You are not a member of this organization",
            });
        }

        const boards = await prisma.board.findMany({
            where: {
                organizationId: organizationId as string,
            },
            include: {
                sections: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return res.status(200).json({
            boards,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const getBoard = async (req: Request, res: Response) => {
    try {
        const { boardId } = req.params;

        const board = await prisma.board.findUnique({
            where: { id: boardId },
            include: {
                organization: {
                    select: { id: true, name: true },
                },
                sections: {
                    orderBy: { order: "asc" },
                },
            },
        });

        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }

        const membership = await prisma.membership.findFirst({
            where: {
                organizationId: board.organizationId,
                userId: req.userId,
            },
        });

        if (!membership) {
            return res.status(403).json({
                message: "You are not a member of this organization",
            });
        }

        return res.status(200).json({
            board,
            role: membership.role,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateBoard = async (req: Request, res: Response) => {
    try {
        const { boardId } = req.params;
        const { name, description } = req.body;

        const board = await prisma.board.findUnique({
            where: { id: boardId as string },
        });

        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }

        const membership = await prisma.membership.findFirst({
            where: {
                organizationId: board.organizationId,
                userId: req.userId,
            },
        });

        if (!membership || membership.role !== "ADMIN") {
            return res.status(403).json({
                message: "Only organization admins can update boards",
            });
        }

        const data: { name?: string; description?: string } = {};
        if (name !== undefined) data.name = name.trim();
        if (description !== undefined) data.description = description.trim();

        const updatedBoard = await prisma.board.update({
            where: { id: boardId as string },
            data,
        });

        return res.status(200).json({
            message: "Board updated successfully",
            board: updatedBoard,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteBoard = async (req: Request, res: Response) => {
    try {
        const { boardId } = req.params;

        const board = await prisma.board.findUnique({
            where: { id: boardId as string },
        });

        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }

        const membership = await prisma.membership.findFirst({
            where: {
                organizationId: board.organizationId,
                userId: req.userId,
            },
        });

        if (!membership || membership.role !== "ADMIN") {
            return res.status(403).json({
                message: "Only organization admins can delete boards",
            });
        }

        await prisma.board.delete({
            where: { id: board.id },
        });

        return res.status(200).json({
            message: "Board deleted successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
