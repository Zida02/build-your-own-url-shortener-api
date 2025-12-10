import nodemailer from "nodemailer";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

export const sendMail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      // ###use in development ##
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // allow self-signed certs
      },
    });

    const mailOptions = {
      from: `" ACCOUNT SUPPORT" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    //console.log("Preview URL:", nodemailer.getTestMessageUrl(info)); // ✅ Clickable preview

    return info;

    // return info;
  } catch (error) {
    logger.error("EMAIL SENDING FAILED", {
      message: error.message,
      stack: error.stack,
      to,
      subject,
    });

    throw error;
  }
};
