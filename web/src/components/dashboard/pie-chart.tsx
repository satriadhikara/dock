"use client";

import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

const chartData = [
  { name: "Active", value: 50, fill: "#4EB4E1" },
  { name: "On-progress", value: 15, fill: "#A1A1AA" },
  { name: "Near Due", value: 35, fill: "#F97316" },
];

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

export function ContractOverviewChart() {
  return (
    <Card className="h-96">
      <CardHeader className="flex flex-row justify-between items-center pb-2">
        <CardTitle>Contract Overview</CardTitle>
        <select className="text-sm border rounded px-2 py-1">
          <option>September</option>
        </select>
      </CardHeader>
      <CardContent className="h-72 p-0">
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
              fill="#4EB4E1"
              label
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
      </CardContent>
    </Card>
  );
}
