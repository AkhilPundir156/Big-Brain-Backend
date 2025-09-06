import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/express.js";

export const isAuthenticated: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ msg: "User is not logged in" });
        return;
    }

    if (!process.env.JWT_SECRET) {
        res.status(500).json({ msg: "Server misconfiguration" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

        if (!decoded || !decoded.id) {
            res.status(401).json({ msg: "Invalid token" });
            return;
        }

        (req as AuthenticatedRequest).user = { id: decoded.id };
        next();
    } catch (err) {
        res.status(401).json({ msg: "Invalid or expired token" });
    }
};
