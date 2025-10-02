import bcrypt from "bcrypt";
import { Request, Response } from "express";
import z from "zod";

import userModel, { contactModel } from "../models/userSchema.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { setAuthCookie } from "../middleware/setAuthCookie.js";

import { AuthenticatedRequest } from "../types/express.js";

import { uploadCloudinary } from "../utils/cloudinaryHandler.js";

// ---------------- Validation ----------------
const signUpSchema = z.object({
    name: z.string().min(4).max(100),
    email: z.string().email(),
    password: z.string().min(4).max(8),
});
const loginSchema = signUpSchema.omit({ name: true });

type SignUpUser = z.infer<typeof signUpSchema>;
type LoginUser = z.infer<typeof loginSchema>;

// ---------------- Handlers ----------------

// Signup
export const SignupHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const userData: SignUpUser = req.body;
        const parsed = signUpSchema.safeParse(userData);

        if (!parsed.success) {
            return res.status(400).json({
                error: true,
                msg: "Invalid signup data",
                errors: parsed.error.message,
            });
        }

        const existingUser = await userModel.findOne({ email: userData.email });
        if (existingUser) {
            return res
                .status(400)
                .json({ error: false, msg: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        let url: string = "";
        if (req.file?.path) {
            const cloundinaryResponse = await uploadCloudinary(req.file.path);
            url = cloundinaryResponse.data?.url as string;
        }

        await userModel.create({
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            avatar_url: url,
        });

        return res
            .status(201)
            .json({ msg: "User signed up successfully, please login" });
    }
);

// Login
export const LoginHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const userData: LoginUser = req.body;

        const parsed = loginSchema.safeParse(userData);

        if (!parsed.success) {
            return res.status(400).json({ msg: "Invalid email or password" });
        }

        const foundUser = await userModel.findOne({ email: userData.email });
        if (!foundUser) {
            return res
                .status(404)
                .json({ msg: "User not found, please signup first" });
        }

        const passwordMatch = await bcrypt.compare(
            userData.password,
            foundUser.password
        );
        if (!passwordMatch) {
            return res.status(400).json({ msg: "Wrong password" });
        }

        setAuthCookie(res, foundUser._id.toString());

        return res.status(200).json({
            msg: "Login successful",
            user: {
                id: foundUser._id,
                email: foundUser.email,
                name: foundUser.name,
                imgUrl: foundUser.avatar_url,
            },
        });
    }
);

export const myProfileHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req?.user?.id) {
            res.status(400).json({
                msg: "User Not Logged In",
            });
            return;
        }
        const foundUser = await userModel
            .findById(req.user.id)
            .select("-password -googleId");

        res.status(200).json({
            // msg: "Users Pofile",
            user: foundUser,
        });
    }
);

// Logout
export const LogoutHandler = asyncHandler(
    async (req: Request, res: Response) => {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });

        return res.status(200).json({ msg: "User logged out" });
    }
);

export const googleLoginHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const user = req.user;

        if (!user) {
            res.status(500).json({
                msg: "Login Failed",
            });
            return;
        }

        setAuthCookie(res, user?._id);

        return res.redirect(`${process.env.CLIENT_URL as string}/login`);
    }
);

//contact us handler
export const contactUsHandler = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const { name, email, message } = req.body;
            if (!name || !email || !message) {
                return res.status(400).json({ success:false, msg: "All fields are required" });
            }
            // Logic to store the contact message in the database or send an email notification
            await contactModel.create({
                name,
                email,
                message,
                createdAt: new Date(),
            });

            return res
                .status(200)
                .json({ success: true, msg: "Message received successfully" });
        } catch (error) {
            res.status(500).json({ success: false, msg: "Failed to send message", error });
        }
    }
);

//update theme
export const changeThemeHandler = asyncHandler(
    async (req: Request, res: Response) => {
        try{
            const userId = req.body.user._id;
            const { theme } = req.body;

            if(theme !== "light" && theme == "dark"){
                return res.status(400).json({message: "Invalid theme value"});
            }

            const updateUser = await userModel.findByIdAndUpdate(
                { userId },
                { theme },
                { new: true}
            );
            
            if (!updateUser){
                return res.status(404).json({message: "user not found"});
            }

            res.status(200).json({theme: updateUser.theme});
        }catch(err){
            console.error("Update theme error:", err);
            res.status(500).json({message: "Internal server error"});
        }
    }

)

