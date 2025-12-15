"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { ExampleBanner } from "@/components/admin/example-banner";
import { useExampleMode } from "@/hooks/use-example-mode";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href?: string }[] = [];

  if (segments[0] === "admin") {
    if (segments.length === 1) {
      breadcrumbs.push({ label: "Dashboard" });
    } else if (segments[1] === "size-charts") {
      breadcrumbs.push({ label: "Size Charts", href: "/admin/size-charts" });
      if (segments[2] === "new") {
        breadcrumbs.push({ label: "New" });
      } else if (segments[2]) {
        breadcrumbs.push({ label: "Edit" });
      }
    } else if (segments[1] === "categories") {
      breadcrumbs.push({ label: "Categories" });
    } else if (segments[1] === "labels") {
      breadcrumbs.push({ label: "Labels" });
    } else if (segments[1] === "templates") {
      breadcrumbs.push({ label: "Templates" });
    } else if (segments[1] === "api-keys") {
      breadcrumbs.push({ label: "API Keys" });
    } else if (segments[1] === "docs") {
      breadcrumbs.push({ label: "Documentation", href: "/admin/docs" });
      if (segments[2] === "getting-started") {
        breadcrumbs.push({ label: "Getting Started" });
      } else if (segments[2] === "api") {
        breadcrumbs.push({ label: "API Reference" });
      } else if (segments[2] === "examples") {
        breadcrumbs.push({ label: "Examples", href: "/admin/docs/examples" });
        if (segments[3] === "embed") {
          breadcrumbs.push({ label: "Embed Examples" });
        } else if (segments[3] === "live") {
          breadcrumbs.push({ label: "Live Builder" });
        }
      } else if (segments[2] === "changelog") {
        breadcrumbs.push({ label: "Changelog" });
      }
    }
  }

  return breadcrumbs;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const { isExampleMode } = useExampleMode();

  return (
    <div className="h-svh overflow-hidden flex flex-col" data-example-mode={isExampleMode || undefined}>
      {/* Example Banner - Full width above everything */}
      {isExampleMode && <ExampleBanner className="shrink-0" />}

      <div className="flex-1 overflow-hidden flex min-h-0">
        <SidebarProvider className={`h-full min-h-0 !min-h-0 [&>[data-slot=sidebar-wrapper]]:min-h-0 ${isExampleMode ? '[&_[data-slot=sidebar-container]]:top-[42px] [&_[data-slot=sidebar-container]]:h-[calc(100svh-42px)]' : ''}`}>
          <AppSidebar />
          <SidebarInset className="min-h-0 max-h-full md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm">

          {/* Admin Header */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          {/* Mobile menu trigger */}
          <SidebarTrigger className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </SidebarTrigger>
          <Breadcrumb>
            <BreadcrumbList className="text-sm">
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/admin"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Admin
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="contents">
                  <BreadcrumbSeparator className="text-border" />
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink
                        href={crumb.href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="font-medium text-foreground">
                        {crumb.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </span>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>

          {/* Content Area - single scroll container */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
