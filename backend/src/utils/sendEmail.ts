import resend from "../config/resend.js";

interface SendVerificationEmailParams {
  to: string;
  name: string;
  token: string;
}

/**
 * Send verification email to user with token
 */
export async function sendVerificationEmail({
  to,
  name,
  token,
}: SendVerificationEmailParams): Promise<void> {
  console.log("[SEND EMAIL] Sending to:", to);
  console.log("[SEND EMAIL] Name:", name);
  console.log("[SEND EMAIL] Token:", token);
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 0;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="background-color: #4F46E5; padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Verify Your Email</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #333333; font-size: 16px; margin: 0 0 20px 0;">Hi ${name},</p>
                  <p style="color: #666666; font-size: 14px; margin: 0 0 30px 0;">Thank you for registering! Please use the verification code below to verify your email:</p>
                  <table role="presentation" style="margin: 0 auto;">
                    <tr>
                      <td style="background-color: #f0f0f0; border-radius: 6px; padding: 20px 40px; text-align: center;">
                        <p style="color: #4F46E5; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">${token}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center;">
                  <p style="color: #999999; font-size: 12px; margin: 0;">This token will expire in 24 hours. If you didn't create an account, please ignore this email.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: "Mini Project <noreply@azafadev.web.id>",
    to,
    subject: "Verify Your Email Address",
    html,
  });
}

interface SendResendVerificationEmailParams {
  to: string;
  name: string;
  token: string;
}

/**
 * Send resend verification email to user with new token
 */
export async function sendResendVerificationEmail({
  to,
  name,
  token,
}: SendResendVerificationEmailParams): Promise<void> {
  console.log("[RESEND EMAIL] Sending to:", to);
  console.log("[RESEND EMAIL] Name:", name);
  console.log("[RESEND EMAIL] Token:", token);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resend Verification Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 0;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="background-color: #4F46E5; padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Verification Code</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #333333; font-size: 16px; margin: 0 0 20px 0;">Hi ${name},</p>
                  <p style="color: #666666; font-size: 14px; margin: 0 0 30px 0;">You requested a new verification code. Please use the code below:</p>
                  <table role="presentation" style="margin: 0 auto;">
                    <tr>
                      <td style="background-color: #f0f0f0; border-radius: 6px; padding: 20px 40px; text-align: center;">
                        <p style="color: #4F46E5; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">${token}</p>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #999999; font-size: 12px; margin: 30px 0 0 0; text-align: center;">This code will expire in 24 hours. If you didn't request this, please ignore this email.</p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center;">
                  <p style="color: #999999; font-size: 12px; margin: 0;">For security reasons, your previous verification code is no longer valid.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: "Mini Project <noreply@azafadev.web.id>",
    to,
    subject: "New Verification Code",
    html,
  });
}
