import { CronService } from "./cronService.js";
import { contactModel } from "../models/userSchema.js";
import sendEmail from "../utils/emailHandler.js";


const cronService = new CronService();

// Daily cleanup job to remove old contact messages (older than 30 days)
cronService.CreateJob("dailyContactCleanup", {
    schedule: "0 0 * * *", // Runs every day at midnight
    todayOnly: false,
    job: async (context) => {
        const { startOfDay, endOfDay } = context || {};
        await contactModel.deleteMany({
            createdAt: { $lt: startOfDay || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });
    }
});

cronService.CreateJob("dailyContactNotification", {
    schedule: "59 23 * * *", // Runs every day at 11:59 PM
    todayOnly: true,
    job: async (context) => {
        const { startOfDay, endOfDay } = context || {};
        const contacts = await contactModel.find({
            createdAt: { $gte: startOfDay, $lt: endOfDay }
        });

        if(contacts.length===0){
            return;
        }

        const summary = contacts.map((msg) => `- Name: ${msg.name}|| Email:(${msg.email})|| Message: ${msg.message} || CreatedAt: ${msg.createdAt}`).join("\n");

        await sendEmail(
            process.env.EMAIL_SERVICE_USER as string,
            "Daily Contact Messages Summary",
            summary
        );
    }
});

cronService.startAllJobs();

export default cronService;


