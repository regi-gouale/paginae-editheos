import type { IconProps } from "@tabler/icons-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MainStatsCardProps = {
  title: string;
  value: string | number;
  icon: ForwardRefExoticComponent<
    Omit<IconProps, "ref"> & RefAttributes<SVGSVGElement>
  >; // Icon component from @tabler/icons-react
  color?: string; // Optional color for the icon background
  bgColor?: string; // Optional background color for the icon
  description?: string; // Optional description text
  change?: number | string; // Optional progress percentage (0-100)
  changeType?: "increase" | "decrease"; // Optional type of change
};

export function StatsCard({
  title,
  value,
  icon,
  color = "text-gray-600",
  bgColor = "bg-gray-50",
  description,
  change,
  changeType,
}: MainStatsCardProps) {
  const Icon = icon;
  return (
    <Card
      key={title.trim().toLocaleLowerCase()}
      className="surface-card glow-subtle overflow-hidden rounded-4xl border-border/70 transition-all hover:-translate-y-0.5"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`${bgColor} rounded-full p-2`}>
          <Icon className={`size-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {change !== undefined && changeType && (
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className={
                changeType === "increase" ? "text-green-500" : "text-red-500"
              }
            >
              <Badge
                variant={changeType === "increase" ? "default" : "destructive"}
                className="text-xs"
              >
                {changeType === "increase" ? "▲" : "▼"} {change}
              </Badge>
            </span>
            <span>par rapport au mois dernier</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
