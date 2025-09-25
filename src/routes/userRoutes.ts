import { Router } from "express";
import passport from "passport";

import { LoginHandler, LogoutHandler, SignupHandler, googleLoginHandler, myProfileHandler } from "../controllers/userController.js";
import { upload } from "../middleware/uploadFile.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";


const UserRouter = Router();

// User signup
UserRouter.post("/signup", upload.single("avatar_image"), SignupHandler);

UserRouter.get("/me", isAuthenticated, myProfileHandler);

// User login (cookie is set inside LoginHandler)
UserRouter.post("/login", LoginHandler);

// User logout (clears cookie)
UserRouter.post("/logout", LogoutHandler);

UserRouter.get('/auth/google', passport.authenticate('google', { scope: ['profile','email']}));

UserRouter.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), googleLoginHandler)

export default UserRouter;
