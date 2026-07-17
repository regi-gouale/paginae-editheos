"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useProgressChart } from "@/hooks/dashboard/use-progress-chart";

const chartConfig = {
  completed: { label: "Terminés", color: "hsl(142, 71%, 45%)" },
  created: { label: "Créés", color: "hsl(217, 91%, 60%)" },
  inProgress: { label: "En cours", color: "hsl(25, 95%, 53%)" },
} satisfies ChartConfig;

export default function ProgressChart() {
  const { data, loading } = useProgressChart();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progression mensuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-60 rounded bg-muted"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.monthlyData.slice(-6);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Progression mensuelle</CardTitle>
          <CardDescription>
            Projets créés, en cours et terminés sur 6 mois
          </CardDescription>
        </div>
        <Badge
          variant={data.trend.direction === "up" ? "default" : "destructive"}
          className="flex items-center gap-1"
        >
          {data.trend.direction === "up" ? (
            <IconTrendingUp className="size-3" />
          ) : (
            <IconTrendingDown className="size-3" />
          )}
          <span>
            {data.trend.direction === "up" ? "+" : "-"}
            {data.trend.value}%
          </span>
        </Badge>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-60 w-full">
          <AreaChart
            data={chartData}
            margin={{ left: 0, right: 12, top: 4, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDecimals={false}
              width={32}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-completed)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-completed)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillCreated" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-created)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-created)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillInProgress" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-inProgress)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-inProgress)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="created"
              type="monotone"
              fill="url(#fillCreated)"
              stroke="var(--color-created)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="inProgress"
              type="monotone"
              fill="url(#fillInProgress)"
              stroke="var(--color-inProgress)"
              strokeWidth={2}
              stackId="b"
            />
            <Area
              dataKey="completed"
              type="monotone"
              fill="url(#fillCompleted)"
              stroke="var(--color-completed)"
              strokeWidth={2}
              stackId="c"
            />
          </AreaChart>
        </ChartContainer>

        <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
          <div className="text-center flex flex-col gap-1">
            <div className="text-2xl font-bold text-emerald-600">
              {data.totalCompleted}
            </div>
            <div className="text-xs text-muted-foreground">Terminés</div>
          </div>
          <div className="text-center flex flex-col gap-1">
            <div className="text-2xl font-bold text-blue-600">
              {data.totalCreated}
            </div>
            <div className="text-xs text-muted-foreground">Créés</div>
          </div>
          <div className="text-center flex flex-col gap-1">
            <div className="text-2xl font-bold text-purple-600">
              {data.totalCreated > 0
                ? Math.round((data.totalCompleted / data.totalCreated) * 100)
                : 0}
              %
            </div>
            <div className="text-xs text-muted-foreground">
              Taux de réussite
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
