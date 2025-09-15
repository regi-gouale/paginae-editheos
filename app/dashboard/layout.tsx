import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Metadata } from "next";

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

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
