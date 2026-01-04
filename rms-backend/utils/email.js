// utils/email.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendResetEmail(to, resetUrl) {
  const result = await resend.emails.send({
    from: "RMS <onboarding@resend.dev>",
    to,
    subject: "Reset your password",
    html: `
      <h2>Password reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 15 minutes.</p>
    `
  });

  if (result.error) {
    console.error("RESET EMAIL ERROR:", result.error);
    throw new Error("Failed to send reset email");
  }
}

async function sendVerifyEmail(to, verifyUrl) {
  const result = await resend.emails.send({
    from: "RMS <onboarding@resend.dev>",
    to,
    subject: "Verify your email",
    html: `
      <h2>Verify your email</h2>
      <p>Please verify your email to activate your account.</p>
      <a href="${verifyUrl}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `
  });

  if (result.error) {
    console.error("VERIFY EMAIL ERROR:", result.error);
    throw new Error("Failed to send verification email");
  }
}

module.exports = {
  sendResetEmail,
  sendVerifyEmail
};
