import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { Badge } from "../ui/badge";

interface MainStatsCardProps {
  title: string;
  value: string | number;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >; // Icon component from lucide-react
  color?: string; // Optional color for the icon background
  bgColor?: string; // Optional background color for the icon
  description?: string; // Optional description text
  change?: number | string; // Optional progress percentage (0-100)
  changeType?: "increase" | "decrease"; // Optional type of change
}

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
      className="hover:shadow-md transition-shadow"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`${bgColor} p-2 rounded-lg`}>
          <Icon className={`size-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {change !== undefined && changeType && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
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
