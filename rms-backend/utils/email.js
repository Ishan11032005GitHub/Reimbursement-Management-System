// utils/email.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendResetEmail(to, resetUrl) {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Password Reset</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6f8;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;padding:28px;font-family:Arial, sans-serif;">
            
            <!-- Header -->
            <tr>
              <td style="font-size:22px;font-weight:700;color:#001bb7;">
                Reset your password
              </td>
            </tr>

            <!-- Spacer -->
            <tr><td style="height:14px;"></td></tr>

            <!-- Body -->
            <tr>
              <td style="font-size:15px;color:#333;line-height:1.6;">
                We received a request to reset your account password.
                <br/><br/>
                Click the button below to choose a new password.
              </td>
            </tr>

            <!-- CTA -->
            <tr><td style="height:20px;"></td></tr>
            <tr>
              <td align="center">
                <a href="${resetUrl}"
                  style="
                    display:inline-block;
                    background:#0046ff;
                    color:#ffffff;
                    padding:12px 22px;
                    border-radius:8px;
                    text-decoration:none;
                    font-weight:700;
                    font-size:15px;
                  ">
                  Reset Password
                </a>
              </td>
            </tr>

            <!-- Spacer -->
            <tr><td style="height:20px;"></td></tr>

            <!-- Expiry -->
            <tr>
              <td style="font-size:13px;color:#555;">
                ⏱ This link will expire in <b>15 minutes</b>.
              </td>
            </tr>

            <!-- Security Note -->
            <tr><td style="height:12px;"></td></tr>
            <tr>
              <td style="font-size:13px;color:#777;">
                If you didn’t request this reset, you can safely ignore this email.
                Your password will remain unchanged.
              </td>
            </tr>

            <!-- Divider -->
            <tr><td style="height:22px;border-bottom:1px solid #eee;"></td></tr>

            <!-- Footer -->
            <tr><td style="height:14px;"></td></tr>
            <tr>
              <td style="font-size:12px;color:#888;">
                — RMS Support Team
                <br/>
                This is an automated message. Please do not reply.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const text = `
Reset your password

We received a request to reset your account password.

Open the link below to choose a new password:
${resetUrl}

This link expires in 15 minutes.

If you didn’t request this, you can ignore this email.

— RMS Support Team
`;

  await transporter.sendMail({
    from: `"RMS Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your password",
    html,
    text
  });
}

module.exports = { sendResetEmail };
