import mongoose,{Schema} from "mongoose";
import { date } from "zod/v4-mini";

export interface IMessage{
    name: string;
    email: string;
    message: string;
    createdAt?: Date;
}


const messageSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    message:{
        type: String,
        required: true
    }},
    {timestamps: true}
)

export const messageModel = mongoose.model<IMessage>('message',messageSchema);

export default messageModel;