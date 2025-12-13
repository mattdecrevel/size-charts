"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";

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
    } else if (segments[1] === "api-keys") {
      breadcrumbs.push({ label: "API Keys" });
    } else if (segments[1] === "docs") {
      breadcrumbs.push({ label: "Documentation", href: "/admin/docs" });
      if (segments[2] === "getting-started") {
        breadcrumbs.push({ label: "Getting Started" });
      } else if (segments[2] === "api") {
        breadcrumbs.push({ label: "API Reference" });
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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        {/* Admin Header */}
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
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
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
