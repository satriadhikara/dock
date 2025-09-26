"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/core";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { Button } from "@/components/ui/button";

type ContractResponse = {
  id: string;
  name: string;
  content: JSONContent | null;
};

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

const NewContractPage = () => {
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
  const [editorContent, setEditorContent] =
    useState<JSONContent>(EMPTY_DOCUMENT);

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

  useEffect(() => {
    if (!contract) {
      return;
    }

    const content = normalizeContent(contract.content);
    setInitialContent(content);
    setEditorContent(content);
  }, [contract]);

  const updateContractMutation = useMutation<
    ContractResponse,
    Error,
    JSONContent
  >({
    mutationFn: async (content) => {
      if (!apiBaseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      }

      if (!contractId) {
        throw new Error("Contract ID is missing.");
      }

      const response = await fetch(
        `${apiBaseUrl}/api/contract/${contractId}/content`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ content }),
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = (body as { error?: string }).error;
        throw new Error(message ?? "Failed to save contract");
      }

      return (await response.json()) as ContractResponse;
    },
    onSuccess: (updatedContract) => {
      queryClient.setQueryData(["contract", contractId], updatedContract);

      const content = normalizeContent(updatedContract.content);
      setInitialContent(content);
      setEditorContent(content);
    },
  });

  const handleSave = useCallback(() => {
    if (!contractId) {
      return;
    }

    updateContractMutation.mutate(editorContent);
  }, [contractId, editorContent, updateContractMutation]);

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

        <h1 className="text-sm font-medium">
          {contract?.name ?? "New Contract"}
        </h1>

        <div className="flex items-center gap-3">
          {updateContractMutation.isError ? (
            <span className="text-sm text-red-500">
              Failed to save. Try again.
            </span>
          ) : null}
          <Button
            onClick={handleSave}
            disabled={updateContractMutation.isPending}
            className="flex items-center gap-2 bg-white border border-[#E3E7EA]"
          >
            {updateContractMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" color="#000" />
            ) : (
              <Save className="h-4 w-4" color="#000" />
            )}
            <span className="text-black">
              {updateContractMutation.isPending ? "Saving..." : "Save"}
            </span>
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <SimpleEditor content={initialContent} onChange={setEditorContent} />
      </main>
    </div>
  );
};

export default NewContractPage;
