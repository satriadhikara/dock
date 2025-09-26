import { Input } from "@/components/ui/input";
import { EllipsisVertical, Search } from "lucide-react";
import { ContractStatusHeaderCard } from "@/components/contract-status-header-card";
import { ContractCard } from "@/components/contract-card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ContractsPage() {
  return (
    <div className="h-screen w-full p-8 flex flex-col overflow-hidden bg-[#F8FAFC]">
      <header className="flex justify-between items-center mb-6">
        <h1 className="font-bold text-black">Contracts on going</h1>

        <div className="flex items-center gap-2">
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="w-[292px] pl-10 rounded-[50px] text-[#A7ADB3] bg-white py-2"
                placeholder="Search"
              />
            </div>
          </div>

          <div className="bg-white border border-[#E3E7EA] p-2.5 rounded-[8px]">
            <EllipsisVertical className="w-[18px] h-[18px]" fill="#576069" />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full overflow-hidden min-h-0 flex flex-row justify-between gap-4">
        <div className="w-full flex flex-col h-full min-h-0">
          <ContractStatusHeaderCard status="Draft" count={20} />
          <ScrollArea className="h-full">
            <ContractCard
              company="PT ABC"
              title="Contract-4"
              createdAt="26/09/2025"
            />
            <ContractCard
              company="PT ABC"
              title="Contract-4"
              createdAt="26/09/2025"
            />
            <ContractCard
              company="PT ABC"
              title="Contract-4"
              createdAt="26/09/2025"
            />
            <ContractCard
              company="PT ABC"
              title="Contract-4"
              createdAt="26/09/2025"
            />
            <ContractCard
              company="PT ABC"
              title="Contract-4"
              createdAt="26/09/2025"
            />
            <ContractCard
              company="PT ABC"
              title="Contract-4"
              createdAt="26/09/2025"
            />
            <ContractCard
              company="PT ABC"
              title="Contract-4"
              createdAt="26/09/2025"
            />
            <ContractCard
              company="PT ABC"
              title="Contract-4"
              createdAt="26/09/2025"
            />
          </ScrollArea>
        </div>

        <div className="w-full flex flex-col h-full min-h-0">
          <ContractStatusHeaderCard status="On Review" count={8} />
          <ScrollArea className="h-full">
            <ContractCard
              company="PT ABC"
              title="Contract-4"
              createdAt="26/09/2025"
            />
            <ContractCard
              company="PT ABC"
              title="Contract-4"
              createdAt="26/09/2025"
            />
            <ContractCard
              company="PT ABC"
              title="Contract-4"
              createdAt="26/09/2025"
            />
          </ScrollArea>
        </div>

        <div className="w-full flex flex-col h-full min-h-0">
          <ContractStatusHeaderCard status="Negotiating" count={12} />
          <ScrollArea className="h-full">
            <ContractCard
              company="PT ABC"
              title="Contract-4"
              createdAt="26/09/2025"
            />
            <ContractCard
              company="PT ABC"
              title="Contract-4"
              createdAt="26/09/2025"
            />
            <ContractCard
              company="PT ABC"
              title="Contract-4"
              createdAt="26/09/2025"
            />
          </ScrollArea>
        </div>

        <div className="w-full flex flex-col h-full min-h-0">
          <ContractStatusHeaderCard status="Signing" count={3} />
          <ScrollArea className="h-full">
            <ContractCard
              company="PT ABC"
              title="Contract-4"
              createdAt="26/09/2025"
            />
            <ContractCard
              company="PT ABC"
              title="Contract-4"
              createdAt="26/09/2025"
            />
            <ContractCard
              company="PT ABC"
              title="Contract-4"
              createdAt="26/09/2025"
            />
          </ScrollArea>
        </div>
      </main>
    </div>
  );
}
