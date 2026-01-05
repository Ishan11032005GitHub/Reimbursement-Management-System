const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const DEV_EMAIL = "ishan11032005@gmail.com";

function resolveRecipient(to) {
  // In dev / testing, Resend only allows sending to your own email
  if (process.env.NODE_ENV !== "production") {
    return DEV_EMAIL;
  }
  return to;
}

async function sendResetEmail(to, resetUrl) {
  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM, // must be your Resend-approved sender
    to: resolveRecipient(to),
    subject: "Reset your password",
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link expires in 15 minutes.</p>
    `
  });

  if (result.error) {
    console.error("RESET EMAIL ERROR:", result.error);
  }
}

async function sendVerifyEmail(to, verifyUrl) {
  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: resolveRecipient(to),
    subject: "Verify your email",
    html: `
      <p>Welcome to RMS 👋</p>
      <p>Please verify your email:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
      <p>This link expires in 24 hours.</p>
    `
  });

  if (result.error) {
    console.error("VERIFY EMAIL ERROR:", result.error);
  }
}

module.exports = {
  sendResetEmail,
  sendVerifyEmail
};
