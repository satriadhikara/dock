"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  RefreshCcw,
  Search,
  Eye,
  Signature,
  BadgeCheck,
  Lightbulb,
  CircleArrowOutUpRight,
} from "lucide-react";

const tasks = [
  {
    id: "review",
    title: "Document to review",
    icon: Eye,
    items: [
      {
        name: "Contract-3",
        counterparty: "Pelindo",
        requester: { name: "Gracya Sidabutar", initial: "G" },
        date: "26/09/2025",
      },
    ],
  },
  {
    id: "sign",
    title: "Document to sign",
    icon: Signature,
    items: [
      {
        name: "Contract-2",
        counterparty: "PT XYZ",
        requester: { name: "Gracya Sidabutar", initial: "G" },
        date: "26/09/2025",
      },
    ],
  },
  {
    id: "approve",
    title: "Document to approve",
    icon: BadgeCheck,
    items: [
      {
        name: "Contract-2",
        counterparty: "PT XYZ",
        requester: { name: "Yusril Mahendra", initial: "Y" },
        date: "26/09/2025",
      },
      {
        name: "Contract-2",
        counterparty: "PT XYZ",
        requester: { name: "Gracya Sidabutar", initial: "G" },
        date: "26/09/2025",
      },
    ],
  },
  {
    id: "acknowledge",
    title: "Document to acknowledge",
    icon: Lightbulb,
    items: [
      {
        name: "Contract-2",
        counterparty: "PT XYZ",
        requester: { name: "Yusril Mahendra", initial: "Y" },
        date: "26/09/2025",
      },
      {
        name: "Contract-2",
        counterparty: "PT XYZ",
        requester: { name: "Gracya Sidabutar", initial: "G" },
        date: "26/09/2025",
      },
    ],
  },
];

export default function InboxPage() {
  return (
    <div className="w-full p-6 space-y-4 bg-[#F8FAFC]">
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
        <Link href="/manta">
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
        </Link>
      </div>
      <Accordion type="single" collapsible className="space-y-4">
        {tasks.map((task) => (
          <AccordionItem
            key={task.id}
            value={task.id}
            className="rounded-lg border bg-white shadow-sm"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <task.icon className="w-5 h-5" />
                <span className="font-medium">
                  {task.title} ({task.items.length})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-[#202224] text-left text-[12px]">
                    <tr>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Counterparty</th>
                      <th className="px-4 py-2">Requester</th>
                      <th className="px-4 py-2">Request date</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {task.items.map((doc, i) => (
                      <tr
                        key={i}
                        className="font-semibold hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          // Handle row click - you can add navigation or modal logic here
                          console.log(`Clicked on ${doc.name}`);
                        }}
                      >
                        <td className="px-4 py-2 text-[14px]">{doc.name}</td>
                        <td className="px-4 py-2 text-[14px]">
                          {doc.counterparty}
                        </td>
                        <td className="px-4 py-2 flex items-center gap-2 text-[14px]">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {doc.requester.initial}
                            </AvatarFallback>
                          </Avatar>
                          {doc.requester.name}
                        </td>
                        <td className="px-4 py-2 text-[14px]">{doc.date}</td>
                        <td className="px-4 py-2 text-gray-400">
                          <CircleArrowOutUpRight className="h-4 w-4" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
