"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Routes where sidebar should not be shown
  const noSidebarRoutes = ["/login", "/register", "/forgot-password"];

  const showSidebar = !noSidebarRoutes.includes(pathname);

  if (showSidebar) {
    return (
      <SidebarProvider>
        <AppSidebar />
        {children}
      </SidebarProvider>
    );
  }

  return <>{children}</>;
}
