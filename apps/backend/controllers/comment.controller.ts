import type { Request, Response } from "express";
import { prisma } from "db/client";

export const createComment = async (
    req: Request,
    res: Response
) => {
    try {
        const { issueId } = req.params;
        const { comment } = req.body;

        if (!comment || typeof comment !== "string" || !comment.trim()) {
            return res.status(400).json({
                message: "Comment is required",
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

        const newComment = await prisma.comments.create({
            data: {
                comment: comment.trim(),
                userId: req.userId,
                issueId,
            },
            include: {
                user: {
                    select: { id: true, email: true },
                },
            },
        });

        return res.status(201).json({
            message: "Comment created successfully",
            comment: newComment,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const updateComment = async (
    req: Request,
    res: Response
) => {
    try {
        const { commentId } = req.params;
        const { comment } = req.body;

        if (!comment || typeof comment !== "string" || !comment.trim()) {
            return res.status(400).json({
                message: "Comment is required",
            });
        }

        const existingComment = await prisma.comments.findUnique({
            where: { id: commentId },
        });

        if (!existingComment) {
            return res.status(404).json({
                message: "Comment not found",
            });
        }

        // Only the comment author can edit it
        if (existingComment.userId !== req.userId) {
            return res.status(403).json({
                message: "You can only edit your own comments",
            });
        }

        const updatedComment = await prisma.comments.update({
            where: { id: commentId },
            data: {
                comment: comment.trim(),
            },
            include: {
                user: {
                    select: { id: true, email: true },
                },
            },
        });

        return res.status(200).json({
            message: "Comment updated successfully",
            comment: updatedComment,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const deleteComment = async (
    req: Request,
    res: Response
) => {
    try {
        const { commentId } = req.params;

        const existingComment = await prisma.comments.findUnique({
            where: { id: commentId },
        });

        if (!existingComment) {
            return res.status(404).json({
                message: "Comment not found",
            });
        }

        // Only the comment author can delete it
        if (existingComment.userId !== req.userId) {
            return res.status(403).json({
                message: "You can only delete your own comments",
            });
        }

        await prisma.comments.delete({
            where: { id: commentId },
        });

        return res.status(200).json({
            message: "Comment deleted successfully",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
