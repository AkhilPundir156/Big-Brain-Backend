import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, text: string) {
    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
        host: "smtp.example.com", // Replace with your SMTP server
        port: 587, // Replace with your SMTP port
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER, // Replace with your SMTP username
            pass: process.env.EMAIL_PASS, // Replace with your SMTP password
        },
    });

    // Send the email
    const info = await transporter.sendMail({
        from: process.env.EMAIL_SERVICE_USER as string, // Replace with your sender email
        to,
        subject,
        text,
    });

    console.log("Email sent:", info.messageId);
}

export default sendEmail;