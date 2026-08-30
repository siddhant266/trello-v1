import type { Request, Response } from "express";
import { prisma } from "db/client";

export const createIssue = async (
    req: Request,
    res: Response
) => {
    try {
        const { boardId, sectionId } = req.params;
        const { title, description } = req.body;

        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Issue title is required",
            });
        }

        const section = await prisma.section.findFirst({
            where: {
                id: sectionId,
                boardId,
            },
        });

        if (!section) {
            return res.status(404).json({
                message: "Section not found",
            });
        }

        const board = await prisma.board.findUnique({
            where: { id: boardId },
        });

        if (!board) {
            return res.status(404).json({
                message: "Board not found",
            });
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

        const lastIssue = await prisma.issue.findFirst({
            where: { sectionId },
            orderBy: { order: "desc" },
        });

        const order = lastIssue ? lastIssue.order + 1000 : 1000;

        const issue = await prisma.issue.create({
            data: {
                title: title.trim(),
                description: description?.trim(),
                order,
                boardId,
                sectionId,
            },
        });

        return res.status(201).json({
            message: "Issue created successfully",
            issue,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const getIssues = async (
    req: Request,
    res: Response
) => {
    try {
        const { boardId } = req.params;

        const board = await prisma.board.findUnique({
            where: { id: boardId },
        });

        if (!board) {
            return res.status(404).json({
                message: "Board not found",
            });
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

        const issues = await prisma.issue.findMany({
            where: { boardId },
            include: {
                assignees: {
                    include: {
                        user: {
                            select: { id: true, email: true },
                        },
                    },
                },
                comments: {
                    include: {
                        user: {
                            select: { id: true, email: true },
                        },
                    },
                    orderBy: { createdAt: "asc" },
                },
            },
            orderBy: [
                { sectionId: "asc" },
                { order: "asc" },
            ],
        });

        return res.status(200).json({ issues });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const getIssue = async (
    req: Request,
    res: Response
) => {
    try {
        const { issueId } = req.params;

        const issue = await prisma.issue.findUnique({
            where: { id: issueId },
            include: {
                assignees: {
                    include: {
                        user: {
                            select: { id: true, email: true },
                        },
                    },
                },
                comments: {
                    include: {
                        user: {
                            select: { id: true, email: true },
                        },
                    },
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!issue) {
            return res.status(404).json({
                message: "Issue not found",
            });
        }

        const board = await prisma.board.findUnique({
            where: { id: issue.boardId },
        });

        if (!board) {
            return res.status(404).json({
                message: "Board not found",
            });
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

        return res.status(200).json({ issue });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const updateIssue = async (
    req: Request,
    res: Response
) => {
    try {
        const { issueId } = req.params;
        const { title, description } = req.body;

        const issue = await prisma.issue.findUnique({
            where: { id: issueId },
        });

        if (!issue) {
            return res.status(404).json({
                message: "Issue not found",
            });
        }

        const board = await prisma.board.findUnique({
            where: { id: issue.boardId },
        });

        if (!board) {
            return res.status(404).json({
                message: "Board not found",
            });
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

        const data: { title?: string; description?: string } = {};

        if (title !== undefined) {
            data.title = title.trim();
        }

        if (description !== undefined) {
            data.description = description.trim();
        }

        const updatedIssue = await prisma.issue.update({
            where: { id: issueId },
            data,
        });

        return res.status(200).json({
            message: "Issue updated successfully",
            issue: updatedIssue,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const deleteIssue = async (
    req: Request,
    res: Response
) => {
    try {
        const { issueId } = req.params;

        const issue = await prisma.issue.findUnique({
            where: { id: issueId },
        });

        if (!issue) {
            return res.status(404).json({
                message: "Issue not found",
            });
        }

        const board = await prisma.board.findUnique({
            where: { id: issue.boardId },
        });

        if (!board) {
            return res.status(404).json({
                message: "Board not found",
            });
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

        await prisma.issue.delete({
            where: { id: issueId },
        });

        return res.status(200).json({
            message: "Issue deleted successfully",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const moveIssue = async (
    req: Request,
    res: Response
) => {
    try {
        const { issueId } = req.params;
        const { sectionId, order } = req.body;

        if (!sectionId || typeof sectionId !== "string") {
            return res.status(400).json({
                message: "sectionId is required",
            });
        }

        if (order === undefined || typeof order !== "number") {
            return res.status(400).json({
                message: "order must be a number",
            });
        }

        const issue = await prisma.issue.findUnique({
            where: { id: issueId },
        });

        if (!issue) {
            return res.status(404).json({
                message: "Issue not found",
            });
        }

        const board = await prisma.board.findUnique({
            where: { id: issue.boardId },
        });

        if (!board) {
            return res.status(404).json({
                message: "Board not found",
            });
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

        const targetSection = await prisma.section.findFirst({
            where: {
                id: sectionId,
                boardId: issue.boardId,
            },
        });

        if (!targetSection) {
            return res.status(404).json({
                message: "Target section not found",
            });
        }

        const updatedIssue = await prisma.issue.update({
            where: { id: issueId },
            data: {
                sectionId,
                order,
            },
        });

        return res.status(200).json({
            message: "Issue moved successfully",
            issue: updatedIssue,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const assignIssue = async (
    req: Request,
    res: Response
) => {
    try {
        const { issueId } = req.params;
        const { userId } = req.body;

        if (!userId || typeof userId !== "string") {
            return res.status(400).json({
                message: "userId is required",
            });
        }

        const issue = await prisma.issue.findUnique({
            where: { id: issueId },
        });

        if (!issue) {
            return res.status(404).json({
                message: "Issue not found",
            });
        }

        const board = await prisma.board.findUnique({
            where: { id: issue.boardId },
        });

        if (!board) {
            return res.status(404).json({
                message: "Board not found",
            });
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

        // Make sure the user being assigned is also a member
        const targetMembership = await prisma.membership.findFirst({
            where: {
                organizationId: board.organizationId,
                userId,
            },
        });

        if (!targetMembership) {
            return res.status(400).json({
                message: "User is not a member of this organization",
            });
        }

        const assignment = await prisma.issuesMapping.create({
            data: {
                userId,
                issueId,
            },
        });

        return res.status(201).json({
            message: "Issue assigned successfully",
            assignment,
        });
    } catch (error: any) {
        if (error.code === "P2002") {
            return res.status(409).json({
                message: "User is already assigned to this issue",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const unassignIssue = async (
    req: Request,
    res: Response
) => {
    try {
        const { issueId, userId } = req.params;

        const issue = await prisma.issue.findUnique({
            where: { id: issueId },
        });

        if (!issue) {
            return res.status(404).json({
                message: "Issue not found",
            });
        }

        const board = await prisma.board.findUnique({
            where: { id: issue.boardId },
        });

        if (!board) {
            return res.status(404).json({
                message: "Board not found",
            });
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

        const assignment = await prisma.issuesMapping.findFirst({
            where: { userId, issueId },
        });

        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found",
            });
        }

        await prisma.issuesMapping.delete({
            where: { id: assignment.id },
        });

        return res.status(200).json({
            message: "Issue unassigned successfully",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
