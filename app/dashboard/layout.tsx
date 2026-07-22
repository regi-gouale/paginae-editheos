import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  canManageAuthors,
  canManageTeam,
  getAccessContext,
} from "@/lib/auth/permissions";
import type { MemberRole } from "@/prisma/generated/prisma/client";

export const metadata: Metadata = {
  title: "Paginae - Espace de travail",
  description:
    "Espace de travail Paginae — gérez vos projets éditoriaux en équipe avec Kanban et automatisations.",
  alternates: { canonical: "/dashboard" },
  openGraph: {
    title: "Paginae — Espace de travail",
    description:
      "Espace de travail Paginae — gérez vos projets éditoriaux en équipe avec Kanban et automatisations.",
    type: "website",
    siteName: "Paginae",
  },
  twitter: {
    title: "Paginae — Espace de travail",
    card: "summary",
    description:
      "Espace de travail Paginae — gérez vos projets éditoriaux en équipe.",
  },
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const access = await getAccessContext().catch(() => null);

  if (!access) {
    redirect("/auth");
  }

  return (
    <SidebarProvider className="min-h-screen w-screen bg-transparent">
      <AppSidebar
        role={access.role as MemberRole}
        canAccessAuthors={canManageAuthors(access.role)}
        canAccessTeam={canManageTeam(access.role)}
      />
      <SidebarInset className="relative overflow-hidden bg-transparent">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
