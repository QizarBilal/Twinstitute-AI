import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

transporter.verify((error) => {
  if (error) {
    console.error('SMTP Configuration Error:', error)
  }
})

function getEmailLayout(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111111; border: 1px solid #1a1a1a; border-radius: 8px;">
              <tr>
                <td style="background: linear-gradient(90deg, #00D9FF 0%, #0099CC 100%); padding: 20px 40px; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #000000; font-size: 24px; font-weight: 700;">Twinstitute AI</h1>
                  <p style="margin: 5px 0 0 0; color: #003344; font-size: 12px; font-weight: 500;">Digital Capability Institution</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px;">
                  ${content}
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px; background-color: #0a0a0a; border-top: 1px solid #1a1a1a; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0 0 5px 0; font-size: 11px; color: #666666; text-align: center;">
                    This is an automated message from Twinstitute AI
                  </p>
                  <p style="margin: 0; font-size: 10px; color: #444444; text-align: center;">
                    © 2026 Twinstitute AI. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

export async function sendOTPEmail(email: string, otp: string, fullName: string): Promise<void> {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 600;">Verify Your Account</h2>
    <p style="margin: 0 0 20px 0; color: #cccccc; font-size: 16px; line-height: 1.6;">Hello ${fullName},</p>
    <p style="margin: 0 0 30px 0; color: #cccccc; font-size: 16px; line-height: 1.6;">Your verification code is:</p>
    <div style="background: linear-gradient(135deg, #00D9FF 0%, #0099CC 100%); border-radius: 8px; padding: 30px; text-align: center; margin: 0 0 30px 0;">
      <div style="font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #000000; font-family: 'Courier New', monospace;">${otp}</div>
    </div>
    <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px; line-height: 1.5;">⏱ This code expires in 10 minutes</p>
    <p style="margin: 0 0 20px 0; color: #999999; font-size: 14px; line-height: 1.5;">If you didn't request this code, please ignore this email.</p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #222222;">
      <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.5;">🔒 Security Notice: Never share this code with anyone. Twinstitute AI will never ask for your verification code.</p>
    </div>
  `

  await transporter.sendMail({
    from: `"Twinstitute AI" <${process.env.SMTP_FROM || 'noreply@twinstitute-ai.com'}>`,
    to: email,
    subject: 'Verify Your Twinstitute AI Account',
    html: getEmailLayout(content),
  })
}

export async function sendWelcomeEmail(email: string, fullName: string): Promise<void> {
  const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 600;">Welcome to Twinstitute AI</h2>
    <p style="margin: 0 0 20px 0; color: #cccccc; font-size: 16px; line-height: 1.6;">Hello ${fullName},</p>
    <p style="margin: 0 0 20px 0; color: #cccccc; font-size: 16px; line-height: 1.6;">Your account has been successfully verified! You now have full access to the Digital Capability Institution platform.</p>
    <p style="margin: 0 0 30px 0; color: #cccccc; font-size: 16px; line-height: 1.6;">Begin your capability development journey by completing your orientation profile.</p>
    <div style="text-align: center; margin: 0 0 30px 0;">
      <a href="${appUrl}/auth/login" style="display: inline-block; background: linear-gradient(90deg, #00D9FF 0%, #0099CC 100%); color: #000000; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 700;">Access Platform</a>
    </div>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #222222;">
      <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.5;">Need help? Contact our support team or visit our help center.</p>
    </div>
  `

  await transporter.sendMail({
    from: `"Twinstitute AI" <${process.env.SMTP_FROM || 'noreply@twinstitute-ai.com'}>`,
    to: email,
    subject: 'Welcome to Twinstitute AI',
    html: getEmailLayout(content),
  })
}

export async function sendPasswordResetEmail(email: string, resetToken: string, fullName: string): Promise<void> {
  const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}`
  
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
    <p style="margin: 0 0 20px 0; color: #cccccc; font-size: 16px; line-height: 1.6;">Hello ${fullName},</p>
    <p style="margin: 0 0 30px 0; color: #cccccc; font-size: 16px; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password:</p>
    <div style="text-align: center; margin: 0 0 30px 0;">
      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(90deg, #00D9FF 0%, #0099CC 100%); color: #000000; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 700;">Reset Password</a>
    </div>
    <p style="margin: 0 0 20px 0; color: #999999; font-size: 14px; line-height: 1.5;">Or copy and paste this link into your browser:</p>
    <p style="margin: 0 0 30px 0; color: #00D9FF; font-size: 12px; word-break: break-all; font-family: 'Courier New', monospace;">${resetUrl}</p>
    <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px; line-height: 1.5;">⏱ This link expires in 20 minutes</p>
    <p style="margin: 0 0 20px 0; color: #999999; font-size: 14px; line-height: 1.5;">If you didn't request this, please ignore this email.</p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #222222;">
      <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.5;">🔒 Security Notice: This is a one-time use link. Never share this link with anyone.</p>
    </div>
  `

  await transporter.sendMail({
    from: `"Twinstitute AI" <${process.env.SMTP_FROM || 'noreply@twinstitute-ai.com'}>`,
    to: email,
    subject: 'Reset Your Twinstitute AI Password',
    html: getEmailLayout(content),
  })
}

export async function sendPasswordChangedEmail(email: string, fullName: string): Promise<void> {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 600;">Password Changed Successfully</h2>
    <p style="margin: 0 0 20px 0; color: #cccccc; font-size: 16px; line-height: 1.6;">Hello ${fullName},</p>
    <p style="margin: 0 0 20px 0; color: #cccccc; font-size: 16px; line-height: 1.6;">Your password has been changed successfully. You can now log in with your new password.</p>
    <p style="margin: 0 0 30px 0; color: #cccccc; font-size: 16px; line-height: 1.6;">If you did not make this change, please contact our support team immediately.</p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #222222;">
      <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.5;">🔒 Security Notice: If you did not authorize this change, your account may be compromised.</p>
    </div>
  `

  await transporter.sendMail({
    from: `"Twinstitute AI" <${process.env.SMTP_FROM || 'noreply@twinstitute-ai.com'}>`,
    to: email,
    subject: 'Your Password Has Been Changed',
    html: getEmailLayout(content),
  })
}
