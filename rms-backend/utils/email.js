const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendResetEmail(to, resetUrl) {
  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Reset your password",
    html: `
      <p>Reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `
  });

  console.log("RESEND RESULT:", result);
}

module.exports = { sendResetEmail };
