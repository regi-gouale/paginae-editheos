import { createUserNotification } from "@/lib/notifications-helpers";
import { prisma } from "@/lib/prisma";

async function createTestNotif() {
  try {
    const user = await prisma.user.findFirst();
    if (user) {
      await createUserNotification(
        user.id,
        "PROJECT_DUE_SOON",
        "⏰ Rappel test",
        "Ceci est une notification de test pour vérifier l'affichage dans l'interface.",
      );
      console.log("✅ Notification de test créée");
    }
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestNotif();
