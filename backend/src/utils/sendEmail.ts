import resend from "../config/resend";

type VerificatonEmail = {
  email: string;
  token: string;
  username: string;
};

type TransactionEmail = {
  email: string;
  username: string;
  eventName: string;
  finalPrice: number;
  quantity: number;
  status?: "ACCEPTED" | "REJECTED";
};

console.log("[DEBUG sendEmail] Utility loaded");

export const sendEmail = {
  verificationEmail: async ({ email, token, username }: VerificatonEmail) => {
    console.log("[DEBUG sendEmail] verificationEmail sending to:", email, "username:", username);

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
      console.log("[DEBUG sendEmail] verificationEmail failed:", error);
      throw new Error("Failed to send verification email");
    }

    console.log("[DEBUG sendEmail] verificationEmail success, messageId:", data?.id);
  },
  resetPassword: async ({ email, token, username }: VerificatonEmail) => {
    console.log("[DEBUG sendEmail] resetPassword sending to:", email, "username:", username);

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
      console.log("[DEBUG sendEmail] resetPassword failed:", error);
      throw new Error("Failed to send reset email");
    }

    console.log("[DEBUG sendEmail] resetPassword success, messageId:", data?.id);
  },
  transactionAccepted: async ({ email, username, eventName, finalPrice, quantity }: TransactionEmail) => {
    console.log("[DEBUG sendEmail] transactionAccepted sending to:", email, "event:", eventName);

    const { data, error } = await resend.emails.send({
      from: "Eventry <noreply@azafadev.web.id>",
      to: [email],
      subject: "🎉 Your ticket has been confirmed!",
      html: `
        <h1>Hello, ${username}!</h1>
        <p>Great news! Your transaction has been <strong>accepted</strong>.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Order Details</h2>
          <p><strong>Event:</strong> ${eventName}</p>
          <p><strong>Tickets:</strong> ${quantity}</p>
          <p><strong>Total Paid:</strong> IDR ${finalPrice.toLocaleString("id-ID")}</p>
        </div>
        <p>Thank you for your purchase! We look forward to seeing you at the event.</p>
        <p>If you have any questions, please contact the event organizer.</p>
      `,
    });

    if (error) {
      console.log("[DEBUG sendEmail] transactionAccepted failed:", error);
      // Don't throw - email failure shouldn't block transaction
    }

    console.log("[DEBUG sendEmail] transactionAccepted success, messageId:", data?.id);
  },
  transactionRejected: async ({ email, username, eventName, finalPrice, quantity }: TransactionEmail) => {
    console.log("[DEBUG sendEmail] transactionRejected sending to:", email, "event:", eventName);

    const { data, error } = await resend.emails.send({
      from: "Eventry <noreply@azafadev.web.id>",
      to: [email],
      subject: "❌ Transaction Rejected",
      html: `
        <h1>Hello, ${username}!</h1>
        <p>Unfortunately, your transaction has been <strong>rejected</strong>.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Order Details</h2>
          <p><strong>Event:</strong> ${eventName}</p>
          <p><strong>Tickets:</strong> ${quantity}</p>
          <p><strong>Amount:</strong> IDR ${finalPrice.toLocaleString("id-ID")}</p>
        </div>
        <p><strong>Note:</strong> Any points, vouchers, or coupons used in this transaction have been returned to your account.</p>
        <p>If you believe this is a mistake, please contact the event organizer.</p>
      `,
    });

    if (error) {
      console.log("[DEBUG sendEmail] transactionRejected failed:", error);
      // Don't throw - email failure shouldn't block transaction
    }

    console.log("[DEBUG sendEmail] transactionRejected success, messageId:", data?.id);
  },
};
