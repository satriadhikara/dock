// app/new-contract/page.tsx
"use client";

import { useMutation } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/core";
import {
  ArrowLeft,
  File,
  FileText,
  Upload,
  Upload as UploadIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import templateDocument from "@/components/tiptap-templates/simple/data/content.json";
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

type ContractResponse = {
  id: string;
  name: string;
  content: JSONContent | null;
};

const EMPTY_DOCUMENT: JSONContent = { type: "doc", content: [] };
const TEMPLATE_DOCUMENT = templateDocument as JSONContent;

type StatusMessage = { context: "blank" | "template"; text: string } | null;

type DraftContext = "blank" | "template";

type CreateContractVariables = {
  name: string;
  content: JSONContent;
  context: DraftContext;
};

export default function NewContractPage() {
  const router = useRouter();
  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL, []);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<DraftContext>("blank");
  const [blankContractName, setBlankContractName] = useState("");
  const [templateChoice, setTemplateChoice] = useState("contract-agreement");
  const [templateContractName, setTemplateContractName] =
    useState("Contract Agreement");
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(null);

  const createContractMutation = useMutation<
    ContractResponse,
    Error,
    CreateContractVariables
  >({
    mutationFn: async ({ name, content }) => {
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
  };

  const startDrafting = (
    name: string,
    content: JSONContent,
    context: DraftContext,
  ) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setStatusMessage({ context, text: "Please enter a contract name." });
      return;
    }

    setStatusMessage(null);
    createContractMutation.mutate({ name: trimmedName, content, context });
  };

  const handleBlankStart = () => {
    startDrafting(blankContractName, EMPTY_DOCUMENT, "blank");
  };

  const handleTemplateStart = () => {
    startDrafting(templateContractName, TEMPLATE_DOCUMENT, "template");
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F7F7]">
      {/* Header */}
      <div className="flex items-center border-b bg-white px-6 py-3 relative">
        <button
          type="button"
          className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded transition-colors duration-200 flex items-center"
          onClick={handleBack}
        >
          <ArrowLeft className="inline-block mr-1 w-4 h-4" />
          Back
        </button>
        <h1 className="text-sm font-medium absolute left-1/2 transform -translate-x-1/2">
          New Contract
        </h1>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-xl p-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as DraftContext);
            setStatusMessage(null);
          }}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full mb-6 gap-4">
            <TabsTrigger
              value="blank"
              className="flex items-center gap-2 py-4 text-[#7F868E] border border-[#E3E7EA] data-[state=active]:bg-[#E0F2FE] data-[state=active]:border data-[state=active]:border-[#0BA5EC] data-[state=active]:text-[#0BA5EC] cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <File className="w-4 h-4" />
              Blank project
            </TabsTrigger>
            <TabsTrigger
              value="template"
              className="flex items-center gap-2 py-4 text-[#7F868E] border border-[#E3E7EA] data-[state=active]:bg-[#E0F2FE] data-[state=active]:border data-[state=active]:border-[#0BA5EC] data-[state=active]:text-[#0BA5EC] cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Use template
            </TabsTrigger>
            <TabsTrigger
              value="external"
              className="flex items-center gap-2 py-4 text-[#7F868E] border border-[#E3E7EA] data-[state=active]:bg-[#E0F2FE] data-[state=active]:border data-[state=active]:border-[#0BA5EC] data-[state=active]:text-[#0BA5EC] cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <UploadIcon className="w-4 h-4" />
              Use an external file
            </TabsTrigger>
          </TabsList>

          {/* Blank project */}
          <TabsContent value="blank" className="space-y-6">
            <div>
              <p className="text-sm font-medium">Counterparty</p>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select counterparty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ptxyz">PT XYZ</SelectItem>
                  <SelectItem value="pelindo">Pelindo</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                className="w-2/4 bg-[#4EB4E1] rounded-full hover:bg-[#42A5F5] cursor-pointer"
                onClick={handleBlankStart}
                disabled={createContractMutation.isPending || !apiBaseUrl}
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
            {!apiBaseUrl ? (
              <p className="text-center text-xs text-[#F79009]">
                Configure NEXT_PUBLIC_API_URL to start drafting.
              </p>
            ) : null}
          </TabsContent>

          {/* Use template */}
          <TabsContent value="template" className="space-y-6">
            <div>
              <p className="text-sm font-medium">Choose template</p>
              <Select
                value={templateChoice}
                onValueChange={(value) => {
                  setTemplateChoice(value);
                  if (statusMessage?.context === "template") {
                    setStatusMessage(null);
                  }
                }}
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
            <div>
              <p className="text-sm font-medium">Counterparty</p>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select counterparty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ptxyz">PT XYZ</SelectItem>
                  <SelectItem value="pelindo">Pelindo</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                className="w-2/3 bg-[#4EB4E1] hover:bg-[#42A5F5] cursor-pointer"
                onClick={handleTemplateStart}
                disabled={createContractMutation.isPending || !apiBaseUrl}
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

          {/* External file */}
          <TabsContent value="external" className="space-y-6">
            <div>
              <p className="text-sm font-medium">Start from an external file</p>
              <button
                type="button"
                className={`flex h-32 w-full items-center justify-center rounded-md border border-dashed cursor-pointer transition-colors ${
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
                      <p className="text-sm">Drag and Drop files, or browse</p>
                      <p className="text-xs">Allowed files: .docx, .pdf</p>
                    </>
                  )}
                </div>
              </button>
            </div>
            <div>
              <p className="text-sm font-medium">Counterparty</p>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select counterparty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ptxyz">PT XYZ</SelectItem>
                  <SelectItem value="pelindo">Pelindo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm font-medium">Contract Name</p>
              <Input placeholder="e.g New Contract - ILCS" />
            </div>
            <div className="flex justify-center">
              <Button className="w-2/3 bg-[#4EB4E1] hover:bg-[#42A5F5] cursor-pointer">
                Start drafting
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
