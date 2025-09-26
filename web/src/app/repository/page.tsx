"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Folder,
  FileText,
  Filter,
  Upload,
  FolderPlus,
  EllipsisVertical,
  X,
  Search,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function RepositoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);

  const data = [
    {
      type: "folder",
      name: "Folder-1",
      counterparty: "",
      status: "",
      owner: "Andhika Fadillah",
      created: "26/09/2025",
      start: "",
      end: "",
    },
    {
      type: "folder",
      name: "Folder-2",
      counterparty: "",
      status: "",
      owner: "Andhika Fadillah",
      created: "26/09/2025",
      start: "",
      end: "",
    },
    {
      type: "file",
      name: "Contract-1",
      counterparty: "Pelindo",
      status: "Draft",
      owner: "Andhika Fadillah",
      created: "26/09/2025",
      start: "01/10/2025",
      end: "",
    },
    {
      type: "file",
      name: "Contract-2",
      counterparty: "Pelindo",
      status: "Draft",
      owner: "Andhika Fadillah",
      created: "26/09/2025",
      start: "01/10/2025",
      end: "",
    },
    {
      type: "file",
      name: "Contract-2",
      counterparty: "PT XYZ",
      status: "On review",
      owner: "Andhika Fadillah",
      created: "26/09/2025",
      start: "26/09/2025",
      end: "26/09/2027",
    },
    {
      type: "file",
      name: "Contract-2",
      counterparty: "PT ABC",
      status: "Negotiating",
      owner: "Andhika Fadillah",
      created: "26/09/2025",
      start: "28/09/2025",
      end: "28/09/2029",
    },
    {
      type: "file",
      name: "Contract-2",
      counterparty: "PT LMN",
      status: "Negotiating",
      owner: "Andhika Fadillah",
      created: "26/09/2025",
      start: "28/09/2025",
      end: "28/09/2029",
    },
    {
      type: "file",
      name: "Contract-1",
      counterparty: "Z Agency",
      status: "Active",
      owner: "Andhika Fadillah",
      created: "26/09/2025",
      start: "01/10/2025",
      end: "",
    },
    {
      type: "file",
      name: "Contract-1",
      counterparty: "Pelindo",
      status: "Active",
      owner: "Andhika Fadillah",
      created: "26/09/2025",
      start: "01/10/2025",
      end: "",
    },
    {
      type: "file",
      name: "Contract-1",
      counterparty: "Pelindo",
      status: "Active",
      owner: "Andhika Fadillah",
      created: "26/09/2025",
      start: "01/10/2025",
      end: "",
    },
    {
      type: "file",
      name: "Contract-1",
      counterparty: "Pelindo",
      status: "Signed",
      owner: "Andhika Fadillah",
      created: "26/09/2025",
      start: "01/10/2025",
      end: "",
    },
    {
      type: "file",
      name: "Contract-1",
      counterparty: "Pelindo",
      status: "Finished",
      owner: "Andhika Fadillah",
      created: "26/09/2025",
      start: "01/10/2025",
      end: "",
    },
    {
      type: "file",
      name: "Contract-1",
      counterparty: "Pelindo",
      status: "Signed",
      owner: "Andhika Fadillah",
      created: "26/09/2025",
      start: "01/10/2025",
      end: "",
    },
    {
      type: "file",
      name: "Contract-1",
      counterparty: "Pelindo",
      status: "Finished",
      owner: "Andhika Fadillah",
      created: "26/09/2025",
      start: "01/10/2025",
      end: "",
    },
    {
      type: "file",
      name: "Contract-1",
      counterparty: "Pelindo",
      status: "Signed",
      owner: "Andhika Fadillah",
      created: "26/09/2025",
      start: "01/10/2025",
      end: "",
    },
    {
      type: "file",
      name: "Contract-1",
      counterparty: "Pelindo",
      status: "Finished",
      owner: "Andhika Fadillah",
      created: "26/09/2025",
      start: "01/10/2025",
      end: "",
    },
  ];

  const statusColors: Record<string, string> = {
    Draft: "bg-gray-200 text-gray-700",
    "On review": "bg-purple-100 text-purple-600",
    Negotiating: "bg-orange-100 text-orange-600",
    Active: "bg-blue-100 text-blue-600",
    Signed: "bg-green-100 text-green-600",
    Finished: "bg-gray-300 text-gray-700",
  };

  // Get unique statuses and types for filter options
  const uniqueStatuses = Array.from(
    new Set(data.map((item) => item.status).filter(Boolean)),
  );
  const uniqueTypes = Array.from(new Set(data.map((item) => item.type)));

  // Filter the data based on search term and selected filters
  const filteredData = data.filter((row) => {
    // Search filter
    const matchesSearch =
      searchTerm === "" ||
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.counterparty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.owner.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilters.length === 0 ||
      (row.status && statusFilters.includes(row.status));

    // Type filter
    const matchesType =
      typeFilter.length === 0 || typeFilter.includes(row.type);

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusFilter = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const clearAllFilters = () => {
    setStatusFilters([]);
    setTypeFilter([]);
    setSearchTerm("");
  };

  const hasActiveFilters =
    statusFilters.length > 0 || typeFilter.length > 0 || searchTerm !== "";

  return (
    <div className="w-full p-6 space-y-4 bg-[#F8FAFC]">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Repository</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search"
              className="w-64 rounded-lg border-gray-300 pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-lg text-black cursor-pointer"
          >
            <Upload className="w-4 h-4" /> Store a signed document
          </Button>

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`flex items-center gap-2 rounded-lg cursor-pointer ${
                  hasActiveFilters
                    ? "bg-blue-50 text-blue-600 border-blue-300"
                    : "text-black"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filter
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="ml-1 px-1.5 py-0.5 text-xs"
                  >
                    {statusFilters.length + typeFilter.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-between p-2">
                <span className="text-sm font-medium">Filters</span>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-6 px-2 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <div className="px-2 py-1.5 text-xs font-medium text-gray-500">
                  Type
                </div>
                {uniqueTypes.map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={typeFilter.includes(type)}
                    onCheckedChange={() => handleTypeFilter(type)}
                    className="capitalize"
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
                    onCheckedChange={() => handleStatusFilter(status)}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>

          {typeFilter.map((type) => (
            <Badge
              key={`type-${type}`}
              variant="secondary"
              className="flex items-center gap-1 capitalize"
            >
              Type: {type}
              <X
                className="w-3 h-3 cursor-pointer hover:bg-gray-300 rounded"
                onClick={() => handleTypeFilter(type)}
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
                className="w-3 h-3 cursor-pointer hover:bg-gray-300 rounded"
                onClick={() => handleStatusFilter(status)}
              />
            </Badge>
          ))}

          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{searchTerm}"
              <X
                className="w-3 h-3 cursor-pointer hover:bg-gray-300 rounded"
                onClick={() => setSearchTerm("")}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredData.length} of {data.length} items
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Counterparty</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Creation date</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Initial end date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No items found matching your filters
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((row, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  {row.type === "folder" ? (
                    <Folder className="w-4 h-4 text-blue-500" />
                  ) : (
                    <FileText className="w-4 h-4 text-gray-500" />
                  )}
                  {row.name}
                </TableCell>
                <TableCell>{row.counterparty}</TableCell>
                <TableCell>
                  {row.status && (
                    <Badge
                      className={`${statusColors[row.status]} rounded-full px-2 py-0.5`}
                    >
                      {row.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-orange-400 text-white text-xs">
                      A
                    </AvatarFallback>
                  </Avatar>
                  {row.owner}
                </TableCell>
                <TableCell>{row.created}</TableCell>
                <TableCell>{row.start}</TableCell>
                <TableCell>{row.end}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
