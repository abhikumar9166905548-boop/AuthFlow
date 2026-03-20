const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // 🔥 change 1
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000, // 🔥 change 2 (timeout fix)
    });

    await transporter.sendMail({
      from: `"Rollera" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.log("❌ Email error:", error); // 🔥 change 3 (debug)
  }
};

module.exports = sendEmail;