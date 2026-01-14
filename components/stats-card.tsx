import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: "critical" | "warning" | "info" | "success" | "default";
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, variant, className }: StatsCardProps) {
  const styles = {
    critical: {
      bg: "bg-red-50 dark:bg-red-950/50",
      border: "border-red-100 dark:border-red-900",
      icon: "text-red-500 bg-red-100 dark:bg-red-900/50",
      value: "text-red-700 dark:text-red-400",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-950/50",
      border: "border-amber-100 dark:border-amber-900",
      icon: "text-amber-500 bg-amber-100 dark:bg-amber-900/50",
      value: "text-amber-700 dark:text-amber-400",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-950/50",
      border: "border-blue-100 dark:border-blue-900",
      icon: "text-blue-500 bg-blue-100 dark:bg-blue-900/50",
      value: "text-blue-700 dark:text-blue-400",
    },
    success: {
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
      border: "border-emerald-100 dark:border-emerald-900",
      icon: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/50",
      value: "text-emerald-700 dark:text-emerald-400",
    },
    default: {
      bg: "bg-gray-50 dark:bg-gray-900",
      border: "border-gray-200 dark:border-gray-800",
      icon: "text-gray-500 bg-gray-100 dark:bg-gray-800",
      value: "text-gray-900 dark:text-gray-100",
    },
  };

  const style = styles[variant];

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-colors",
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