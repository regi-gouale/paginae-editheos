"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavProjects({
  projects,
}: {
  projects: {
    name: string;
    url: string;
    numberOfTasks?: number;
    icon: LucideIcon;
  }[];
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="uppercase">Aperçu</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name} className="flex items-center gap-4">
            <SidebarMenuButton asChild>
              <Link href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
            {item.numberOfTasks ? (
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">
                {item.numberOfTasks}
              </span>
            ) : (
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">
                0
              </span>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
