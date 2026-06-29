"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteNotificationAction,
  getUnreadNotificationsCountAction,
  getUserNotificationsAction,
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/lib/actions/notifications";

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  project?: {
    id: string;
    title: string;
    slug: string;
  } | null;
};

/**
 * Hook pour récupérer les notifications de l'utilisateur
 */
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      console.log("🔍 Fetching notifications...");
      const result = await getUserNotificationsAction();
      console.log("📨 Notifications result:", result);
      if (!result.success) {
        throw new Error(result.error);
      }
      console.log("✅ Notifications loaded:", result.notifications?.length);
      return result.notifications as Notification[];
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });
}

/**
 * Hook pour récupérer le nombre de notifications non lues
 */
export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      console.log("🔍 Fetching unread count...");
      const result = await getUnreadNotificationsCountAction();
      console.log("📊 Unread count result:", result);
      if (!result.success) {
        throw new Error(result.error);
      }
      console.log("✅ Unread count:", result.count);
      return result.count;
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });
}

/**
 * Hook pour marquer une notification comme lue
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const result = await markNotificationAsReadAction(notificationId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.notification;
    },
    onSuccess: () => {
      // Invalider les requêtes liées aux notifications
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error("Erreur", {
        description:
          error.message || "Impossible de marquer la notification comme lue",
      });
    },
  });
}

/**
 * Hook pour marquer toutes les notifications comme lues
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await markAllNotificationsAsReadAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      // Invalider les requêtes liées aux notifications
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Toutes les notifications ont été marquées comme lues");
    },
    onError: (error) => {
      toast.error("Erreur", {
        description:
          error.message || "Impossible de marquer les notifications comme lues",
      });
    },
  });
}

/**
 * Hook pour supprimer une notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const result = await deleteNotificationAction(notificationId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      // Invalider les requêtes liées aux notifications
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification supprimée");
    },
    onError: (error) => {
      toast.error("Erreur", {
        description: error.message || "Impossible de supprimer la notification",
      });
    },
  });
}
