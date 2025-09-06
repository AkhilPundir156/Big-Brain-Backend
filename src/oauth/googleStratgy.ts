import { Strategy as googleStrategy } from "passport-google-oauth20";
import passport from "passport";
import userSchema from "../models/userSchema.js";

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

passport.deserializeUser(function (id, cb) {
    userSchema.findOne({ googleId: id }),
        function (err: any, user: any) {
            if (err) {
                return cb(err);
            }
            return cb(null, user);
        };
});

export const Strategy = new googleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    async function (accessToken, refreshToken, profile, cb) {
        try {
            console.log({ accessToken, refreshToken, profile });
            console.log("emails", profile.emails);
            let foundUser = await userSchema.findOne({ googleId: profile.id });
            const avatarUrl = profile.photos?.[0]?.value;

            if (!foundUser) {
                foundUser = await userSchema.create({
                    name: profile.displayName,
                    email: profile.emails?.[0]?.value,
                    googleId: profile.id,
                    password: accessToken,
                    avatar_url: avatarUrl,
                });
            }
            cb(false, foundUser);
        } catch (err) {
            cb(err);
        }
    }
);
