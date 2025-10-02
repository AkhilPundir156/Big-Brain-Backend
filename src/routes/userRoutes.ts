import { Router } from "express";
import passport from "passport";

import { LoginHandler, LogoutHandler, SignupHandler, contactUsHandler, googleLoginHandler, myProfileHandler, changeTheme } from "../controllers/userController.js";
import { upload } from "../middleware/uploadFile.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";


const UserRouter = Router();

// User signup
UserRouter.post("/signup", upload.single("avatar_image"), SignupHandler);

UserRouter.get("/me", isAuthenticated, myProfileHandler);

//Updating theme
UserRouter.patch("/theme", isAuthenticated, changeTheme );

// User login (cookie is set inside LoginHandler)
UserRouter.post("/login", LoginHandler);

// User logout (clears cookie)
UserRouter.post("/logout", LogoutHandler);

//Contact handling route
UserRouter.post("/contact", contactUsHandler);

UserRouter.get('/auth/google', passport.authenticate('google', { scope: ['profile','email']}));

UserRouter.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), googleLoginHandler)


export default UserRouter;
