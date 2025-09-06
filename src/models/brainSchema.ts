import mongoose, { Schema } from "mongoose";

const contentSchema = new Schema({
    link: String,

    type: String,

    title: String,

    description: String,

    tags: [{ type: mongoose.Types.ObjectId, ref: "tags" }],

    userId: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        required: true,
    },

    embedding: Array,

    fileUrl: String,

    fileDescription: String,
});

const linkSchema = new Schema({
    hash: { type: String, required: true, unique: true },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
        index: { expires: "0s" },
    },
});

const tagSchema = new Schema({
    name: String,
});

export const linkModel = mongoose.model("link", linkSchema);

export const tagModel = mongoose.model("tags", tagSchema);

export const contentModel = mongoose.model("content", contentSchema);
