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
import { SidebarActions } from "@/components/sidebar-actions";

type DashboardHeaderProps = {
  breadcrumbs?: { label: string; href: string }[];
};

export function DashboardHeader({ breadcrumbs }: DashboardHeaderProps) {
  return (
    <header
      className="inset-x-0 flex h-16 shrink-0 items-center gap-2 border-b border-border/70 bg-background/75 px-4 shadow-[0_10px_24px_-20px_rgba(0,0,0,0.45)] backdrop-blur-md md:px-6 lg:px-8"
      style={{ fontFamily: "var(--font-ui-sans)" }}>
      <div className="flex min-w-0 flex-1 items-center gap-2 px-2 md:px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb className="min-w-0">
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
      <div className="shrink-0 pl-2">
        <SidebarActions />
      </div>
    </header>
  );
}
