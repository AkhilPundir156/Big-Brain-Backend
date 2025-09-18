import cron from 'node-cron';
import { sendMail } from './mailerHandler.js';
import messageModel from '../models/messageSchema.js';

cron.schedule('59 23 * * *', async () => {
    try{
        const messages=await messageModel.find();
        if(messages.length==0) return;

        const summary=messages.map(msg=>`Name:${msg.name}\n Email:${msg.email}\n
            Message:${msg.message}\n CreatedAt:${msg.createdAt}\n---`).join('\n');

        await sendMail(process.env.EMAIL_SERVICE_USER as string,'Daily Message Summary',summary);
    }catch(err){
        console.error('Error in cron job:',err);
    }
})