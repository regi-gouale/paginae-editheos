"use server";

import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/auth-lib";
import {
  supportRequestEmailHTML,
  supportRequestEmailText,
} from "@/lib/email/support-request-template";
import { sendEmail } from "@/lib/email/usesend";

const supportRequestSchema = z.object({
  category: z.enum(["BUG", "QUESTION", "ACCOUNT", "OTHER"]),
  subject: z.string().min(1, "Le sujet est requis").max(150),
  message: z.string().min(10, "Merci de détailler votre demande").max(5000),
});

export type SupportRequestInput = z.infer<typeof supportRequestSchema>;

export async function sendSupportRequest(
  input: SupportRequestInput,
): Promise<{ success: boolean; error?: string }> {
  const session = await getCurrentSession();
  if (!session?.user) {
    return { success: false, error: "Vous devez être connecté" };
  }

  const parsed = supportRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Formulaire invalide" };
  }

  const supportEmail = process.env.SUPPORT_EMAIL || "support@editheos.com";
  const { category, subject, message } = parsed.data;
  const userName = session.user.name || session.user.email;
  const userEmail = session.user.email;

  try {
    await sendEmail({
      to: supportEmail,
      subject: `[Support Paginae] ${subject}`,
      html: supportRequestEmailHTML({
        userName,
        userEmail,
        category,
        subject,
        message,
      }),
      text: supportRequestEmailText({
        userName,
        userEmail,
        category,
        subject,
        message,
      }),
      replyTo: userEmail,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending support request:", error);
    return {
      success: false,
      error: "Erreur lors de l'envoi de votre demande",
    };
  }
}
