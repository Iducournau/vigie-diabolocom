import { Severity, AlertStatus } from "@/lib/types";
import { colors, getSeverityColor, getStatusColor } from "@/lib/theme";
import { SEVERITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const style = getSeverityColor(severity);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        style.bg,
        style.text,
        className
      )}
    >
      {SEVERITY_LABELS[severity]}
    </span>
  );
}

interface StatusBadgeProps {
  status: AlertStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = getStatusColor(status);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        style.bg,
        style.text,
        className
      )}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
