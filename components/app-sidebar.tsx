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
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
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
import Image from "next/image";

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
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Général",
          url: "#",
        },
        {
          title: "Équipe",
          url: "#",
        },
        {
          title: "Facturation",
          url: "#",
        },
        {
          title: "Limites",
          url: "#",
        },
      ],
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
      url: "/dashboard/projects?status=TODO",
      numberOfTasks: stats.todo,
      icon: BookOpen,
    },
    {
      name: "En cours",
      url: "/dashboard/projects?status=IN_PROGRESS",
      numberOfTasks: stats.inProgress,
      icon: BookAudio,
    },
    {
      name: "Bloqués",
      url: "/dashboard/projects?status=BLOCKED",
      numberOfTasks: stats.blocked,
      icon: BookLock,
    },
    {
      name: "Échéances aujourd'hui",
      url: "/dashboard/projects?dueToday=true",
      numberOfTasks: stats.dueToday,
      icon: BookAlert,
    },
  ];

  if (!session) {
    return null;
  }

  return (
    <Sidebar
      variant="inset"
      {...props}
      style={{ fontFamily: "var(--font-merriweather)" }}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/logo-editheos.webp"
                    alt="Paginae"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium uppercase">
                    Paginae
                  </span>
                  <span className="truncate text-xs">Editheos</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
