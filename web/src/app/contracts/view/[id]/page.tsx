"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/core";
import {
  ArrowLeft,
  BadgeCheck,
  ChevronDown,
  Eye,
  History,
  Lightbulb,
  Workflow,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Signature } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SimpleViewer } from "@/components/tiptap-templates/simple/simple-viewer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ContractResponse {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  signageDate: string | null;
  type: string;
  startedAt: string | null;
  initialEndDate: string | null;
  counterPartyId: string;
  counterPartyName: string | null;
  ownerId: string;
  ownerName: string | null;
  ownerImage: string | null;
  content: JSONContent | null;
}

const EMPTY_DOCUMENT: JSONContent = { type: "doc", content: [] };

const cloneContent = (value: JSONContent): JSONContent =>
  JSON.parse(JSON.stringify(value)) as JSONContent;

const normalizeContent = (
  value: JSONContent | null | undefined,
): JSONContent => {
  if (!value) {
    return cloneContent(EMPTY_DOCUMENT);
  }

  return cloneContent(value);
};

const ViewContractPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const contractId = useMemo(() => {
    const rawId = params?.id;
    if (!rawId) {
      return undefined;
    }

    return Array.isArray(rawId) ? rawId[0] : rawId;
  }, [params?.id]);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const isApiConfigured = Boolean(apiBaseUrl);

  const [initialContent, setInitialContent] = useState<JSONContent | null>(
    null,
  );

  const {
    data: contract,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ContractResponse, Error>({
    queryKey: ["contract", contractId],
    enabled: Boolean(contractId) && isApiConfigured,
    queryFn: async () => {
      if (!apiBaseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      }

      if (!contractId) {
        throw new Error("Contract ID is missing.");
      }

      const response = await fetch(`${apiBaseUrl}/api/contract/${contractId}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = (body as { error?: string }).error;
        throw new Error(message ?? "Failed to load contract");
      }

      return (await response.json()) as ContractResponse;
    },
    staleTime: 1000 * 30,
    retry: false,
  });

  const updateStatusMutation = useMutation<
    ContractResponse,
    Error,
    { nextStatus: string; successMessage: string }
  >({
    mutationFn: async ({ nextStatus }) => {
      if (!apiBaseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      }

      if (!contractId) {
        throw new Error("Contract ID is missing.");
      }

      const response = await fetch(
        `${apiBaseUrl}/api/contract/${contractId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: nextStatus }),
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = (body as { error?: string }).error;
        throw new Error(message ?? "Failed to update contract status");
      }

      return (await response.json()) as ContractResponse;
    },
    onSuccess: (updatedContract, variables) => {
      queryClient.setQueryData(["contract", contractId], updatedContract);
      queryClient
        .invalidateQueries({ queryKey: ["contracts"] })
        .catch(() => {});
      queryClient
        .invalidateQueries({ queryKey: ["repository"] })
        .catch(() => {});
      queryClient
        .invalidateQueries({ queryKey: ["contracts", "inbox"] })
        .catch(() => {});
      queryClient
        .invalidateQueries({ queryKey: ["contracts", "overview"] })
        .catch(() => {});
      queryClient
        .invalidateQueries({ queryKey: ["contracts", "dashboard-cards"] })
        .catch(() => {});
      toast.success(variables.successMessage);
    },
    onError: (mutationError) => {
      const message =
        mutationError.message || "Failed to update contract status";
      toast.error(message);
    },
  });

  const currentStatus = contract?.status;

  const handleMoveToReview = useCallback(() => {
    if (currentStatus !== "Draft") {
      toast.error("Send to workflow review is only available from draft.");
      return;
    }

    updateStatusMutation.mutate({
      nextStatus: "On Review",
      successMessage: "Contract sent for internal review",
    });
  }, [currentStatus, updateStatusMutation]);

  const handleSendToCounterpartyReview = useCallback(() => {
    if (currentStatus !== "On Review") {
      toast.error("Send to counterparty review after internal review.");
      return;
    }

    updateStatusMutation.mutate({
      nextStatus: "Negotiating",
      successMessage: "Contract sent to counterparty for review",
    });
  }, [currentStatus, updateStatusMutation]);

  const handleRequestSignature = useCallback(() => {
    if (currentStatus !== "Negotiating") {
      toast.error("Request signature after counterparty review.");
      return;
    }

    updateStatusMutation.mutate({
      nextStatus: "Signing",
      successMessage: "Signature requested",
    });
  }, [currentStatus, updateStatusMutation]);

  useEffect(() => {
    if (!contract) {
      return;
    }

    const content = normalizeContent(contract.content);
    setInitialContent(content);
  }, [contract]);

  const handleGoBack = () => {
    router.back();
  };

  if (!isApiConfigured) {
    return (
      <div className="flex h-full min-h-screen flex-col items-center justify-center gap-2">
        <p className="text-sm text-red-500">
          NEXT_PUBLIC_API_URL is not configured.
        </p>
        <p className="text-sm text-muted-foreground">
          Update your environment configuration and reload the page.
        </p>
      </div>
    );
  }

  if (!contractId) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Contract ID is missing.</p>
      </div>
    );
  }

  if (isLoading || !initialContent) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading contract...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-500">
          {error instanceof Error ? error.message : "Failed to load contract."}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-[#E3E7EA] pb-2.5 p-4">
        <button
          type="button"
          onClick={handleGoBack}
          className="flex items-center gap-2 text-sm text-[#576069] transition hover:text-black cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <h1 className="text-sm font-medium">{contract?.name ?? "Contract"}</h1>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="bg-white border border-[#D0D3D7] text-[#192632] cursor-pointer hover:bg-[#F7F7F7]"
                disabled={updateStatusMutation.isPending}
              >
                Send to Counterparty
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer border-b border-gray-100"
                onSelect={(event) => {
                  if (updateStatusMutation.isPending) {
                    event.preventDefault();
                    return;
                  }

                  if (currentStatus !== "On Review") {
                    event.preventDefault();
                    toast.error(
                      "Send to counterparty review after internal review.",
                    );
                    return;
                  }

                  handleSendToCounterpartyReview();
                }}
                disabled={updateStatusMutation.isPending}
              >
                <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-md bg-[#D1E9FF]">
                  <Eye className="h-4 w-4 text-[#2E90FA]" />
                </div>
                <span>Send to Review</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(event) => {
                  if (updateStatusMutation.isPending) {
                    event.preventDefault();
                    return;
                  }

                  if (currentStatus !== "Negotiating") {
                    event.preventDefault();
                    toast.error("Request signature after counterparty review.");
                    return;
                  }

                  handleRequestSignature();
                }}
                disabled={updateStatusMutation.isPending}
              >
                <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-md bg-[#EBE9FE]">
                  <Signature className="h-4 w-4 text-[#7A5AF8]" />
                </div>
                <span>Request for Signature</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto bg-[#F7F7F7]">
        <div className="w-[648px] mx-auto mt-8 bg-white px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Drafting Document</h1>
            <div className="flex items-center gap-2 text-[#939A9F]">
              <History className="h-4 w-4" />
              <span>10/10/2025</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              className="border border-[#D0D3D7] bg-white text-[#192632] cursor-pointer hover:bg-[#F7F7F7]"
              onClick={() => router.push(`/contracts/review/${contractId}`)}
            >
              <Eye className="h-5 w-5" />
              <span className="text-sm font-semibold">Review</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="bg-[#1E609E] hover:bg-[#1A5490] text-white cursor-pointer flex items-center gap-2.5"
                  disabled={updateStatusMutation.isPending}
                >
                  <Workflow className="h-4 w-4" />
                  Start Workflow
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="border-b border-gray-100 cursor-pointer"
                  onSelect={(event) => {
                    if (updateStatusMutation.isPending) {
                      event.preventDefault();
                      return;
                    }

                    if (currentStatus !== "Draft") {
                      event.preventDefault();
                      toast.error(
                        "Send to workflow review is only available from draft.",
                      );
                      return;
                    }

                    handleMoveToReview();
                  }}
                >
                  <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-md bg-[#D1E9FF]">
                    <Eye className="h-4 w-4 text-[#2E90FA]" />
                  </div>
                  {updateStatusMutation.isPending ? "Moving..." : "For Review"}
                </DropdownMenuItem>
                <DropdownMenuItem className="border-b border-gray-100 cursor-pointer">
                  <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-md bg-[#ECFDF3]">
                    <BadgeCheck className="h-4 w-4 text-[#12B76A]" />
                  </div>
                  For Approval
                </DropdownMenuItem>
                <DropdownMenuItem className="border-b border-gray-100 cursor-pointer">
                  <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-md bg-[#EBE9FE]">
                    <Signature className="h-4 w-4 text-[#7A5AF8]" />
                  </div>
                  For Signage
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-md bg-[#FEF0C7]">
                    <Lightbulb className="h-4 w-4 text-[#F79009]" />
                  </div>
                  For Acknowledge
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <SimpleViewer content={initialContent} />
      </main>
    </div>
  );
};

export default ViewContractPage;
