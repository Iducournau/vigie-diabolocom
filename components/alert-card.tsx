import Link from "next/link";
import { Alert } from "@/lib/types";
import { SeverityBadge, StatusBadge } from "./alert-badge";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  alert: Alert;
  compact?: boolean;
  className?: string;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${diffDays}j`;
}

export function AlertCard({ alert, compact = false, className }: AlertCardProps) {
  if (compact) {
    return (
      <Link href={`/alerts/${alert.id}`} className="block">
        <div
          className={cn(
            "flex items-center justify-between px-4 py-3 transition-all duration-200 ease-out cursor-pointer",
            "hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-gray-800/50",
            className
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn("w-2 h-2 rounded-full shrink-0", {
                "bg-red-500": alert.severity === "critical",
                "bg-amber-500": alert.severity === "warning",
                "bg-blue-500": alert.severity === "info",
              })}
            />
            <div className="min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                {alert.ruleName}
                <span className="font-normal text-gray-500 dark:text-gray-400"> — {alert.campaign}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Contact #{alert.contactId} • {formatTimeAgo(alert.detectedAt)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/alerts/${alert.id}`} className="block">
      <div
        className={cn(
          "p-4 border rounded-lg transition-all duration-200 ease-out cursor-pointer bg-white dark:bg-gray-900",
          "hover:-translate-y-1",
          {
            "border-gray-200 dark:border-gray-800 hover:border-red-300 dark:hover:border-red-800": alert.severity === "critical",
            "border-gray-200 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-800": alert.severity === "warning",
            "border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-800": alert.severity === "info",
          },
          className
        )}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5">
            <AlertTriangle
              className={cn("h-5 w-5", {
                "text-red-500": alert.severity === "critical",
                "text-amber-500": alert.severity === "warning",
                "text-blue-500": alert.severity === "info",
              })}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{alert.ruleName}</h3>
              <SeverityBadge severity={alert.severity} />
              <StatusBadge status={alert.status} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.campaign}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-0.5">
              Contact #{alert.contactId} • Détecté {formatTimeAgo(alert.detectedAt)}
            </p>
            
            {/* Données contextuelles */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {alert.data.priority !== undefined && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                  Priorité {alert.data.priority}
                </span>
              )}
              {alert.data.callCount !== undefined && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                  {alert.data.callCount} appels
                </span>
              )}
              {alert.data.callDuration !== undefined && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                  Durée {alert.data.callDuration}s
                </span>
              )}
              {alert.data.hoursWithoutCall !== undefined && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                  {alert.data.hoursWithoutCall}h sans appel
                </span>
              )}
              {alert.data.closingCode && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                  Code: {alert.data.closingCode}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}