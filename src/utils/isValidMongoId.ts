import mongoose from "mongoose";

export const isValidMongoId = (mongoId: string) => {
    if (!mongoId) {
        return false;
    }
    return mongoose.isValidObjectId(mongoId);
};
