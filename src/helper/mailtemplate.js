// Reset Password Email Template
export const getResetPasswordEmailTemplate = (resetUrl, user) => {
  const name = user?.username || "User";
 // console.log(user)

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        background: #f3f4f6;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      }
      .header {
        background: #2563eb;
        padding: 20px;
        text-align: center;
        color: #ffffff;
      }
      .content {
        padding: 30px;
        color: #374151;
      }
      .button {
        display: inline-block;
        background: #2563eb;
        color: #ffffff !important;
        padding: 12px 24px;
        border-radius: 6px;
        text-decoration: none;
        font-size: 16px;
        margin: 20px 0;
      }
      .footer {
        padding: 20px;
        text-align: center;
        background: #f9fafb;
        color: #6b7280;
        font-size: 12px;
      }
      .link {
        word-break: break-all;
        color: #2563eb;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Reset Your Password</h2>
      </div>
      <div class="content">
        <p>Hello ${name},</p>

        <p>You requested a password reset. Click the button below to continue:</p>

        <p style="text-align:center;">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </p>

        <p>Or copy this link into your browser:</p>
        <p class="link">${resetUrl}</p>

        <p><strong>This link expires in 1 hour.</strong></p>
      </div>
      <div class="footer">
        <p>If you did not request this, you can safely ignore the email.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};
