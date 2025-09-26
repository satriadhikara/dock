"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useSession } from "@/lib/auth-client";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

const AUTH_EXEMPT_ROUTES = ["/login", "/register", "/forgot-password"];

const SIDEBAR_HIDDEN_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/start-drafting",
];

const SIDEBAR_HIDDEN_PREFIXES = [
  "/contracts/new",
  "/contracts/view",
  "/contracts/review",
];

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isClient, setIsClient] = useState(false);

  const isAuthExemptRoute = AUTH_EXEMPT_ROUTES.includes(pathname);
  const isSidebarHiddenRoute = SIDEBAR_HIDDEN_ROUTES.includes(pathname);
  const isSidebarHiddenByPrefix = SIDEBAR_HIDDEN_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || isPending) {
      return;
    }

    if (!session && !isAuthExemptRoute) {
      const search =
        pathname === "/" ? "" : `?redirect=${encodeURIComponent(pathname)}`;
      router.replace(`/login${search}`);
    }
  }, [isClient, isPending, session, isAuthExemptRoute, pathname, router]);

  useEffect(() => {
    if (!isClient || isPending || !session) {
      return;
    }

    if (isAuthExemptRoute && pathname !== "/") {
      router.replace("/");
    }
  }, [isClient, isPending, session, isAuthExemptRoute, pathname, router]);

  const shouldShowSidebar = isClient
    ? !!session && !isSidebarHiddenRoute && !isSidebarHiddenByPrefix
    : !isSidebarHiddenRoute && !isSidebarHiddenByPrefix;

  if (!isClient) {
    if (shouldShowSidebar) {
      return (
        <SidebarProvider>
          <AppSidebar />
          {children}
        </SidebarProvider>
      );
    }
    return <>{children}</>;
  }

  if (isPending && !isAuthExemptRoute) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <span className="text-sm text-muted-foreground">
          Checking session...
        </span>
      </div>
    );
  }

  if (!session && !isAuthExemptRoute) {
    return null;
  }

  if (shouldShowSidebar) {
    return (
      <SidebarProvider>
        <AppSidebar />
        {children}
      </SidebarProvider>
    );
  }

  return <>{children}</>;
}
