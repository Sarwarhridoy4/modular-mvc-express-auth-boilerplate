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
  templateData?: Record<string, unknown>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

/**
 * Sends an email using a predefined EJS template.
 *
 * This utility configures a Nodemailer transporter using SMTP settings
 * from environment variables. It renders an EJS template with provided data
 * and sends an email to the specified recipient.
 *
 * @param {SendEmailOptions} options - An object containing email sending options.
 * @param {string} options.to - The recipient's email address.
 * @param {string} options.subject - The subject line of the email.
 * @param {string} options.templateName - The name of the EJS template (without .ejs extension) located in `src/utils/templates`.
 * @param {Record<string, any>} [options.templateData] - Data to pass to the EJS template for rendering.
 * @param {Array<Object>} [options.attachments] - An array of attachment objects. Each object should have `filename`, `content`, and `contentType`.
 * @throws {AppError} If email sending fails or service is unavailable.
 *
 * @example
 * // To send a welcome email:
 * import { sendEmail } from './sendEmail.js';
 *
 * async function sendWelcomeEmail(userEmail: string, userName: string) {
 *   try {
 *     await sendEmail({
 *       to: userEmail,
 *       subject: 'Welcome to Our Service!',
 *       templateName: 'welcome', // Assumes src/utils/templates/welcome.ejs exists
 *       templateData: { name: userName, appName: 'POS Inventory' },
 *     });
 *     console.log('Welcome email sent successfully.');
 *   } catch (error) {
 *     console.error('Failed to send welcome email:', error);
 *   }
 * }
 *
 * @example
 * // To send a password reset email with a token:
 * import { sendEmail } from './sendEmail.js';
 *
 * async function sendPasswordResetEmail(userEmail: string, resetLink: string) {
 *   try {
 *     await sendEmail({
 *       to: userEmail,
 *       subject: 'Password Reset Request',
 *       templateName: 'forgetPassword', // Assumes src/utils/templates/forgetPassword.ejs exists
 *       templateData: { resetLink: resetLink },
 *     });
 *     console.log('Password reset email sent successfully.');
 *   } catch (error) {
 *   console.error('Failed to send password reset email:', error);
 *   }
 * }
 */
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
  } catch (error: unknown) {
    console.error("Email sending failed:", (error as Error).message);
    throw new AppError(500, "Email service unavailable");
  }
};
