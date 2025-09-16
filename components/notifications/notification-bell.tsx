"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUnreadNotificationsCount } from "@/hooks/use-notifications";
import { Bell } from "lucide-react";

/**
 * Composant simplifié pour l'icône de notification (pour la sidebar mobile)
 */
export function NotificationBell() {
  const { data: unreadCount, isLoading } = useUnreadNotificationsCount();

  return (
    <Button variant="ghost" size="sm" className="relative">
      <Bell className="h-5 w-5" />
      {!isLoading && unreadCount && unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
