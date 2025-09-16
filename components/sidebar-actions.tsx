"use client";

import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Composant pour les actions dans la sidebar (notifications, thème, etc.)
 */
export function SidebarActions() {
  return (
    <div className="flex items-center gap-2">
      <NotificationsDropdown />
      <ThemeToggle />
    </div>
  );
}
