import ejs from "ejs";
import path from "path";
import nodemailer from "nodemailer";
import AppError from "../helpers/errorHelper/AppError.js";
import { env } from "../config/env.js";

// Create transporter with SMTP configuration
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: env.SMTP_PORT === "465", // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData?: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: SendEmailOptions) => {
  try {
    const templatePath = path.join(
      process.cwd(),
      "src",
      "utils",
      "templates",
      `${templateName}.ejs`,
    );

    const html = await ejs.renderFile(templatePath, templateData);

    const mailOptions = {
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("📧 Email sent successfully:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  } catch (error: any) {
    console.error("Email sending failed:", error.message);
    throw new AppError(500, "Email service unavailable");
  }
};
