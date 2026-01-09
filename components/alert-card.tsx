import Link from "next/link";
import { Alert } from "@/lib/types";
import { formatTimeAgo } from "@/lib/mock-data";
import { SeverityBadge, StatusBadge } from "./alert-badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  alert: Alert;
  compact?: boolean;
  className?: string;
}

export function AlertCard({ alert, compact = false, className }: AlertCardProps) {
  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
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
              Lead #{alert.leadId} • {formatTimeAgo(alert.detectedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Link href={`/alerts/${alert.id}`}>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition-colors bg-white dark:bg-gray-900",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
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
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{alert.ruleName}</h3>
              <SeverityBadge severity={alert.severity} />
              <StatusBadge status={alert.status} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.campaign}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-0.5">
              Lead #{alert.leadId} • Détecté {formatTimeAgo(alert.detectedAt)}
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

        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/alerts/${alert.id}`}>
            <Button variant="outline" size="sm">
              Voir
            </Button>
          </Link>
          {alert.status === "new" && (
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
