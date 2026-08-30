import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    userId: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Unauthorized",
            })
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            console.log("Token not available")
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as JwtPayload;

        if (!decoded.userId) {
            console.log("Invalid Token")
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        req.userId = decoded.userId;
        next();


    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }


}