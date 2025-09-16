"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteNotification,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationsCount,
  type Notification,
} from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { useState } from "react";

/**
 * Composant pour l'icône de notification avec badge
 */
function NotificationIcon() {
  const { data: unreadCount, isLoading } = useUnreadNotificationsCount();

  return (
    <div className="relative ">
      <Bell className="size-5" />
      {!isLoading && unreadCount! > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 size-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount! > 9 ? "9+" : unreadCount}
        </Badge>
      )}
    </div>
  );
}

/**
 * Composant pour un élément de notification
 */
function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "PROJECT_CREATED":
        return "🆕";
      case "PROJECT_UPDATED":
        return "✏️";
      case "PROJECT_MOVED":
        return "📋";
      case "PROJECT_ASSIGNED":
        return "👤";
      case "PROJECT_DUE_SOON":
        return "⏰";
      case "PROJECT_OVERDUE":
        return "🚨";
      case "TASK_COMPLETED":
        return "✅";
      case "MEMBER_ADDED":
        return "👥";
      case "AUTHOR_ADDED":
        return "✍️";
      default:
        return "📢";
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors relative group",
        !notification.read && "bg-blue-50 dark:bg-blue-950/20",
        "hover:bg-gray-50 dark:hover:bg-gray-800/50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-shrink-0 text-lg">
        {getNotificationIcon(notification.type)}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", !notification.read && "font-medium")}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: fr,
          })}
        </p>
      </div>

      {/* Actions au survol */}
      {isHovered && (
        <div className="flex items-center gap-1">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(notification.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Indicateur non lu */}
      {!notification.read && (
        <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full" />
      )}
    </div>
  );
}

/**
 * Composant principal du dropdown de notifications
 */
export function NotificationsDropdown() {
  const { data: notifications, isLoading, error } = useNotifications();
  const { data: unreadCount } = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();
  // const queryClient = useQueryClient();

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDelete = (notificationId: string) => {
    deleteNotification.mutate(notificationId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <NotificationIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Contenu des notifications */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            // Skeleton pendant le chargement
            <div className="space-y-3 p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-3">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            // Message d'erreur
            <div className="p-4 text-center text-sm text-muted-foreground">
              Erreur lors du chargement des notifications
            </div>
          ) : !notifications || notifications.length === 0 ? (
            // Aucune notification
            <div className="p-4 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Aucune notification
            </div>
          ) : (
            // Liste des notifications
            <div className="space-y-1 p-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
