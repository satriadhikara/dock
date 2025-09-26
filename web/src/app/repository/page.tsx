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
  X,
  Search,
  Eye,
  CheckCircle,
  FileSignature,
  Bell,
  BadgeCheck,
  Signature,
  Lightbulb,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function RepositoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [data, setData] = useState([
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
  ]);

  const statusColors: Record<string, string> = {
    Draft: "bg-gray-200 text-gray-700",
    "On review": "bg-purple-100 text-purple-600",
    Negotiating: "bg-orange-100 text-orange-600",
    Active: "bg-blue-100 text-blue-600",
    Signed: "bg-green-100 text-green-600",
    Finished: "bg-gray-300 text-gray-700",
  };

  // Filters
  const uniqueStatuses = Array.from(
    new Set(data.map((item) => item.status).filter(Boolean)),
  );
  const uniqueTypes = Array.from(new Set(data.map((item) => item.type)));

  const filteredData = data.filter((row) => {
    const matchesSearch =
      searchTerm === "" ||
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.counterparty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.owner.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilters.length === 0 ||
      (row.status && statusFilters.includes(row.status));

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

  const toggleRow = (index: number) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    // Get the actual data indices based on filtered data
    const selectedFilteredIndices = selectedRows;
    const actualIndicesToDelete: number[] = [];

    selectedFilteredIndices.forEach((filteredIndex) => {
      const selectedItem = filteredData[filteredIndex];
      const actualIndex = data.findIndex(
        (item) =>
          item.name === selectedItem.name &&
          item.counterparty === selectedItem.counterparty &&
          item.created === selectedItem.created &&
          item.owner === selectedItem.owner,
      );
      if (actualIndex !== -1) {
        actualIndicesToDelete.push(actualIndex);
      }
    });

    // Remove items from data array
    setData((prev) =>
      prev.filter((_, index) => !actualIndicesToDelete.includes(index)),
    );

    // Clear selected rows and hide confirmation
    setSelectedRows([]);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const hasActiveFilters =
    statusFilters.length > 0 || typeFilter.length > 0 || searchTerm !== "";

  return (
    <>
      <div
        className={`w-full p-6 space-y-4 bg-[#F8FAFC] ${showDeleteConfirm ? "blur-sm" : ""}`}
      >
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

        {/* Active Filters */}
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
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  No items found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(i)}
                      onCheckedChange={() => toggleRow(i)}
                    />
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

        {/* Bottom Action Bar */}
        {selectedRows.length > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#1E609E] shadow-lg border rounded-lg px-4 py-2 z-50">
            <span className="text-sm text-white">
              {selectedRows.length} selected
            </span>

            <div className="border-r border-l pl-3 pr-3 border-[#F8FAFC]  ">
              <Button
                variant="default"
                size="sm"
                className="bg-[#1E609E] hover:bg-[#1A5490] cursor-pointer"
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
                  className="bg-[#1E609E] hover:bg-[#1A5490] cursor-pointer"
                >
                  Start Workflow
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="border-b border-gray-100">
                  <div className="w-6 h-6 bg-[#D1E9FF] rounded-md flex items-center justify-center mr-2">
                    <Eye className="w-4 h-4 text-[#2E90FA]" />
                  </div>
                  For Review
                </DropdownMenuItem>
                <DropdownMenuItem className="border-b border-gray-100">
                  <div className="w-6 h-6 bg-[#ECFDF3] rounded-md flex items-center justify-center mr-2">
                    <BadgeCheck className="w-4 h-4 text-[#12B76A]" />
                  </div>
                  For Approval
                </DropdownMenuItem>
                <DropdownMenuItem className="border-b border-gray-100">
                  <div className="w-6 h-6 bg-[#EBE9FE] rounded-md flex items-center justify-center mr-2">
                    <Signature className="w-4 h-4 text-[#7A5AF8]" />
                  </div>
                  For Signage
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="w-6 h-6 bg-[#FEF0C7] rounded-md flex items-center justify-center mr-2">
                    <Lightbulb className="w-4 h-4 text-[#F79009]" />
                  </div>
                  For Acknowledge
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete {selectedRows.length} selected
              item{selectedRows.length > 1 ? "s" : ""}? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={cancelDelete}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
