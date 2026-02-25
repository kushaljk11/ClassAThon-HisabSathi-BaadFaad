import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {User} from "../models/userModel.js";
import { generateToken } from "../utils/generateToken.js";

export const passportUse = passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.example.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (_, __, profile, done) => {
      let user = await User.findOne({
        email: profile.emails[0].value,
      });

      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          image: profile.photos[0].value,
        });
      }

      const token = generateToken(user);

      done(null, { token, user });
    }
  )
);