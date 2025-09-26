// app/new-contract/page.tsx
"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/core";
import {
  ArrowLeft,
  File,
  FileText,
  Upload,
  Upload as UploadIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import templateDocument from "@/components/tiptap-templates/simple/data/content.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EMPTY_DOCUMENT: JSONContent = { type: "doc", content: [] };
const TEMPLATE_DOCUMENT = templateDocument as JSONContent;

type ContractResponse = {
  id: string;
  name: string;
  content: JSONContent | null;
};

type CounterParty = {
  id: string;
  name: string;
};

type DraftContext = "blank" | "template";

type StatusMessage = { context: DraftContext; text: string } | null;

type CreateContractVariables = {
  name: string;
  content: JSONContent;
  context: DraftContext;
  counterPartyId: string;
};

type CreateCounterPartyVariables = {
  name: string;
};

export default function NewContractPage() {
  const router = useRouter();
  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL, []);

  const [activeTab, setActiveTab] = useState<DraftContext>("blank");
  const [blankContractName, setBlankContractName] = useState("");
  const [templateChoice, setTemplateChoice] = useState("contract-agreement");
  const [templateContractName, setTemplateContractName] =
    useState("Contract Agreement");
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(null);

  const [counterParties, setCounterParties] = useState<CounterParty[]>([]);
  const [selectedCounterPartyId, setSelectedCounterPartyId] = useState<
    string | null
  >(null);
  const [newCounterPartyName, setNewCounterPartyName] = useState("");
  const [newCounterPartyError, setNewCounterPartyError] = useState<
    string | null
  >(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    data: counterPartyData,
    isLoading: isLoadingCounterParties,
    isFetching: isFetchingCounterParties,
    isError: isCounterPartyError,
    error: counterPartyError,
    refetch: refetchCounterParties,
  } = useQuery<CounterParty[], Error>({
    queryKey: ["counter-parties"],
    enabled: Boolean(apiBaseUrl),
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      if (!apiBaseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      }

      const response = await fetch(
        `${apiBaseUrl}/api/contract/counter-parties`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = (body as { error?: string }).error;
        throw new Error(message ?? "Failed to load counter parties");
      }

      return (await response.json()) as CounterParty[];
    },
  });

  useEffect(() => {
    if (!counterPartyData) {
      return;
    }

    setCounterParties((prev) => {
      const merged = new Map(prev.map((item) => [item.id, item] as const));
      for (const item of counterPartyData) {
        merged.set(item.id, item);
      }
      return Array.from(merged.values());
    });

    if (!selectedCounterPartyId && counterPartyData.length > 0) {
      setSelectedCounterPartyId(counterPartyData[0].id);
    }
  }, [counterPartyData, selectedCounterPartyId]);

  const createCounterPartyMutation = useMutation<
    CounterParty,
    Error,
    CreateCounterPartyVariables
  >({
    mutationFn: async ({ name }) => {
      if (!apiBaseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      }

      const response = await fetch(
        `${apiBaseUrl}/api/contract/counter-parties`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ name }),
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = (body as { error?: string }).error;
        throw new Error(message ?? "Failed to create counter party");
      }

      return (await response.json()) as CounterParty;
    },
    onSuccess: (counterParty) => {
      setCounterParties((prev) => [...prev, counterParty]);
      setSelectedCounterPartyId(counterParty.id);
      setNewCounterPartyName("");
      setNewCounterPartyError(null);
      refetchCounterParties();
    },
    onError: (error) => {
      setNewCounterPartyError(
        error instanceof Error
          ? error.message
          : "Failed to create counter party.",
      );
    },
  });

  const createContractMutation = useMutation<
    ContractResponse,
    Error,
    CreateContractVariables
  >({
    mutationFn: async ({ name, content, counterPartyId }) => {
      if (!apiBaseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      }

      const response = await fetch(`${apiBaseUrl}/api/contract/mock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          content,
          counterPartyId,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = (body as { error?: string }).error;
        throw new Error(message ?? "Failed to create contract");
      }

      return (await response.json()) as ContractResponse;
    },
    onSuccess: (contract) => {
      router.push(`/contracts/new/${contract.id}`);
    },
    onError: (error, variables) => {
      setStatusMessage({
        context: variables.context,
        text:
          error instanceof Error ? error.message : "Failed to create contract.",
      });
    },
  });

  const handleBack = () => {
    router.back();
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (allowedTypes.includes(file.type)) {
        setUploadedFile(file);
        console.log("File uploaded:", file.name);
      } else {
        alert("Please upload only .pdf or .docx files");
      }
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileUpload(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    handleFileUpload(event.target.files);
  };

  const startDrafting = (
    name: string,
    content: JSONContent,
    context: DraftContext,
    counterPartyId: string | null,
  ) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setStatusMessage({ context, text: "Please enter a contract name." });
      return;
    }

    if (!counterPartyId) {
      setStatusMessage({ context, text: "Please select a counter party." });
      return;
    }

    setStatusMessage(null);
    createContractMutation.mutate({
      name: trimmedName,
      content,
      context,
      counterPartyId,
    });
  };

  const handleBlankStart = () => {
    startDrafting(
      blankContractName,
      EMPTY_DOCUMENT,
      "blank",
      selectedCounterPartyId,
    );
  };

  const handleTemplateStart = () => {
    startDrafting(
      templateContractName,
      TEMPLATE_DOCUMENT,
      "template",
      selectedCounterPartyId,
    );
  };

  const handleNewCounterPartyKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    event.stopPropagation();
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddCounterParty();
    }
  };

  const handleAddCounterParty = () => {
    if (createCounterPartyMutation.isPending) {
      return;
    }

    const trimmed = newCounterPartyName.trim();
    if (!trimmed) {
      setNewCounterPartyError("Please enter a counter party name.");
      return;
    }

    createCounterPartyMutation.mutate({ name: trimmed });
  };

  const renderCounterPartySelect = () => {
    return (
      <div>
        <div className="mb-1 flex items-center gap-2">
          <p className="text-sm font-medium">Counterparty</p>
          {isFetchingCounterParties ? (
            <Badge className="bg-[#E0F2FE] text-xs text-[#0BA5EC]">
              Loading…
            </Badge>
          ) : null}
        </div>
        <Select
          value={selectedCounterPartyId ?? undefined}
          onValueChange={(value) => {
            setSelectedCounterPartyId(value);
            if (statusMessage) {
              setStatusMessage(null);
            }
          }}
          disabled={
            createContractMutation.isPending ||
            !apiBaseUrl ||
            isLoadingCounterParties
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select counterparty" />
          </SelectTrigger>
          <SelectContent>
            {counterParties.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No counter parties yet. Add one below.
              </div>
            ) : (
              counterParties.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))
            )}
            <div
              className="border-t border-gray-200 px-3 py-3"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <p className="mb-2 text-xs font-medium text-gray-500">
                Add counterparty
              </p>
              <Input
                value={newCounterPartyName}
                onChange={(event) => {
                  setNewCounterPartyName(event.target.value);
                  setNewCounterPartyError(null);
                }}
                onKeyDown={handleNewCounterPartyKeyDown}
                placeholder="Counterparty name"
                className="mb-2"
              />
              {newCounterPartyError ? (
                <p className="mb-2 text-xs text-[#F04438]">
                  {newCounterPartyError}
                </p>
              ) : null}
              <Button
                type="button"
                size="sm"
                className="w-full"
                onClick={handleAddCounterParty}
                disabled={createCounterPartyMutation.isPending}
              >
                {createCounterPartyMutation.isPending ? "Adding..." : "Add"}
              </Button>
            </div>
          </SelectContent>
        </Select>
      </div>
    );
  };

  if (!apiBaseUrl) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#F7F7F7] p-8 text-center">
        <p className="text-sm text-[#F04438]">
          NEXT_PUBLIC_API_URL is not configured.
        </p>
        <p className="text-sm text-[#576069]">
          Update your environment configuration and reload the page.
        </p>
      </div>
    );
  }

  if (isCounterPartyError) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-[#F7F7F7] p-8 text-center">
        <p className="text-sm text-[#F04438]">
          {counterPartyError instanceof Error
            ? counterPartyError.message
            : "Failed to load counter parties."}
        </p>
        <Button onClick={() => refetchCounterParties()} variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F7F7F7]">
      <div className="relative flex items-center border-b bg-white px-6 py-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded px-2 py-1 text-sm text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-800"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 transform text-sm font-medium">
          New Contract
        </h1>
      </div>

      <div className="mx-auto max-w-xl p-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as DraftContext);
            setStatusMessage(null);
          }}
          className="w-full"
        >
          <TabsList className="mb-6 grid w-full grid-cols-3 gap-4">
            <TabsTrigger
              value="blank"
              className="flex items-center gap-2 border border-[#E3E7EA] py-4 text-[#7F868E] transition-colors data-[state=active]:border-[#0BA5EC] data-[state=active]:bg-[#E0F2FE] data-[state=active]:text-[#0BA5EC] hover:border-gray-300 hover:bg-gray-50"
            >
              <File className="h-4 w-4" />
              Blank project
            </TabsTrigger>
            <TabsTrigger
              value="template"
              className="flex items-center gap-2 border border-[#E3E7EA] py-4 text-[#7F868E] transition-colors data-[state=active]:border-[#0BA5EC] data-[state=active]:bg-[#E0F2FE] data-[state=active]:text-[#0BA5EC] hover:border-gray-300 hover:bg-gray-50"
            >
              <FileText className="h-4 w-4" />
              Use template
            </TabsTrigger>
            <TabsTrigger
              value="external"
              className="flex items-center gap-2 border border-[#E3E7EA] py-4 text-[#7F868E] transition-colors data-[state=active]:border-[#0BA5EC] data-[state=active]:bg-[#E0F2FE] data-[state=active]:text-[#0BA5EC] hover:border-gray-300 hover:bg-gray-50"
            >
              <UploadIcon className="h-4 w-4" />
              Use an external file
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blank" className="space-y-6">
            {renderCounterPartySelect()}
            <div>
              <p className="text-sm font-medium">Contract Name</p>
              <Input
                placeholder="e.g New Contract - ILCS"
                value={blankContractName}
                onChange={(event) => {
                  setBlankContractName(event.target.value);
                  if (statusMessage?.context === "blank") {
                    setStatusMessage(null);
                  }
                }}
                disabled={createContractMutation.isPending || !apiBaseUrl}
              />
            </div>
            <div className="flex justify-center">
              <Button
                className="w-2/4 cursor-pointer rounded-full bg-[#4EB4E1] hover:bg-[#42A5F5]"
                onClick={handleBlankStart}
                disabled={
                  createContractMutation.isPending ||
                  !apiBaseUrl ||
                  !selectedCounterPartyId
                }
              >
                {createContractMutation.isPending
                  ? "Preparing..."
                  : "Start drafting"}
              </Button>
            </div>
            {statusMessage?.context === "blank" ? (
              <p className="text-center text-xs text-[#F04438]">
                {statusMessage.text}
              </p>
            ) : null}
          </TabsContent>

          <TabsContent value="template" className="space-y-6">
            <div>
              <p className="text-sm font-medium">Choose template</p>
              <Select
                value={templateChoice}
                onValueChange={(value) => {
                  setTemplateChoice(value);
                  if (!templateContractName) {
                    setTemplateContractName("Contract Agreement");
                  }
                  if (statusMessage?.context === "template") {
                    setStatusMessage(null);
                  }
                }}
                disabled={createContractMutation.isPending || !apiBaseUrl}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select playbook template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract-agreement">
                    Contract Agreement
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {renderCounterPartySelect()}
            <div>
              <p className="text-sm font-medium">Contract Name</p>
              <Input
                placeholder="e.g Contract Agreement - Vendor"
                value={templateContractName}
                onChange={(event) => {
                  setTemplateContractName(event.target.value);
                  if (statusMessage?.context === "template") {
                    setStatusMessage(null);
                  }
                }}
                disabled={createContractMutation.isPending || !apiBaseUrl}
              />
            </div>
            <div className="flex justify-center">
              <Button
                className="w-2/3 cursor-pointer bg-[#4EB4E1] hover:bg-[#42A5F5]"
                onClick={handleTemplateStart}
                disabled={
                  createContractMutation.isPending ||
                  !apiBaseUrl ||
                  !selectedCounterPartyId
                }
              >
                {createContractMutation.isPending
                  ? "Preparing..."
                  : "Start drafting"}
              </Button>
            </div>
            {statusMessage?.context === "template" ? (
              <p className="text-center text-xs text-[#F04438]">
                {statusMessage.text}
              </p>
            ) : null}
          </TabsContent>

          <TabsContent value="external" className="space-y-6">
            <div>
              <p className="text-sm font-medium">Start from an external file</p>
              <button
                type="button"
                className={`flex h-32 w-full cursor-pointer items-center justify-center rounded-md border border-dashed transition-colors ${
                  isDragging
                    ? "border-blue-400 bg-blue-50"
                    : uploadedFile
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 bg-gray-50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById("file-upload")?.click()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    document.getElementById("file-upload")?.click();
                  }
                }}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center space-y-2 text-gray-500">
                  <Upload className="h-6 w-6" />
                  {uploadedFile ? (
                    <div className="text-center">
                      <p className="text-sm font-medium text-green-600">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-green-500">
                        File uploaded successfully
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm">Drag and drop files, or browse</p>
                      <p className="text-xs">Allowed files: .docx, .pdf</p>
                    </>
                  )}
                </div>
              </button>
            </div>
            {renderCounterPartySelect()}
            <div>
              <p className="text-sm font-medium">Contract Name</p>
              <Input placeholder="e.g New Contract - ILCS" disabled />
            </div>
            <div className="flex justify-center">
              <Button className="w-2/3 cursor-pointer bg-[#4EB4E1] hover:bg-[#42A5F5]">
                Start drafting
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
