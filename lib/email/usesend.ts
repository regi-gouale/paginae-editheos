import { UseSend } from "usesend-js";

const apiKey = process.env.USESEND_API_KEY;

if (!apiKey) {
  throw new Error("USESEND_API_KEY environment variable is not set");
}

export const usesend = new UseSend(apiKey);

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const fromEmail = process.env.EMAIL_FROM || "noreply@paginae-editheos.com";

    const result = await usesend.emails.send({
      to,
      from: fromEmail,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });

    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
