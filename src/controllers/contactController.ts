import { Request,response } from "express";
import messageModel from "../models/messageSchema.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const createMessage=asyncHandler(async(req:Request,res=response)=>{
    try{
        const {name,email,message}=req.body;
        if(!name || !email || !message){
            return res.status(400).json({
                success:false,
                msg:'Please provide name, email and message'
            });
        }
        const newMessage=await messageModel.create({
            name,
            email,
            message
        });
        return res.status(201).json({
            success:true,
            msg:'Message created successfully',
            data:newMessage
        });
    }catch(err){
        console.error('Error creating message:',err);
        return res.status(500).json({
            success:false,
            msg:'Internal server error'
        });
    }
})
