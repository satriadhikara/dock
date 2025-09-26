// app-sidebar.tsx
"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: "/sidebar/Dashboard.svg",
    iconActive: "/sidebar/DashboardActive.svg",
  },
  {
    title: "Contracts",
    url: "/contracts",
    icon: "/sidebar/Contracts.svg",
    iconActive: "/sidebar/ContractsActive.svg",
  },
  {
    title: "Inbox",
    url: "/inbox",
    icon: "/sidebar/Inbox.svg",
    iconActive: "/sidebar/InboxActive.svg",
    badge: 5,
  },
  {
    title: "Repository",
    url: "/repository",
    icon: "/sidebar/Repository.svg",
    iconActive: "/sidebar/RepositoryActive.svg",
  },
  {
    title: "Templates",
    url: "/templates",
    icon: "/sidebar/Template.svg",
    iconActive: "/sidebar/TemplateActive.svg",
  },
  {
    title: "Manta",
    url: "/manta",
    icon: "/sidebar/Manta.svg",
    iconActive: "/sidebar/MantaActive.svg",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  
  return (
    <Sidebar className="border-r bg-white">
      <SidebarContent className="flex flex-col justify-between h-full">
        {/* Top Section */}
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 px-4 py-6">
            <img src="/logo.svg" alt="Dock Logo" className="h-11 w-11" />
            <span className="text-[#4EB4E1] font-semibold text-lg">DOCK</span>
          </div>

          {/* New Contract Button */}
          <div className="px-4">
            <Button className="w-full rounded-full bg-[#4EB4E1] hover:bg-[#42A5F5] text-white cursor-pointer">
              + New Contract
            </Button>
          </div>

          {/* Menu */}
          <SidebarGroup className="mt-4">
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <SidebarMenuItem className="flex gap-2" key={item.title}>
                      <div
                          className={cn(
                              "w-1.5 rounded-br-lg rounded-r-lg",
                              isActive
                              ? "bg-[#1E609E] text-gray-500"
                              : "text-gray-500 hover:!bg-gray-100 hover:!text-gray-700"
                          )}
                      ></div>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                          "rounded-lg px-4 py-7 transition-colors !bg-transparent",
                          isActive
                            ? "!bg-[#1E609E] !text-white hover:!bg-[#1E609E]"
                            : "text-gray-500 hover:!bg-gray-100 hover:!text-gray-700"
                        )}
                      >
                        <Link href={item.url} className="flex items-center gap-3">
                          <Image 
                            src={isActive ? item.iconActive : item.icon} 
                            alt={`${item.title} icon`}
                            width={25} 
                            height={25  } 
                            className="h-5 w-5"
                          />
                          <span>{item.title}</span>
                          {item.badge && (
                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Footer / User Info */}
        <SidebarFooter className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex items-center justify-center rounded-full bg-yellow-400 text-white font-bold">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">Andhika Fadillah</span>
              <span className="text-xs text-gray-500">Legal Team</span>
            </div>
          </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  )
}
