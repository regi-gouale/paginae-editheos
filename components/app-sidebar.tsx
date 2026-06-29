"use client";

import {
  BookAlert,
  BookAudio,
  BookLock,
  BookOpen,
  Home,
  Kanban,
  LifeBuoy,
  Send,
  Settings2,
  User2,
  Users2,
} from "lucide-react";
import Image from "next/image";
import type * as React from "react";
import { NavMain } from "@/components/dashboard/nav-main";
import { NavProjects } from "@/components/dashboard/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useProjectStats } from "@/hooks/projects/use-project-stats";
import { authClient } from "@/lib/auth/auth-client";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Tableau de bord",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Projets",
      url: "/dashboard/projects",
      icon: Kanban,
    },
    {
      title: "Équipe",
      url: "/dashboard/team",
      icon: Users2,
    },
    {
      title: "Auteurs",
      url: "/dashboard/authors",
      icon: User2,
    },
    {
      title: "Paramètres",
      url: "/dashboard/settings",
      icon: Settings2,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Contactez-nous",
      url: "#",
      icon: Send,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession();
  const stats = useProjectStats();

  const dynamicStats = [
    {
      name: "À faire",
      url: "/dashboard/projects?statuses=TODO",
      numberOfTasks: stats.todo,
      icon: BookOpen,
    },
    {
      name: "En cours",
      url: "/dashboard/projects?statuses=IN_PROGRESS",
      numberOfTasks: stats.inProgress,
      icon: BookAudio,
    },
    {
      name: "Bloqués",
      url: "/dashboard/projects?statuses=BLOCKED",
      numberOfTasks: stats.blocked,
      icon: BookLock,
    },
    {
      name: "Échéances bientôt",
      url: "/dashboard/projects?dueDays=7",
      numberOfTasks: stats.dueSoon,
      icon: BookAlert,
    },
  ];

  if (!session) {
    return null;
  }

  return (
    <Sidebar
      variant="floating"
      {...props}
      className="border-sidebar-border/60 bg-sidebar/85 backdrop-blur-md"
      style={{ fontFamily: "var(--font-ui-sans)" }}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-xl ring-1 ring-sidebar-primary/30 shadow-sm">
                  <Image
                    src="/logo-editheos.webp"
                    alt="Paginae"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold uppercase tracking-wide">
                    Paginae
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Editheos
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* <div className="flex justify-end px-2 py-1">
          <SidebarActions />
        </div> */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={dynamicStats} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={session.user as { name: string; email: string; image?: string }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
