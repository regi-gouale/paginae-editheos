import type { Metadata } from "next";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

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
    <SidebarProvider className="min-h-screen w-screen bg-transparent">
      <AppSidebar />
      <SidebarInset className="relative overflow-hidden bg-transparent">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        >
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-chart-2/10 blur-3xl" />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
