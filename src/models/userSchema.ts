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

const userModel = mongoose.model('user',userSchema);

export default userModel;

