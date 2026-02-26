/**
 * @file models/userModel.js
 * @description User model — stores Google OAuth user profiles.
 * Created automatically on first Google login.
 */
import mongoose from "mongoose";

/** @typedef {import('mongoose').Document & { name: string, email: string, image?: string }} UserDocument */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
    },
});

export const User = mongoose.model("User", userSchema);