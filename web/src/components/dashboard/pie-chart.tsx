"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

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
  initialEndDate: string | null;
};

type ChartSlice = {
  name: string;
  value: number;
  fill: string;
};

const chartConfig = {
  value: {
    label: "Contracts",
  },
  active: {
    label: "Active",
    color: "#4EB4E1",
  },
  onprogress: {
    label: "On-progress",
    color: "#A1A1AA",
  },
  neardue: {
    label: "Near Due",
    color: "#F97316",
  },
} satisfies ChartConfig;

const ON_PROGRESS_STATUSES: BackendContractStatus[] = [
  "Draft",
  "On Review",
  "Negotiating",
  "Signing",
];

const isInSeptember = (value: string | null) => {
  if (!value) {
    return false;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return parsed.getMonth() === 8; // September (0-indexed)
};

const isWithinNextWeek = (value: string | null) => {
  if (!value) {
    return false;
  }

  const dueDate = new Date(value);
  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays >= 0 && diffDays <= 7;
};

export function ContractOverviewChart() {
  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL, []);

  const { data, isLoading, isError, error } = useQuery<
    ContractListItem[],
    Error
  >({
    queryKey: ["contracts", "overview"],
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
        throw new Error(message ?? "Failed to load contract overview");
      }

      return (await response.json()) as ContractListItem[];
    },
    staleTime: 1000 * 30,
  });

  const chartData = useMemo<ChartSlice[]>(() => {
    if (!data) {
      return [
        { name: "Active", value: 0, fill: "#4EB4E1" },
        { name: "On-progress", value: 0, fill: "#A1A1AA" },
        { name: "Near Due", value: 0, fill: "#F97316" },
      ];
    }

    let onProgress = 0;
    let active = 0;
    let nearDue = 0;

    const contractsInSeptember = data.filter((contract) =>
      isInSeptember(contract.createdAt),
    );

    contractsInSeptember.forEach((contract) => {
      if (ON_PROGRESS_STATUSES.includes(contract.status)) {
        onProgress += 1;
        return;
      }

      if (contract.status === "Active") {
        if (isWithinNextWeek(contract.initialEndDate)) {
          nearDue += 1;
        } else {
          active += 1;
        }
        return;
      }
    });

    return [
      { name: "Active", value: active, fill: "#4EB4E1" },
      { name: "On-progress", value: onProgress, fill: "#A1A1AA" },
      { name: "Near Due", value: nearDue, fill: "#F97316" },
    ];
  }, [data]);

  const totalContracts = chartData.reduce((acc, slice) => acc + slice.value, 0);

  return (
    <Card className="h-96">
      <CardHeader className="flex flex-row justify-between items-center pb-2">
        <div className="flex flex-col">
          <CardTitle>Contract Overview</CardTitle>
          <span className="text-sm text-muted-foreground">
            September snapshot · {totalContracts} contract
            {totalContracts === 1 ? "" : "s"}
          </span>
        </div>
        <select className="text-sm border rounded px-2 py-1" disabled>
          <option>September</option>
        </select>
      </CardHeader>
      <CardContent className="h-72 p-0">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading chart...
          </div>
        ) : isError ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm">
            <span className="text-destructive">
              {error instanceof Error ? error.message : "Failed to load chart"}
            </span>
            <span className="text-muted-foreground">
              Please refresh the page to try again.
            </span>
          </div>
        ) : totalContracts === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <span>No September contracts yet.</span>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="w-full h-full max-h-[280px]"
          >
            <PieChart width={400} height={280}>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="40%"
                cy="50%"
                outerRadius={70}
                innerRadius={0}
                label={({ name, value }) =>
                  value > 0 ? `${name}: ${value}` : ""
                }
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{
                  fontSize: "12px",
                  paddingLeft: "20px",
                }}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
