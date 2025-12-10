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
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="contents">
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </span>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl p-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
