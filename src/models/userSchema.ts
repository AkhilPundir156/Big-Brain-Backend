import mongoose, { Schema } from "mongoose";
import { required } from "zod/v4-mini";

const userSchema = new Schema({
    name: {
        type: String,
    },
    email : {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    googleId: {
        type: String,
        unique: true,
    },
    avatar_url: String,
});

const contactSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const userModel = mongoose.model('user',userSchema);
const contactModel = mongoose.model('contact', contactSchema);
export {contactModel};

export default userModel;

