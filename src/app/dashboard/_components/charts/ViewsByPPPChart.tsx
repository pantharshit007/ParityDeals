"use client";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCompactNumber } from "@/lib/formatters";
import React from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

interface ChartDataProp {
  views: number;
  pppName: string;
}

function ViewsByPPPChart({ chartData }: { chartData: ChartDataProp[] }) {
  const chartConfig = {
    views: {
      label: "Visitors",
      color: "hsl(var(--accent))",
    },
  };

  if (chartData.length === 0) {
    return (
      <p className="flex items-center justify-center text-muted-foreground min-h-[150px] max-h-[250px]">
        No data available
      </p>
    );
  }

  const customData = chartData.map((d) => ({
    ...d,
    pppName: d.pppName.replace("Parity Group:", ""),
  }));

  return (
    <ChartContainer config={chartConfig} className="min-h-[150px] max-h-[250px] w-full">
      <BarChart accessibilityLayer data={customData}>
        <XAxis dataKey="pppName" tickLine={false} tickMargin={10} />
        <YAxis
          tickLine={false}
          tickMargin={10}
          allowDecimals={false}
          tickFormatter={formatCompactNumber}
        />
        <ChartTooltip content={<ChartTooltipContent nameKey="countryName" />} />
        <Bar dataKey="views" fill="hsl(var(--accent))" />
      </BarChart>
    </ChartContainer>
  );
}

export default ViewsByPPPChart;
