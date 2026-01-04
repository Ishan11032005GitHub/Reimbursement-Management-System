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

if (!user.is_verified) {
  return res.status(403).json({
    message: "Please verify your email before logging in"
  });
}

async function sendVerifyEmail(to, verifyUrl) {
  const result = await resend.emails.send({
    from: "RMS <onboarding@resend.dev>", // works without domain
    to,
    subject: "Verify your email address",
    html: `
      <h2>Verify your email</h2>
      <p>Click the button below to activate your account.</p>
      <a href="${verifyUrl}"
         style="display:inline-block;padding:12px 18px;
                background:#0046ff;color:#fff;
                border-radius:8px;text-decoration:none;">
        Verify Email
      </a>
      <p style="margin-top:12px;font-size:13px;">
        This link expires in 24 hours.
      </p>
    `
  });

  if (result.error) {
    console.error("VERIFY EMAIL ERROR:", result.error);
    throw new Error("Email send failed");
  }
}

module.exports = {sendResetEmail,sendVerifyEmail};