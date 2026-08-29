import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "db/client"
import jwt from "jsonwebtoken";



export const signupController = async (req: Request, res: Response) => {
    console.log("signup hit");

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required!",
            })
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            }
        })

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists",
            });
        }

        const hassedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hassedPassword,

            },
            select: {
                id: true,
                email: true,
                password: true,

            },
        });

        return res.status(201).json({
            message: "User Created Successfully",
            user,
        });
    }
    catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }

}

export const signinController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid Credentials",
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid Credentials",
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        )

        return res.status(200).json({
            message: "Signin successful",
            token,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

