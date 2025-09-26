"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  EllipsisVertical,
  Eye,
  FileText,
  Filter,
  Folder,
  Lightbulb,
  Search,
  Signature,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusColors: Record<string, string> = {
  Draft: "bg-gray-200 text-gray-700",
  "On Review": "bg-purple-100 text-purple-600",
  Negotiating: "bg-orange-100 text-orange-600",
  Active: "bg-blue-100 text-blue-600",
  Signed: "bg-green-100 text-green-600",
  Finished: "bg-gray-300 text-gray-700",
};

type BackendContractStatus =
  | "Draft"
  | "On Review"
  | "Negotiating"
  | "Active"
  | "Signed"
  | "Finished";

type ContractListItem = {
  id: string;
  name: string;
  status: BackendContractStatus;
  createdAt: string | null;
  startedAt: string | null;
  initialEndDate: string | null;
  counterPartyName: string | null;
  ownerName: string | null;
  ownerImage: string | null;
  type: "BuiltIn" | "Imported";
};

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

const getInitials = (value: string | null) => {
  if (!value) return "--";
  const [first = "", second = ""] = value.split(" ");
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
};

export default function RepositoryPage() {
  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL, []);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilters, setStatusFilters] = useState<BackendContractStatus[]>(
    [],
  );
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [data, setData] = useState<ContractListItem[]>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    data: queryData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ContractListItem[], Error>({
    queryKey: ["contracts", "repository"],
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
        throw new Error(message ?? "Failed to load repository items");
      }

      return (await response.json()) as ContractListItem[];
    },
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (queryData) {
      setData(queryData);
      setSelectedRows([]);
    }
  }, [queryData]);

  useEffect(() => {
    if (!showDeleteConfirm) {
      setDeleteError(null);
    }
  }, [showDeleteConfirm]);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.counterPartyName ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (row.ownerName ?? "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilters.length === 0 || statusFilters.includes(row.status);

      const matchesType =
        typeFilters.length === 0 || typeFilters.includes(row.type);

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [data, searchTerm, statusFilters, typeFilters]);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(data.map((item) => item.status)));
  }, [data]);

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(data.map((item) => item.type)));
  }, [data]);

  const hasActiveFilters =
    statusFilters.length > 0 ||
    typeFilters.length > 0 ||
    searchTerm.trim() !== "";

  const toggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  };

  const toggleStatus = (status: BackendContractStatus) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((value) => value !== status)
        : [...prev, status],
    );
  };

  const toggleType = (type: string) => {
    setTypeFilters((prev) =>
      prev.includes(type)
        ? prev.filter((value) => value !== type)
        : [...prev, type],
    );
  };

  const clearAllFilters = () => {
    setStatusFilters([]);
    setTypeFilters([]);
    setSearchTerm("");
  };

  const handleDelete = () => {
    if (selectedRows.length === 0) return;
    setShowDeleteConfirm(true);
  };

  const deleteContractsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      if (!apiBaseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      }

      const response = await fetch(`${apiBaseUrl}/api/contract`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = (body as { error?: string }).error;
        throw new Error(message ?? "Failed to delete contracts");
      }

      return ids;
    },
    onSuccess: (ids) => {
      setData((prev) => prev.filter((item) => !ids.includes(item.id)));
      setSelectedRows([]);
      setShowDeleteConfirm(false);
    },
    onError: (mutationError) => {
      setDeleteError(
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to delete contracts.",
      );
    },
  });

  const confirmDelete = () => {
    if (deleteContractsMutation.isPending) return;
    deleteContractsMutation.mutate(selectedRows);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const selectAllVisible = (checked: boolean | "indeterminate") => {
    if (checked) {
      setSelectedRows(filteredData.map((item) => item.id));
    } else {
      setSelectedRows([]);
    }
  };

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
        <p className="text-sm text-[#576069]">Loading repository...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#F8FAFC] p-8 text-center">
        <p className="text-sm text-[#F04438]">
          {error instanceof Error
            ? error.message
            : "Failed to load repository."}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div
        className={`w-full space-y-4 bg-[#F8FAFC] p-6 ${
          showDeleteConfirm ? "blur-sm" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Repository</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search"
                className="w-64 rounded-lg border-gray-300 pl-10"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-lg text-black"
            >
              <Upload className="h-4 w-4" /> Store a signed document
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`flex items-center gap-2 rounded-lg ${
                    hasActiveFilters
                      ? "border-blue-300 bg-blue-50 text-blue-600"
                      : "text-black"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filter
                  {hasActiveFilters ? (
                    <Badge
                      variant="secondary"
                      className="ml-1 px-1.5 py-0.5 text-xs"
                    >
                      {statusFilters.length + typeFilters.length}
                    </Badge>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm font-medium">Filters</span>
                  {hasActiveFilters ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-6 px-2 text-xs"
                    >
                      Clear all
                    </Button>
                  ) : null}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <div className="px-2 py-1.5 text-xs font-medium text-gray-500">
                    Type
                  </div>
                  {uniqueTypes.map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={typeFilters.includes(type)}
                      onCheckedChange={() => toggleType(type)}
                    >
                      {type}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <div className="px-2 py-1.5 text-xs font-medium text-gray-500">
                    Status
                  </div>
                  {uniqueStatuses.map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={statusFilters.includes(status)}
                      onCheckedChange={() => toggleStatus(status)}
                    >
                      {status}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="rounded-[8px] border border-[#E3E7EA] bg-white p-2.5">
              <EllipsisVertical className="h-[18px] w-[18px]" fill="#576069" />
            </div>
          </div>
        </div>

        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {typeFilters.map((type) => (
              <Badge
                key={`type-${type}`}
                variant="secondary"
                className="flex items-center gap-1"
              >
                Type: {type}
                <X
                  className="h-3 w-3 cursor-pointer rounded hover:bg-gray-300"
                  onClick={() => toggleType(type)}
                />
              </Badge>
            ))}
            {statusFilters.map((status) => (
              <Badge
                key={`status-${status}`}
                variant="secondary"
                className="flex items-center gap-1"
              >
                Status: {status}
                <X
                  className="h-3 w-3 cursor-pointer rounded hover:bg-gray-300"
                  onClick={() => toggleStatus(status)}
                />
              </Badge>
            ))}
            {searchTerm ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{searchTerm}"
                <X
                  className="h-3 w-3 cursor-pointer rounded hover:bg-gray-300"
                  onClick={() => setSearchTerm("")}
                />
              </Badge>
            ) : null}
          </div>
        ) : null}

        <div className="text-sm text-gray-600">
          Showing {filteredData.length} of {data.length} items
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox
                  checked={
                    filteredData.length > 0 &&
                    filteredData.every((item) => selectedRows.includes(item.id))
                  }
                  onCheckedChange={selectAllVisible}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Counterparty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Creation date</TableHead>
              <TableHead>Start date</TableHead>
              <TableHead>Initial end date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-gray-500"
                >
                  No items found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => router.push(`/contracts/view/${row.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/contracts/view/${row.id}`);
                    }
                  }}
                  tabIndex={0}
                  className="cursor-pointer transition hover:bg-gray-50 focus:bg-gray-100"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onCheckedChange={() => toggleRow(row.id)}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    {row.type === "Imported" ? (
                      <Folder className="h-4 w-4 text-blue-500" />
                    ) : (
                      <FileText className="h-4 w-4 text-gray-500" />
                    )}
                    {row.name}
                  </TableCell>
                  <TableCell>{row.counterPartyName ?? "Unknown"}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        statusColors[row.status] ?? "bg-gray-200 text-gray-700"
                      } rounded-full px-2 py-0.5`}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      {row.ownerImage ? (
                        <AvatarImage
                          src={row.ownerImage}
                          alt={row.ownerName ?? "Owner"}
                          className="object-cover"
                          style={{ width: "100%", height: "100%" }}
                          referrerPolicy="no-referrer"
                        />
                      ) : null}
                      <AvatarFallback className="bg-orange-400 text-xs text-white">
                        {getInitials(row.ownerName)}
                      </AvatarFallback>
                    </Avatar>
                    {row.ownerName ?? "Unknown"}
                  </TableCell>
                  <TableCell>{formatDate(row.createdAt)}</TableCell>
                  <TableCell>{formatDate(row.startedAt)}</TableCell>
                  <TableCell>{formatDate(row.initialEndDate)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {selectedRows.length > 0 ? (
          <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border bg-[#1E609E] px-4 py-2 shadow-lg">
            <span className="text-sm text-white">
              {selectedRows.length} selected
            </span>
            <div className="border-l border-r border-[#F8FAFC] px-3">
              <Button
                variant="default"
                size="sm"
                className="bg-[#1E609E] hover:bg-[#1A5490]"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-[#1E609E] hover:bg-[#1A5490]"
                >
                  Start Workflow
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="border-b border-gray-100">
                  <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-md bg-[#D1E9FF]">
                    <Eye className="h-4 w-4 text-[#2E90FA]" />
                  </div>
                  For Review
                </DropdownMenuItem>
                <DropdownMenuItem className="border-b border-gray-100">
                  <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-md bg-[#ECFDF3]">
                    <BadgeCheck className="h-4 w-4 text-[#12B76A]" />
                  </div>
                  For Approval
                </DropdownMenuItem>
                <DropdownMenuItem className="border-b border-gray-100">
                  <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-md bg-[#EBE9FE]">
                    <Signature className="h-4 w-4 text-[#7A5AF8]" />
                  </div>
                  For Signage
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-md bg-[#FEF0C7]">
                    <Lightbulb className="h-4 w-4 text-[#F79009]" />
                  </div>
                  For Acknowledge
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}
      </div>

      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="mx-4 w-full max-w-md rounded-lg border bg-white p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-semibold">Confirm Delete</h3>
            <p className="mb-4 text-gray-600">
              Are you sure you want to delete {selectedRows.length} selected
              item{selectedRows.length > 1 ? "s" : ""}? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={cancelDelete}
                disabled={deleteContractsMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteContractsMutation.isPending}
              >
                {deleteContractsMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
            {deleteError ? (
              <p className="mt-3 text-sm text-[#F04438]">{deleteError}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
