"use client";

import { useQuery } from "@tanstack/react-query";
import { EllipsisVertical, Search } from "lucide-react";
import { useMemo } from "react";
import { ContractCard } from "@/components/contract-card";
import Link from "next/link";
import { ContractStatusHeaderCard } from "@/components/contract-status-header-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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
};

type ColumnDefinition = {
  key: "Draft" | "On Review" | "Negotiating" | "Signing";
  label: string;
  statuses: BackendContractStatus[];
};

const COLUMNS: ColumnDefinition[] = [
  { key: "Draft", label: "Draft", statuses: ["Draft"] },
  { key: "On Review", label: "On Review", statuses: ["On Review"] },
  { key: "Negotiating", label: "Negotiating", statuses: ["Negotiating"] },
  { key: "Signing", label: "Signing", statuses: ["Signing"] },
];

const formatDate = (value: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export default function ContractsPage() {
  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL, []);

  const { data, isLoading, isError, error, refetch } = useQuery<
    ContractListItem[],
    Error
  >({
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
    staleTime: 1000 * 60,
  });

  const groupedContracts = useMemo(() => {
    const initial = Object.fromEntries(
      COLUMNS.map((column) => [column.key, [] as ContractListItem[]]),
    ) as Record<ColumnDefinition["key"], ContractListItem[]>;

    if (!data) {
      return initial;
    }

    return data.reduce((acc, contract) => {
      const column = COLUMNS.find((col) =>
        col.statuses.includes(contract.status),
      );

      if (!column) {
        return acc;
      }

      acc[column.key] = [...acc[column.key], contract];
      return acc;
    }, initial);
  }, [data]);

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
        <p className="text-sm text-[#576069]">Loading contracts...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#F8FAFC] p-8 text-center">
        <p className="text-sm text-[#F04438]">
          {error instanceof Error ? error.message : "Failed to load contracts."}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#F8FAFC] p-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-black">Contracts on going</h1>

        <div className="flex items-center gap-2">
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                className="w-[292px] bg-white py-2 pl-10 text-[#A7ADB3]"
                placeholder="Search"
                disabled
              />
            </div>
          </div>

          <div className="rounded-[8px] border border-[#E3E7EA] bg-white p-2.5">
            <EllipsisVertical className="h-[18px] w-[18px]" fill="#576069" />
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 w-full overflow-hidden">
        <div className="flex h-full min-h-0 flex-row justify-between gap-4">
          {COLUMNS.map((column) => {
            const contractsForColumn = groupedContracts[column.key];

            return (
              <div
                key={column.key}
                className="flex h-full min-h-0 w-full flex-col"
              >
                <ContractStatusHeaderCard
                  status={column.key}
                  count={contractsForColumn.length}
                />
                <ScrollArea className="h-full">
                  {contractsForColumn.length === 0 ? (
                    <div className="mt-6 rounded-lg border border-dashed border-[#E3E7EA] p-6 text-center text-xs text-[#7F868E]">
                      No contracts in this stage yet.
                    </div>
                  ) : (
                    contractsForColumn.map((contract) => (
                      <Link
                        key={contract.id}
                        href={`/contracts/view/${contract.id}`}
                        className="block"
                      >
                        <ContractCard
                          company={contract.counterPartyName ?? "Unknown"}
                          title={contract.name}
                          createdAt={formatDate(contract.createdAt)}
                        />
                      </Link>
                    ))
                  )}
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
