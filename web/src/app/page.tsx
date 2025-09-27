"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FilePlus,
  CloudUpload,
  Signature,
  Upload,
  PenTool,
  Search,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { ContractOverviewChart } from "@/components/dashboard/pie-chart";
import { ContractTrendChart } from "@/components/dashboard/line-chart";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL, []);

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
    ownerName: string | null;
  };

  const { data, isLoading, isError } = useQuery<ContractListItem[], Error>({
    queryKey: ["contracts", "dashboard-cards"],
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
        throw new Error(message ?? "Failed to load contracts");
      }

      return (await response.json()) as ContractListItem[];
    },
    staleTime: 1000 * 30,
  });

  const isInSeptember = (value: string | null) => {
    if (!value) {
      return false;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return false;
    }

    return parsed.getMonth() === 8; // September
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

  const formatDateTime = (value: string | null) => {
    if (!value) {
      return "-";
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(parsed);
  };

  const contractsInSeptember = useMemo(() => {
    if (!data) {
      return [] as ContractListItem[];
    }

    return data.filter((contract) => isInSeptember(contract.createdAt));
  }, [data]);

  const { activeCount, negotiatingCount, nearDueCount } = useMemo(() => {
    return contractsInSeptember.reduce(
      (acc, contract) => {
        if (contract.status === "Negotiating") {
          acc.negotiatingCount += 1;
        }

        if (contract.status === "Active") {
          if (isWithinNextWeek(contract.initialEndDate)) {
            acc.nearDueCount += 1;
          } else {
            acc.activeCount += 1;
          }
        }

        return acc;
      },
      {
        activeCount: 0,
        negotiatingCount: 0,
        nearDueCount: 0,
      },
    );
  }, [contractsInSeptember]);

  const activities = useMemo(() => {
    return contractsInSeptember
      .filter((contract) => contract.createdAt)
      .sort((a, b) => {
        const aTime = new Date(a.createdAt ?? 0).getTime();
        const bTime = new Date(b.createdAt ?? 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 4)
      .map((contract) => ({
        id: contract.id,
        message: `${contract.ownerName ?? "Someone"} created ${contract.name}`,
        time: formatDateTime(contract.createdAt),
      }));
  }, [contractsInSeptember]);

  const formatStatValue = (value: number) => {
    if (isLoading) {
      return "...";
    }
    if (isError) {
      return "-";
    }
    return value.toString();
  };

  const statsData = [
    {
      title: "Total Contract Value",
      value: "Rp80.000.000.000",
      textColor: "text-[#175CD3]",
      backgroundColor: "bg-[#E0F2FE]",
      borderColor: "border-[#53B1FD]",
    },
    {
      title: "Active Contract",
      value: formatStatValue(activeCount),
      textColor: "text-gray-500",
      backgroundColor: "bg-white",
      borderColor: "border-gray-200",
    },
    {
      title: "Contract in Negotiation",
      value: formatStatValue(negotiatingCount),
      textColor: "text-gray-500",
      backgroundColor: "bg-white",
      borderColor: "border-gray-200",
    },
    {
      title: "Near Due Date",
      value: formatStatValue(nearDueCount),
      textColor: "text-[#F04438]",
      backgroundColor: "bg-[#FFFBFA]",
      borderColor: "border-red-300",
    },
  ];

  return (
    <div className="w-full p-6 space-y-6 bg-[#F8FAFC]">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search something"
            className="pl-12 h-12 rounded-full text-base w-full"
          />
        </div>
        <Button
          className="bg-black text-white flex items-center gap-2 rounded-full px-4 cursor-pointer"
          onClick={() => router.push("/manta")}
        >
          Chat with Manta
          <Image
            src="/logo.svg"
            alt="Manta AI"
            width={16}
            height={16}
            className="w-6 h-6"
          />
        </Button>
      </div>

      <div className="flex gap-6">
        <div className="space-y-6 flex-1">
          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 h-14 rounded-lg !bg-white !text-[#1E609E] hover:!bg-gray-50 border shadow cursor-pointer text-base"
              onClick={() => router.push("/contracts/new")}
            >
              <FilePlus className="w-5 h-5 mr-2" /> Create New Contract
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-14 rounded-lg !bg-white !text-[#1E609E] hover:!bg-gray-50 border shadow cursor-pointer text-base"
            >
              <CloudUpload className="w-5 h-5 mr-2" /> Store a Signed Document
            </Button>
          </div>

          {/* Middle Section */}
          <div className="w-full">
            {/* Left Big Card */}
            <Card className="bg-[#1E609E] text-white rounded-xl py-0 pr-15">
              <div className="flex">
                {/* Left Content */}
                <div className="flex flex-col p-8 bg-[url('/logoBackground.svg')] bg-contain bg-center bg-no-repeat">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-2xl">
                      Negotiate faster with AI
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="mb-6 text-sm leading-relaxed">
                      Let Manta, our AI assistant, flag changes to make
                      recommendations on your ongoing contract.
                    </p>
                    <div className="flex gap-3">
                      <Button className="bg-black text-white px-6 py-3 cursor-pointer">
                        Review Contract
                      </Button>
                      <Button
                        variant="secondary"
                        className="bg-white text-black px-6 py-3 cursor-pointer"
                      >
                        Ask Manta
                      </Button>
                    </div>
                  </CardContent>
                </div>

                {/* Right Image - positioned at bottom */}
                <div className="flex-shrink-0 w-80 relative flex items-end">
                  <Image
                    src="/mantaRecommend.svg"
                    alt="Manta AI Assistant"
                    width={320}
                    height={320}
                    className="w-80 h-52 object-contain object-bottom"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            <ContractOverviewChart />
            <ContractTrendChart />
          </div>

          {/* Latest Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Latest activities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {isLoading ? (
                  <li className="text-sm text-muted-foreground">
                    Loading activities...
                  </li>
                ) : isError ? (
                  <li className="text-sm text-destructive">
                    Failed to load activities.
                  </li>
                ) : activities.length === 0 ? (
                  <li className="text-sm text-muted-foreground">
                    No contract activity recorded in September.
                  </li>
                ) : (
                  activities.map((activity) => (
                    <li
                      key={activity.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#53B1FD] rounded-full flex items-center justify-center">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <span>{activity.message}</span>
                      </div>
                      <span className="text-gray-400">{activity.time}</span>
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-col gap-4 w-64">
          {statsData.map((stat, index) => (
            <Card
              key={index}
              className={`rounded-xl py-3 ${stat.backgroundColor} border ${stat.borderColor}`}
            >
              <CardContent className="p-4">
                <p className={`text-sm ${stat.textColor}`}>{stat.title}</p>
                <p
                  className={`text-xl font-bold ${stat.textColor === "text-gray-500" ? "text-black" : stat.textColor}`}
                >
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
