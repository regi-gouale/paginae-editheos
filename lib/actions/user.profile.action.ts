"use server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { getCurrentSession } from "@/lib/auth/auth-lib";
import { prisma } from "@/lib/prisma";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.email("Email invalide"),
});

export type UpdateProfileResult =
  | { success: true; emailVerificationSent?: boolean }
  | { success: false; error: string; field?: "email" | "name" | "general" };

export async function updateUserProfileAction(
  formData: FormData,
): Promise<UpdateProfileResult> {
  const session = await getCurrentSession();
  if (!session?.user) {
    return { success: false, error: "Non authentifié", field: "general" };
  }

  const data = {
    name: (formData.get("name") as string) || "",
    email: (formData.get("email") as string) || "",
  };

  const parseResult = updateProfileSchema.safeParse(data);
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0];
    const field =
      firstError?.path[0] === "email"
        ? "email"
        : firstError?.path[0] === "name"
          ? "name"
          : "general";
    return {
      success: false,
      error: firstError?.message ?? "Données invalides",
      field,
    };
  }

  const validated = parseResult.data;
  const emailChanged =
    validated.email.toLowerCase() !== session.user.email.toLowerCase();

  try {
    // Build update payload (name + optional avatar; email is handled separately)
    const updateData: Record<string, unknown> = {
      name: validated.name,
    };

    // Handle avatar file if present: convert to data URL and save in user.image
    const avatar = formData.get("avatar");
    if (avatar && typeof (avatar as File | Blob).arrayBuffer === "function") {
      try {
        const fileLike = avatar as File | Blob;
        const arrayBuffer = await fileLike.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const mime = (fileLike as File).type || "image/*";
        const dataUrl = `data:${mime};base64,${base64}`;
        updateData.image = dataUrl;
      } catch (err) {
        console.error("Error processing avatar file:", err);
      }
    }

    // Update name and avatar directly
    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    // If email changed, trigger the verification flow via better-auth
    if (emailChanged) {
      // Check if the new email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email: validated.email.toLowerCase() },
      });
      if (existingUser) {
        return {
          success: false,
          error: "Cette adresse email est déjà utilisée",
          field: "email",
        };
      }

      // Trigger better-auth email change verification
      const response = await auth.api.changeEmail({
        headers: await headers(),
        body: {
          newEmail: validated.email,
          callbackURL: "/dashboard/profile",
        },
      });

      if (!response?.status) {
        return {
          success: false,
          error:
            "Impossible d'envoyer l'email de confirmation. Veuillez réessayer.",
          field: "email",
        };
      }

      revalidatePath("/dashboard/profile");
      revalidatePath("/dashboard");
      return { success: true, emailVerificationSent: true };
    }

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("updateUserProfileAction error:", error);

    // Handle Prisma unique constraint violation
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed")
    ) {
      return {
        success: false,
        error: "Cette adresse email est déjà utilisée",
        field: "email",
      };
    }

    return {
      success: false,
      error: "Une erreur est survenue. Veuillez réessayer.",
      field: "general",
    };
  }
}
