"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  RefreshCcw,
  Search,
  Eye,
  Signature,
  BadgeCheck,
  Lightbulb,
  CircleArrowOutUpRight,
} from "lucide-react";

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

type InboxDocument = {
  id: string;
  name: string;
  counterparty: string;
  requesterName: string;
  requesterInitials: string;
  date: string;
};

const formatDate = (value: string | null) => {
  if (!value) {
    return "-";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
};

const getInitials = (value: string | null) => {
  if (!value) {
    return "--";
  }

  const [first = "", second = ""] = value.split(" ");
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
};

export default function InboxPage() {
  const router = useRouter();
  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL, []);

  const { data, isLoading, isError, error, refetch } = useQuery<
    ContractListItem[],
    Error
  >({
    queryKey: ["contracts", "inbox"],
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
        throw new Error(message ?? "Failed to load documents");
      }

      return (await response.json()) as ContractListItem[];
    },
    staleTime: 1000 * 30,
  });

  const reviewItems = useMemo<InboxDocument[]>(() => {
    if (!data) {
      return [];
    }

    return data
      .filter((contract) => contract.status === "On Review")
      .map((contract) => ({
        id: contract.id,
        name: contract.name,
        counterparty: contract.counterPartyName ?? "Unknown",
        requesterName: contract.ownerName ?? "Unknown",
        requesterInitials: getInitials(contract.ownerName),
        date: formatDate(contract.createdAt),
      }));
  }, [data]);

  const tasks = useMemo(
    () => [
      {
        id: "review",
        title: "Document to review",
        icon: Eye,
        items: reviewItems,
      },
      {
        id: "sign",
        title: "Document to sign",
        icon: Signature,
        items: [],
      },
      {
        id: "approve",
        title: "Document to approve",
        icon: BadgeCheck,
        items: [],
      },
      {
        id: "acknowledge",
        title: "Document to acknowledge",
        icon: Lightbulb,
        items: [],
      },
    ],
    [reviewItems],
  );

  if (!apiBaseUrl) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#F8FAFC] p-8 text-center">
        <p className="text-sm text-[#F04438]">
          NEXT_PUBLIC_API_URL is not configured.
        </p>
        <p className="text-sm text-[#576069]">
          Update your environment configuration and reload the page.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#F8FAFC] p-8 text-center">
        <p className="text-sm text-[#576069]">Loading documents...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#F8FAFC] p-8 text-center">
        <p className="text-sm text-[#F04438]">
          {error instanceof Error ? error.message : "Failed to load documents."}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-4 bg-[#F8FAFC]">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search something"
            className="pl-12 h-12 rounded-full text-base w-full"
            disabled
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => refetch()}
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Link href="/manta">
            <Button
              className="bg-black text-white flex items-center gap-2 rounded-full px-4 cursor-pointer"
              onClick={() => router.push("/manta")}
            >
              Chat with Manta
              <Image
                src="/logo.svg"
                alt="Manta AI"
                width={16}
                height={16}
                className="w-6 h-6"
              />
            </Button>
          </Link>
        </div>
      </div>
      <Accordion type="single" collapsible className="space-y-4">
        {tasks.map((task) => (
          <AccordionItem
            key={task.id}
            value={task.id}
            className="rounded-lg border bg-white shadow-sm"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <task.icon className="w-5 h-5" />
                <span className="font-medium">
                  {task.title} ({task.items.length})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-[#202224] text-left text-[12px]">
                    <tr>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Counterparty</th>
                      <th className="px-4 py-2">Requester</th>
                      <th className="px-4 py-2">Request date</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {task.items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-sm text-muted-foreground"
                        >
                          No documents in this category.
                        </td>
                      </tr>
                    ) : (
                      task.items.map((doc) => (
                        <tr
                          key={doc.id}
                          className="font-semibold hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => {
                            if (task.id === "review") {
                              router.push(`/contracts/review/${doc.id}`);
                            }
                          }}
                        >
                          <td className="px-4 py-2 text-[14px]">{doc.name}</td>
                          <td className="px-4 py-2 text-[14px]">
                            {doc.counterparty}
                          </td>
                          <td className="px-4 py-2 flex items-center gap-2 text-[14px]">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>
                                {doc.requesterInitials}
                              </AvatarFallback>
                            </Avatar>
                            {doc.requesterName}
                          </td>
                          <td className="px-4 py-2 text-[14px]">{doc.date}</td>
                          <td className="px-4 py-2 text-gray-400">
                            <CircleArrowOutUpRight className="h-4 w-4" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
