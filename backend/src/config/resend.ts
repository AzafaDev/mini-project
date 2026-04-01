import { Resend } from "resend";
import "dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY);

console.log(
  "[RESEND] API Key loaded:",
  process.env.RESEND_API_KEY ? "Yes" : "No",
);

export default resend;
