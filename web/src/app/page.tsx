"use client";

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
      value: "8",
      textColor: "text-gray-500",
      backgroundColor: "bg-white",
      borderColor: "border-gray-200",
    },
    {
      title: "Contract in Negotiation",
      value: "80",
      textColor: "text-gray-500",
      backgroundColor: "bg-white",
      borderColor: "border-gray-200",
    },
    {
      title: "Near Due Date",
      value: "80",
      textColor: "text-[#F04438]",
      backgroundColor: "bg-[#FFFBFA]",
      borderColor: "border-red-300",
    },
  ];

  const activitiesData = [
    {
      id: 1,
      message: "Yusril assigning you to a new contract",
      time: "13:42 21/09/2025",
      iconBg: "bg-[#4E5BA6]",
      icon: FileText,
    },
    {
      id: 2,
      message: "A document has been signed",
      time: "10:12 21/09/2025",
      iconBg: "bg-[#12B76A]",
      icon: FileText,
    },
    {
      id: 3,
      message: "Satriadihikara approved Contract-1",
      time: "10:12 21/09/2025",
      iconBg: "bg-[#53B1FD]",
      icon: FileText,
    },
    {
      id: 4,
      message: "Farrel updating a document",
      time: "09:12 21/09/2025",
      iconBg: "bg-[#FDB022]",
      icon: FileText,
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
        <Button className="bg-black text-white flex items-center gap-2 rounded-full px-4 cursor-pointer">
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
                {activitiesData.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <li
                      key={activity.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center`}
                        >
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <span>{activity.message}</span>
                      </div>
                      <span className="text-gray-400">{activity.time}</span>
                    </li>
                  );
                })}
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
