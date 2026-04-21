import resend from "../config/resend";
import { renderTemplate } from "./emailTemplate";

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
  // Kirim email verifikasi akun
  verificationEmail: async ({ email, token, username }: VerificatonEmail) => {
    console.log("[DEBUG sendEmail] verificationEmail sending to:", email, "username:", username);

    const html = renderTemplate("verification", { token, username });

    const { data, error } = await resend.emails.send({
      from: "Eventry <noreply@azafadev.web.id>",
      to: [email],
      subject: "Verify your email",
      html,
    });

    if (error) {
      console.log("[DEBUG sendEmail] verificationEmail failed:", error);
      throw new Error("Failed to send verification email");
    }

    console.log("[DEBUG sendEmail] verificationEmail success, messageId:", data?.id);
  },

  // Kirim email link reset password
  resetPassword: async ({ email, token, username }: VerificatonEmail) => {
    console.log("[DEBUG sendEmail] resetPassword sending to:", email, "username:", username);

    // Build URL reset password yang akan dikirim ke email user
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = renderTemplate("reset-password", { resetUrl, username });

    const { data, error } = await resend.emails.send({
      from: "Eventry <noreply@azafadev.web.id>",
      to: [email],
      subject: "Reset your password",
      html,
    });

    if (error) {
      console.log("[DEBUG sendEmail] resetPassword failed:", error);
      throw new Error("Failed to send reset email");
    }

    console.log("[DEBUG sendEmail] resetPassword success, messageId:", data?.id);
  },

  // Kirim notifikasi transaksi diterima
  transactionAccepted: async ({ email, username, eventName, finalPrice, quantity }: TransactionEmail) => {
    console.log("[DEBUG sendEmail] transactionAccepted sending to:", email, "event:", eventName);

    const html = renderTemplate("transaction-accepted", {
      username,
      eventName,
      finalPrice: finalPrice.toLocaleString("id-ID"),
      quantity,
    });

    const { data, error } = await resend.emails.send({
      from: "Eventry <noreply@azafadev.web.id>",
      to: [email],
      subject: "Your ticket has been confirmed!",
      html,
    });

    // Jika gagal kirim email, jangan throw error agar transaksi tetap berhasil
    if (error) {
      console.log("[DEBUG sendEmail] transactionAccepted failed:", error);
    }

    console.log("[DEBUG sendEmail] transactionAccepted success, messageId:", data?.id);
  },

  // Kirim notifikasi transaksi ditolak
  transactionRejected: async ({ email, username, eventName, finalPrice, quantity }: TransactionEmail) => {
    console.log("[DEBUG sendEmail] transactionRejected sending to:", email, "event:", eventName);

    const html = renderTemplate("transaction-rejected", {
      username,
      eventName,
      finalPrice: finalPrice.toLocaleString("id-ID"),
      quantity,
    });

    const { data, error } = await resend.emails.send({
      from: "Eventry <noreply@azafadev.web.id>",
      to: [email],
      subject: "Transaction Rejected",
      html,
    });

    // Jika gagal kirim email, jangan throw error agar transaksi tetap berhasil
    if (error) {
      console.log("[DEBUG sendEmail] transactionRejected failed:", error);
    }

    console.log("[DEBUG sendEmail] transactionRejected success, messageId:", data?.id);
  },
};