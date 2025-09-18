import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: process.env.EMAIL_SERVICE_USER,
        pass: process.env.EMAIL_SERVICE_PASS
    },
});

export const sendMail=async(to:string,subject:string,text:string)=>{
    await transporter.sendMail({
        from:process.env.EMAIL_SERVICE_USER,
        to,// Send to self
        subject,
        text
    });
};
