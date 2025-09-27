// app-sidebar.tsx
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut, useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import {
  FilePlus,
  FileUp,
  ChevronDown,
  Plus,
  Pencil,
  CloudUpload,
  UploadCloud,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type BackendContractStatus =
  | "Draft"
  | "On Review"
  | "Negotiating"
  | "Signing"
  | "Active"
  | "Finished";

type ContractListItem = {
  id: string;
  name: string;
  status: BackendContractStatus;
  createdAt: string | null;
  counterPartyName: string | null;
  ownerName: string | null;
};

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();
  const [storeDocModalOpen, setStoreDocModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL, []);

  const { data: contracts } = useQuery<ContractListItem[], Error>({
    queryKey: ["contracts"],
    enabled: Boolean(apiBaseUrl),
    queryFn: async () => {
      if (!apiBaseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      }

      const response = await fetch(`${apiBaseUrl}/api/contract`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = (body as { error?: string }).error;
        throw new Error(message ?? "Failed to load contracts");
      }

      return (await response.json()) as ContractListItem[];
    },
    staleTime: 1000 * 30,
  });

  const reviewCount = useMemo(() => {
    if (!contracts) {
      return 0;
    }
    return contracts.filter((contract) => contract.status === "On Review")
      .length;
  }, [contracts]);

  const items = useMemo(
    () => [
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
        badge: reviewCount > 0 ? reviewCount : undefined,
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
    ],
    [reviewCount],
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleStartDrafting = () => {
    // Navigate to start drafting page
    router.push("/contracts/new");
  };

  const handleStoreSignedDoc = () => {
    // Open the store signed document modal
    setStoreDocModalOpen(true);
  };

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.push("/login");
  }, []);

  return (
    <Sidebar className="border-r bg-white">
      <SidebarContent className="flex flex-col justify-between h-full bg-white">
        {/* Top Section */}
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 px-4 py-6">
            <img src="/logo.svg" alt="Dock Logo" className="h-11 w-11" />
            <span className="text-[#4EB4E1] font-semibold text-lg">DOCK</span>
          </div>

          {/* New Contract Button with Dropdown */}
          <div className="px-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center gap-4 w-full rounded-full bg-[#4EB4E1] hover:bg-[#42A5F5] text-white cursor-pointer py-4 px-6 text-base font-medium h-12">
                  <Plus className="w-6 h-6" />
                  <span> New Contract</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 ml-4"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={handleStartDrafting}
                    className="cursor-pointer flex items-start py-2"
                  >
                    <div className="w-10 h-10 bg-[#ECFDF3] rounded-lg flex items-center justify-center mr-2">
                      <Pencil className="w-7 h-7 text-[#12B76A]" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[14px] text-[#192632]">
                        Start Drafting
                      </p>
                      <p className="text-[10px] text-[#192632]">
                        From a template or external doc
                      </p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleStoreSignedDoc}
                    className="cursor-pointer flex items-start py-2"
                  >
                    <div className="w-10 h-10 bg-[#E0EAFF] rounded-lg flex items-center justify-center mr-2">
                      <CloudUpload className="w-10 h-10 text-[#444CE7]" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[14px] text-[#192632]">
                        Store a Signed Doc
                      </p>
                      <p className="text-[10px] text-[#192632]">
                        Upload signed PDF only
                      </p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Menu */}
          <SidebarGroup className="mt-4">
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem className="flex gap-2" key={item.title}>
                      <div
                        className={cn(
                          "w-1.5 rounded-br-lg rounded-r-lg",
                          isActive
                            ? "bg-[#1E609E] text-gray-500"
                            : "text-gray-500 hover:!bg-gray-100 hover:!text-gray-700",
                        )}
                      ></div>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                          "rounded-lg px-4 py-7 transition-colors !bg-transparent",
                          isActive
                            ? "!bg-[#1E609E] !text-white hover:!bg-[#1E609E]"
                            : "text-gray-500 hover:!bg-gray-100 hover:!text-gray-700",
                        )}
                      >
                        <Link
                          href={item.url}
                          className="flex items-center gap-3"
                        >
                          <Image
                            src={isActive ? item.iconActive : item.icon}
                            alt={`${item.title} icon`}
                            width={25}
                            height={25}
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
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Footer / User Info */}
        <SidebarFooter className="p-4 border-t bg-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex items-center justify-center rounded-full bg-yellow-400 text-white font-bold">
              {session?.user?.image ? (
                <Image
                  className="rounded-full size-9"
                  src={session?.user?.image}
                  alt="User Image"
                  width={36}
                  height={36}
                />
              ) : (
                session?.user?.name?.charAt(0)
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{session?.user?.name}</span>
              {isClient && session ? (
                <button
                  type="button"
                  className="text-left text-xs text-gray-500 hover:underline"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              ) : (
                <span className="text-xs text-gray-500">Legal Team</span>
              )}
            </div>
          </div>
        </SidebarFooter>
      </SidebarContent>

      {/* Store Signed Document Modal */}
      <Dialog open={storeDocModalOpen} onOpenChange={setStoreDocModalOpen}>
        <DialogContent className="max-w-lg bg-white rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">
              Store a signed document
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="new" className="w-full mt-4">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="new">New Contract</TabsTrigger>
              <TabsTrigger value="ongoing">On-going Contract</TabsTrigger>
            </TabsList>

            {/* New Contract Tab */}
            <TabsContent value="new" className="mt-6">
              <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-gray-500">
                <UploadCloud className="w-10 h-10 mb-2" />
                <p>Drag and Drop files, or browse</p>
                <p className="text-xs text-gray-400">
                  Allowed files: .docx, .pdf
                </p>
              </div>
            </TabsContent>

            {/* Ongoing Contract Tab */}
            <TabsContent value="ongoing" className="mt-6">
              <div className="mb-4">
                <select className="w-full border rounded-md p-2 text-gray-600">
                  <option>Select on-going contract</option>
                  <option>Contract A</option>
                  <option>Contract B</option>
                </select>
              </div>

              <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-gray-500">
                <UploadCloud className="w-10 h-10 mb-2" />
                <p>Drag and Drop files, or browse</p>
                <p className="text-xs text-gray-400">
                  Allowed files: .docx, .pdf
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
