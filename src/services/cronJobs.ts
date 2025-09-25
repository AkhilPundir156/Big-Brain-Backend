import CronService from "./cronService.js";

import sendEmail from "../utils/emailHandler.js";
import { contactModel } from "../models/userSchema.js";

async function setDailyContactSummaryEmail() {
    const cronService = await CronService.getInstance();

    cronService.CreateJob("dailyContactNotification", {
        schedule: "59 23 * * *", // Runs every day at 11:59 PM
        todayOnly: true,
        runOnInit: false,
        job: async (context) => {
            const { startOfDay, endOfDay } = context || {};
            const contacts = await contactModel.find({
                createdAt: { $gte: startOfDay, $lt: endOfDay },
            });

            if (contacts.length === 0) {
                return;
            }

            const summary = contacts
                .map(
                    (msg) =>
                        `- Name: ${msg.name}|| Email:(${msg.email})|| Message: ${msg.message} || CreatedAt: ${msg.createdAt}`
                )
                .join("\n");

            await sendEmail(
                process.env.EMAIL_SERVICE_USER as string,
                "Daily Contact Messages Summary",
                summary
            );
        },
    });

    cronService.startAllJobs();
}

setDailyContactSummaryEmail();
