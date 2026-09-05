import type { Request, Response } from "express";
import { prisma } from "db/client";

export const createSection = async (req: Request, res: Response) => {
    try {
        const { boardId } = req.params;
        const { title } = req.body;

        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Section title is required",
            });
        }

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
                message: "Only organization admins can create sections",
            });
        }

        const lastSection = await prisma.section.findFirst({
            where: { boardId: board.id },
            orderBy: { order: "desc" },
        });

        const order = lastSection ? lastSection.order + 1000 : 1000;

        const section = await prisma.section.create({
            data: {
                title: title.trim(),
                order,
                boardId: board.id,
            },
        });

        return res.status(201).json({
            message: "Section created successfully",
            section,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getSections = async (req: Request, res: Response) => {
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

        if (!membership) {
            return res.status(403).json({
                message: "You are not a member of this organization",
            });
        }

        const sections = await prisma.section.findMany({
            where: { boardId: board.id },
            orderBy: { order: "asc" },
        });

        return res.status(200).json({ sections });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateSection = async (req: Request, res: Response) => {
    try {
        const { sectionId } = req.params;
        const { title } = req.body;

        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Section title is required",
            });
        }

        const section = await prisma.section.findUnique({
            where: { id: sectionId },
        });

        if (!section) {
            return res.status(404).json({ message: "Section not found" });
        }

        const board = await prisma.board.findUnique({
            where: { id: section.boardId },
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
                message: "Only organization admins can update sections",
            });
        }

        const updatedSection = await prisma.section.update({
            where: { id: sectionId },
            data: { title: title.trim() },
        });

        return res.status(200).json({
            message: "Section updated successfully",
            section: updatedSection,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteSection = async (req: Request, res: Response) => {
    try {
        const { sectionId } = req.params;

        const section = await prisma.section.findUnique({
            where: { id: sectionId },
        });

        if (!section) {
            return res.status(404).json({ message: "Section not found" });
        }

        const board = await prisma.board.findUnique({
            where: { id: section.boardId },
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
                message: "Only organization admins can delete sections",
            });
        }

        await prisma.section.delete({
            where: { id: sectionId },
        });

        return res.status(200).json({
            message: "Section deleted successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
