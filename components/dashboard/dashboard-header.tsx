import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarActions } from "../sidebar-actions";

type DashboardHeaderProps = {
  breadcrumbs?: { label: string; href: string }[];
};

export function DashboardHeader({ breadcrumbs }: DashboardHeaderProps) {
  return (
    <header
      className="fixed top-0 z-20 mx-auto flex h-16 w-full shrink-0 items-center gap-2 border-b border-border/70 bg-background/75 px-4 shadow-[0_10px_24px_-20px_rgba(0,0,0,0.45)] backdrop-blur-md max-w-7xl md:px-6 lg:px-8"
      style={{ fontFamily: "var(--font-ui-sans)" }}>
      <div className="flex items-center gap-2 px-2 md:px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">
                Espace de travail
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs?.map((item, index) => (
              <div key={`breadcrumb-${index}`} className="flex items-center">
                <BreadcrumbSeparator
                  className="hidden md:block"
                  key={`separator-${index}`}
                />
                <BreadcrumbItem key={`item-${index}`}>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage className="ml-2">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
            {!breadcrumbs && (
              <>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Tableau de bord</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex-1" />
      {/* <div className="gap-4 mr-auto md:mr-64 lg:mr-72 flex items-center">
        <ThemeToggle />
      </div> */}
      <div className="mr-auto flex items-center gap-4 md:mr-64 lg:mr-72">
        <SidebarActions />
      </div>
    </header>
  );
}
