"use client";

import { useMutation } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/core";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type ContractResponse = {
  id: string;
  name: string;
  content: JSONContent | null;
};

const EMPTY_DOCUMENT: JSONContent = { type: "doc", content: [] };

const NewContractPage = () => {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const [configError, setConfigError] = useState<string | null>(null);
  const hasTriggered = useRef(false);

  const createContractMutation = useMutation<ContractResponse>({
    mutationFn: async () => {
      if (!apiBaseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      }

      const response = await fetch(`${apiBaseUrl}/api/contract/mock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content: EMPTY_DOCUMENT }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = (body as { error?: string }).error;
        throw new Error(message ?? "Failed to create contract");
      }

      return (await response.json()) as ContractResponse;
    },
    onSuccess: (contract) => {
      router.replace(`/contracts/new/${contract.id}`);
    },
  });

  useEffect(() => {
    if (!apiBaseUrl) {
      setConfigError("NEXT_PUBLIC_API_URL is not configured.");
      return;
    }

    if (hasTriggered.current) {
      return;
    }

    hasTriggered.current = true;
    createContractMutation.mutate();
  }, [apiBaseUrl, createContractMutation]);

  const handleRetry = () => {
    if (!apiBaseUrl) {
      setConfigError("NEXT_PUBLIC_API_URL is not configured.");
      return;
    }

    createContractMutation.reset();
    createContractMutation.mutate();
  };

  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center gap-4">
      {configError ? (
        <>
          <p className="text-sm text-red-500">{configError}</p>
          <p className="text-sm text-muted-foreground">
            Please set the environment variable and reload the page.
          </p>
        </>
      ) : createContractMutation.isError ? (
        <>
          <p className="text-sm text-red-500">
            {createContractMutation.error instanceof Error
              ? createContractMutation.error.message
              : "Failed to create contract."}
          </p>
          <Button onClick={handleRetry} variant="outline">
            Try again
          </Button>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Preparing your new contract...
        </p>
      )}
    </div>
  );
};

export default NewContractPage;
