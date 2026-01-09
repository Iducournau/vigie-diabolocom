"use client";

import { useState } from "react";
import { alerts, campaigns } from "@/lib/mock-data";
import { AlertCard } from "@/components/alert-card";
import { Button } from "@/components/ui/button";
import { Severity, AlertStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Filter, X } from "lucide-react";

type FilterSeverity = Severity | "all";
type FilterStatus = AlertStatus | "all";

export default function AlertsPage() {
  const [severityFilter, setSeverityFilter] = useState<FilterSeverity>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");

  const filteredAlerts = alerts.filter((alert) => {
    if (severityFilter !== "all" && alert.severity !== severityFilter) return false;
    if (statusFilter !== "all" && alert.status !== statusFilter) return false;
    if (campaignFilter !== "all" && alert.campaign !== campaignFilter) return false;
    return true;
  });

  const sortedAlerts = [...filteredAlerts].sort(
    (a, b) => b.detectedAt.getTime() - a.detectedAt.getTime()
  );

  const hasFilters =
    severityFilter !== "all" || statusFilter !== "all" || campaignFilter !== "all";

  const clearFilters = () => {
    setSeverityFilter("all");
    setStatusFilter("all");
    setCampaignFilter("all");
  };

  const counts = {
    all: alerts.length,
    new: alerts.filter((a) => a.status === "new").length,
    acknowledged: alerts.filter((a) => a.status === "acknowledged").length,
    resolved: alerts.filter((a) => a.status === "resolved").length,
    ignored: alerts.filter((a) => a.status === "ignored").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Alertes</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          {sortedAlerts.length} alerte{sortedAlerts.length > 1 ? "s" : ""}
          {hasFilters && " (filtrées)"}
        </p>
      </div>

      {/* Status tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-6">
          {[
            { key: "all", label: "Toutes" },
            { key: "new", label: "Nouvelles" },
            { key: "acknowledged", label: "En cours" },
            { key: "resolved", label: "Résolues" },
            { key: "ignored", label: "Ignorées" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as FilterStatus)}
              className={cn(
                "pb-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                statusFilter === tab.key
                  ? "border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "ml-2 px-1.5 py-0.5 rounded text-xs",
                  statusFilter === tab.key
                    ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                )}
              >
                {counts[tab.key as keyof typeof counts]}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Filter className="h-4 w-4" />
          Filtres :
        </div>

        {/* Severity filter */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-1 gap-1">
          {[
            { key: "all", label: "Toutes" },
            { key: "critical", label: "Critique", dot: "bg-red-500" },
            { key: "warning", label: "Attention", dot: "bg-amber-500" },
            { key: "info", label: "Info", dot: "bg-blue-500" },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setSeverityFilter(option.key as FilterSeverity)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded text-sm transition-colors",
                severityFilter === option.key
                  ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              {option.dot && (
                <span className={cn("w-2 h-2 rounded-full", option.dot)} />
              )}
              {option.label}
            </button>
          ))}
        </div>

        {/* Campaign filter */}
        <select
          value={campaignFilter}
          onChange={(e) => setCampaignFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700"
        >
          <option value="all">Toutes les campagnes</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Clear filters */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 dark:text-gray-400"
          >
            <X className="h-4 w-4 mr-1" />
            Effacer
          </Button>
        )}
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {sortedAlerts.length > 0 ? (
          sortedAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">Aucune alerte ne correspond aux filtres.</p>
            <Button variant="link" onClick={clearFilters} className="mt-2">
              Effacer les filtres
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
