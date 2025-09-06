import { Response } from "express";
import jwt from "jsonwebtoken";

export const setAuthCookie = (res: Response, userId: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d", // 1 day
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || true,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};
