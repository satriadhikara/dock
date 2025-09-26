// app/new-contract/page.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  ArrowLeft,
  FileText,
  File,
  Upload as UploadIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewContractPage() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  return (
    <div className="min-h-screen w-full bg-[#F7F7F7]">
      {/* Header */}
      <div className="flex items-center border-b bg-white px-6 py-3 relative">
        <button
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
        <Tabs defaultValue="blank" className="w-full">
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
              <label className="text-sm font-medium">Counterparty</label>
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
              <label className="text-sm font-medium">Contract Name</label>
              <Input placeholder="e.g New Contract - ILCS" />
            </div>
            <div className="flex justify-center">
              <Button className="w-2/4 bg-[#4EB4E1] rounded-full hover:bg-[#42A5F5] cursor-pointer">
                Start drafting
              </Button>
            </div>
          </TabsContent>

          {/* Use template */}
          <TabsContent value="template" className="space-y-6">
            <div>
              <label className="text-sm font-medium">Choose template</label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select playbook template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service Agreement</SelectItem>
                  <SelectItem value="nda">Non-Disclosure Agreement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Counterparty</label>
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
              <label className="text-sm font-medium">Contract Name</label>
              <Input placeholder="e.g New Contract - ILCS" />
            </div>
            <div className="flex justify-center">
              <Button className="w-2/3 bg-[#4EB4E1] hover:bg-[#42A5F5] cursor-pointer">
                Start drafting
              </Button>
            </div>
          </TabsContent>

          {/* External file */}
          <TabsContent value="external" className="space-y-6">
            <div>
              <label className="text-sm font-medium">
                Start from an external file
              </label>
              <div
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
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Counterparty</label>
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
              <label className="text-sm font-medium">Contract Name</label>
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
