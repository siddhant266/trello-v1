import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "db/client"
import jwt from "jsonwebtoken";

export const signupController = async (req: Request, res: Response) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({
                message: "Email, username and password are required!",
            });
        }

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });

        if (existingUser) {
            return res.status(409).json({
                message: existingUser.email === email
                    ? "Email already in use"
                    : "Username already taken",
            });
        }

        const hassedPassword = await bcrypt.hash(password, 10);
        const normalizedEmail = email.trim().toLowerCase();

        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                username: username.trim(),
                password: hassedPassword,
            },
            select: { id: true, email: true, username: true },
        });

        await prisma.organizationJoinRequest.updateMany({
            where: { email: user.email, userId: null, status: "PENDING" },
            data: { userId: user.id },
        });

        return res.status(201).json({
            message: "User Created Successfully",
            user,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const signinController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Signin successful",
            token,
            username: user.username,
            email: user.email,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getMeController = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, username: true },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
