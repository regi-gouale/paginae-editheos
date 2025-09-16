import { createDueDateNotifications } from "@/lib/notifications-helpers";

async function runNotificationCheck() {
  try {
    console.log("🔍 Vérification des échéances de projets...");

    const result = await createDueDateNotifications();

    if (result.success) {
      console.log("✅ Vérification terminée avec succès");
      console.log(`📅 Projets arrivant à échéance : ${result.dueSoonCount}`);
      console.log(`🚨 Projets en retard : ${result.overdueCount}`);

      if (result.dueSoonCount === 0 && result.overdueCount === 0) {
        console.log("✨ Aucune notification d'échéance à créer");
      }
    } else {
      console.error("❌ Erreur lors de la vérification :", result.error);
    }
  } catch (error) {
    console.error("❌ Erreur inattendue :", error);
  }
}

runNotificationCheck();
