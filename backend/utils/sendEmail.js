import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Define the function ONCE
const sendEmail = async (to, subject, text) => {
  try {
    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    // Throw an error so the calling controller can catch it and send a 500 status
    throw new Error("Email sending failed. Check Nodemailer config/logs.");
  }
};

// Export the function ONCE at the end
export default sendEmail;
