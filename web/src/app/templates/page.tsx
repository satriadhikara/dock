"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, CirclePlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const templates = [
  {
    icon: "/templates/serviceAgreement.svg",
    title: "Service Agreement",
    desc: "Standard contract to define services and payments.",
  },
  {
    icon: "/templates/masterServiceAgreement.svg",
    title: "Master Service Agreement",
    desc: "Long-term framework with flexible add-ons.",
  },
  {
    icon: "/templates/NDA.svg",
    title: "Non-Disclosure Agreement",
    desc: "Long-term framework with flexible add-ons.",
  },
  {
    icon: "/templates/DPA.svg",
    title: "Data Processing Agreement",
    desc: "Long-term framework with flexible add-ons.",
  },
  {
    icon: "/templates/VSA.svg",
    title: "Vendor Service Agreement",
    desc: "Vendor obligations, deliverables, and compliance.",
  },
  {
    icon: "/templates/LOI.svg",
    title: "Letter of Intent",
    desc: "Long-term framework with flexible add-ons.",
  },
  {
    icon: "/templates/MOU.svg",
    title: "Memorandum of Understanding",
    desc: "Long-term framework with flexible add-ons.",
  },
];

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  // Filter templates based on search term
  const filteredTemplates = templates.filter(
    (template) =>
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.desc.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full p-6 space-y-6 bg-[#F8FAFC]">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search templates..."
            className="pl-12 h-12 rounded-full text-base w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link href="/manta">
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
        </Link>
      </div>

      {/* Search and New Button */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <h1 className="text-2xl font-semibold text-gray-900">Templates</h1>
        </div>
        <Button className="rounded-lg flex items-center gap-2 bg-white hover:bg-gray-200 border border-gray-300 text-gray-900 px-8 py-4 text-base font-medium h-12 cursor-pointer">
          <CirclePlus className="w-5 h-5" /> New Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No templates found</div>
            <div className="text-gray-500 text-sm">
              {searchTerm
                ? `No templates match "${searchTerm}"`
                : "No templates available"}
            </div>
          </div>
        ) : (
          filteredTemplates.map((tpl, i) => (
            <div
              key={i}
              className="bg-white rounded-xl flex flex-col items-center text-center p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105"
            >
              {/* Icon Container */}
              <div className="w-16 h-16 mb-4 flex items-center justify-center bg-gray-50 rounded-lg">
                <Image
                  src={tpl.icon}
                  alt={`${tpl.title} icon`}
                  width={40}
                  height={40}
                  className="w-20 h-20 object-contain"
                />
              </div>

              {/* Content */}
              <h3 className="font-semibold text-lg text-black mb-2">
                {tpl.title}
              </h3>
              <p className="text-sm text-black leading-relaxed">{tpl.desc}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
