"use client";

import {
  IconBook,
  IconBook2,
  IconBookmarks,
  IconBooks,
  IconHome,
  IconLayoutKanban,
  IconLifebuoy,
  IconSend,
  IconSettings,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
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
import type { MemberRole } from "@/prisma/generated/prisma/client";
import { Separator } from "./ui/separator";

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
      icon: IconHome,
    },
    {
      title: "Projets",
      url: "/dashboard/projects",
      icon: IconLayoutKanban,
    },
    {
      title: "Équipe",
      url: "/dashboard/team",
      icon: IconUsers,
    },
    {
      title: "Auteurs",
      url: "/dashboard/authors",
      icon: IconUser,
    },
    {
      title: "Paramètres",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: IconLifebuoy,
    },
    {
      title: "Contactez-nous",
      url: "#",
      icon: IconSend,
    },
  ],
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  role: MemberRole;
  canAccessAuthors: boolean;
  canAccessTeam: boolean;
};

const roleLabels: Record<MemberRole, string> = {
  ADMIN: "Administrateur",
  DESIGNER: "Designer",
  REVIEWER: "Relecteur",
  CONTRIBUTOR: "Contributeur",
  GUEST: "Invité",
};

export function AppSidebar({
  role,
  canAccessAuthors,
  canAccessTeam,
  ...props
}: AppSidebarProps) {
  const { data: session } = authClient.useSession();
  const stats = useProjectStats();

  const navMain = data.navMain.filter((item) => {
    if (item.url === "/dashboard/team") {
      return canAccessTeam;
    }

    if (item.url === "/dashboard/authors") {
      return canAccessAuthors;
    }

    return true;
  });

  const dynamicStats = [
    {
      name: "À faire",
      url: "/dashboard/projects?statuses=TODO",
      numberOfTasks: stats.todo,
      icon: IconBook,
    },
    {
      name: "En cours",
      url: "/dashboard/projects?statuses=IN_PROGRESS",
      numberOfTasks: stats.inProgress,
      icon: IconBook2,
    },
    {
      name: "Bloqués",
      url: "/dashboard/projects?statuses=BLOCKED",
      numberOfTasks: stats.blocked,
      icon: IconBooks,
    },
    {
      name: "Échéances bientôt",
      url: "/dashboard/projects?dueDays=7",
      numberOfTasks: stats.dueSoon,
      icon: IconBookmarks,
    },
  ];

  if (!session) {
    return null;
  }

  return (
    <Sidebar
      variant="inset"
      {...props}
      className="border-sidebar-border/70 bg-sidebar/85 shadow-2xl shadow-black/5 backdrop-blur-xl"
      style={{ fontFamily: "var(--font-ui-sans)" }}
    >
      <SidebarHeader className="gap-3 p-3 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="h-auto rounded-4xl bg-sidebar/60 p-2"
            >
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-9 items-center justify-center rounded-full shadow-sm">
                  <Image
                    src="/logo-editheos.webp"
                    alt="Paginae"
                    className="rounded-full"
                    width={48}
                    height={48}
                  />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold uppercase tracking-wide text-lg ml-2">
                    Paginae
                  </span>
                  <span className="mt-1 inline-flex w-fit rounded-full border border-sidebar-border/70 bg-sidebar-accent/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sidebar-foreground/80">
                    {roleLabels[role]}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <Separator
        orientation="horizontal"
        className="border-sidebar-border/60"
      />
      <SidebarContent className="px-2">
        <NavMain items={navMain} />
        <NavProjects projects={dynamicStats} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/60 p-2">
        <NavUser
          user={session.user as { name: string; email: string; image?: string }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
