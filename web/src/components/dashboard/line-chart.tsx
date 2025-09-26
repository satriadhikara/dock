"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "Jan", contracts: 20 },
  { month: "Feb", contracts: 18 },
  { month: "Mar", contracts: 25 },
  { month: "Apr", contracts: 40 },
  { month: "May", contracts: 55 },
  { month: "Jun", contracts: 35 },
];

const chartConfig = {
  contracts: {
    label: "Contracts",
    color: "#4EB4E1",
  },
} satisfies ChartConfig;

export function ContractTrendChart() {
  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-2 px-6">
        <CardTitle>Annual Contract Trend</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 px-4 pb-4 min-h-0">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                opacity={0.3}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
              />
              <ChartTooltip
                cursor={{ stroke: "#4EB4E1", strokeWidth: 1 }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="contracts"
                type="monotone"
                stroke="#4EB4E1"
                strokeWidth={2}
                dot={{
                  fill: "#4EB4E1",
                  r: 3,
                }}
                activeDot={{
                  r: 5,
                  fill: "#4EB4E1",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
