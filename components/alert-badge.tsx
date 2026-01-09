import { Severity, AlertStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const styles = {
    critical: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
  };

  const labels = {
    critical: "Critique",
    warning: "Attention",
    info: "Info",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        styles[severity],
        className
      )}
    >
      {labels[severity]}
    </span>
  );
}

interface StatusBadgeProps {
  status: AlertStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = {
    new: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400",
    acknowledged: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-400",
    resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
    ignored: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
  };

  const labels = {
    new: "Nouveau",
    acknowledged: "En cours",
    resolved: "Résolu",
    ignored: "Ignoré",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        styles[status],
        className
      )}
    >
      {labels[status]}
    </span>
  );
}
