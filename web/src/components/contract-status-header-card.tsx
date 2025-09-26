export type ContractStatus = "Draft" | "On Review" | "Negotiating" | "Signing";

export interface ContractStatusHeaderCardProps {
  status: ContractStatus;
  count: number;
}

export function ContractStatusHeaderCard({
  status,
  count,
}: ContractStatusHeaderCardProps) {
  const statusColor: Record<ContractStatus, string> = {
    Draft: "#7F868E",
    "On Review": "#5925DC",
    Negotiating: "#FB6514",
    Signing: "#12B76A",
  };

  return (
    <div
      className="pr-3 pl-5 py-2 w-full flex justify-between items-center rounded-full"
      style={{ backgroundColor: statusColor[status] }}
    >
      <h2 className="font-bold text-white">{status}</h2>
      <div className="flex items-center px-3 py-1.5 bg-white rounded-full">
        <p className="text-[#7F868E] font-semibold">{count}</p>
      </div>
    </div>
  );
}
