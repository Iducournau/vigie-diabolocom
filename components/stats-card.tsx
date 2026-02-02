import { cn } from "@/lib/utils";
import { statsCardVariants, StatsCardVariant } from "@/lib/styles";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: StatsCardVariant;
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, variant, className }: StatsCardProps) {
  const style = statsCardVariants[variant];

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        style.bg,
        style.border,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className={cn("text-3xl font-semibold mt-1", style.value)}>{value}</p>
        </div>
        <div className={cn("p-2.5 rounded-lg", style.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
