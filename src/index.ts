import "./config/env.js";

import { v2 } from "cloudinary";
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";

import { Strategy as googleStrategy } from "./oauth/googleStratgy.js";
import UserRouter from "./routes/userRoutes.js";
import BrainRouter from "./routes/brainRouter.js";
import connectDB from "./connectDB/connectDB.js";

const app = express();

v2.config();

passport.use(googleStrategy);

// -------- Middlewares --------
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(
    session({
        secret: process.env.JWT_SECRET as string,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
    })
);

// -------- Routes --------
app.use("/api/v1/user", UserRouter);
app.use("/api/v1/brain", BrainRouter);

// ------- Unhandled Routes -------
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        msg: "Content not found",
    });
});

// -------- Global Error Handler --------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({
        success: false,
        msg: "Internal server error",
    });
});

// -------- Server --------
app.listen(process.env.PORT, async () => {
    if (!process.env.MONGO_URL) {
        console.error("❌ Please set MONGO_URL");
        return;
    }
    await connectDB(process.env.MONGO_URL);
    console.log("Service Started")
});

/**
 * Maintaining Sequeunce as Priority.
    - Implement OAuth using google and github --> using google done || Github will be introduced later
    - Add Image Upload on brain and get the related description from LLM -- Completed.
    - Add Profile Picture for the User -- Completed Testing only
    - Add Instagram, Twitter Type embedding and Getting Description from LLM to save for embeddings -- to be added after the Completion, additional feature
**/
