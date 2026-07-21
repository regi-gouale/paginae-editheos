"use client";

import type { TablerIcon } from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    icon: TablerIcon;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="px-2 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        Aperçu
      </SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => {
          const isActive = pathname === "/dashboard/projects";
          const count = item.numberOfTasks ?? 0;

          return (
            <SidebarMenuItem
              key={item.name}
              className="flex items-center gap-2"
            >
              <SidebarMenuButton
                asChild
                isActive={isActive}
                className="rounded-full"
              >
                <Link href={item.url as Route}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
              <span
                className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${
                  count > 0
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
