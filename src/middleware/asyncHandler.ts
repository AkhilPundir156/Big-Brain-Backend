import { Response, NextFunction, RequestHandler } from "express";

export const asyncHandler = (
    fn: (req: any , res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (err) {
            console.error("Error in asyncHandler:", err);
            next(err);
        }
    };
};
