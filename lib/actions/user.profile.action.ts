"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/auth-lib";
import { prisma } from "@/lib/prisma";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.email("Email invalide"),
});

export async function updateUserProfileAction(formData: FormData) {
  const session = await getCurrentSession();
  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  const data = {
    name: (formData.get("name") as string) || "",
    email: (formData.get("email") as string) || "",
  };

  const validated = updateProfileSchema.parse(data);

  try {
    const updateData: Record<string, unknown> = {
      name: validated.name,
      email: validated.email,
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

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    // Revalidate dashboard/profile and dashboard main pages
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("updateUserProfileAction error:", error);
    throw error;
  }
}
