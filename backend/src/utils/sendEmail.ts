import resend from "../config/resend";

type VerificatonEmail = {
  email: string;
  token: string;
  username: string;
};

export const sendEmail = {
  verificationEmail: async ({ email, token, username }: VerificatonEmail) => {
    const { data, error } = await resend.emails.send({
      from: "Eventry <noreply@azafadev.web.id>",
      to: [email],
      subject: "Verify your email",
      html: `
        <h1>Welcome, ${username}!</h1>
        <p>Thank you for registering. Please use the code below to verify your email address:</p>
        <h2 style="letter-spacing: 8px; font-size: 32px; text-align: center;">${token}</h2>
        <p>This code will expire in 24 hours.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    if (error) {
      throw new Error("Failed to send verification email");
    }
  },
  resetPassword: async ({ email, token, username }: VerificatonEmail) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: "Eventry <noreply@azafadev.web.id>",
      to: [email],
      subject: "Reset your password",
      html: `
        <h1>Hello, ${username}!</h1>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <p style="text-align: center;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <p><strong>This link will expire in 15 minutes.</strong></p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      `,
    });

    if (error) {
      throw new Error("Failed to send reset email");
    }
  },
};
