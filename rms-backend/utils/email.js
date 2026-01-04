// utils/email.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendResetEmail(to, resetUrl) {
  await resend.emails.send({
    from: "ishan11032005@gmail.com",
    to,
    subject: "Reset your password",
    html: `
      <p>Click below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 15 minutes.</p>
    `
  });
}

module.exports = { sendResetEmail };
