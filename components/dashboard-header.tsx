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

interface DashboardHeaderProps {
  breadcrumbs?: { label: string; href: string }[];
}

export function DashboardHeader({ breadcrumbs }: DashboardHeaderProps) {
  return (
    <header
      className="flex h-16 shrink-0 items-center gap-2 w-full shadow-sm fixed top-0 bg-white z-10"
      style={{ fontFamily: "var(--font-lato)" }}
    >
      <div className="flex items-center gap-2 px-4">
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
    </header>
  );
}
