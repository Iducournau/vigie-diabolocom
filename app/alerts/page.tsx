"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AlertCard } from "@/components/alert-card";
import { Button } from "@/components/ui/button";
import { Alert, Severity, AlertStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Filter, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

type FilterSeverity = Severity | "all";
type FilterStatus = AlertStatus | "all";

// Mapping des règles
const RULES_MAP: Record<string, { name: string; severity: Severity }> = {
  "00097670-06b9-406a-97cc-c8d138448eff": { name: "Lead dormant", severity: "critical" },
  "23934576-a556-4035-8dc8-2d851a86e02e": { name: "Rappel oublié", severity: "critical" },
  "59cb9b8e-6916-47f8-898c-c2e18c81f4a6": { name: "Unreachable suspect", severity: "warning" },
  "7caa90f2-9288-4c80-8d6a-6d3078c6a135": { name: "Clôture trop rapide", severity: "warning" },
  "c99b95b1-5dd6-48ed-b703-84df70e4eddb": { name: "Acharnement", severity: "info" },
  // Nouvelles règles Retry
  "a1b2c3d4-1111-4000-8000-000000000001": { name: "Retry en retard (léger)", severity: "info" },
  "a1b2c3d4-2222-4000-8000-000000000002": { name: "Retry en retard (modéré)", severity: "warning" },
  "a1b2c3d4-3333-4000-8000-000000000003": { name: "Retry en retard (critique)", severity: "critical" },
};

// Mapping des campagnes Admissions (12)
const CAMPAIGNS_MAP: Record<string, string> = {
  "5612": "Métiers Animaliers",
  "5927": "Electricien",
  "5920": "CAP MIS",
  "5622": "Campagne Nutritionniste",
  "5611": "Campagne Mode",
  "5621": "Décorateur Intérieur",
  "5580": "Campagne AEPE",
  "6064": "CA - Titres Professionnels",
  "6051": "CA - Métiers de la Beauté",
  "6046": "CA - Métiers de Bouche",
  "6050": "CA - Céramiste Fleuriste",
  "6082": "CA - Mode Déco",
};

function getCampaignName(campaignId: string): string {
  return CAMPAIGNS_MAP[campaignId] || `Campagne ${campaignId}`;
}

function transformAlert(dbAlert: any): Alert {
  const rule = RULES_MAP[dbAlert.rule_id] || { name: "Règle inconnue", severity: "info" as Severity };
  const alertData = typeof dbAlert.alert_data === "string" 
    ? JSON.parse(dbAlert.alert_data) 
    : dbAlert.alert_data || {};
  
  const createdAt = alertData.createdAt ? new Date(alertData.createdAt) : null;
  const hoursWithoutCall = createdAt 
    ? Math.round((Date.now() - createdAt.getTime()) / (1000 * 60 * 60))
    : undefined;

  return {
    id: dbAlert.id,
    ruleId: dbAlert.rule_id,
    ruleName: rule.name,
    leadId: dbAlert.lead_id,
    campaign: getCampaignName(dbAlert.campaign),
    severity: rule.severity,
    status: mapStatus(dbAlert.status),
    data: {
      priority: alertData.priority,
      callCount: alertData.triesNumber,
      hoursWithoutCall: hoursWithoutCall,
    },
    detectedAt: new Date(dbAlert.detected_at),
    resolvedAt: dbAlert.resolved_at ? new Date(dbAlert.resolved_at) : undefined,
    resolvedBy: dbAlert.resolved_by || undefined,
  };
}

function mapStatus(status: string): AlertStatus {
  const statusMap: Record<string, AlertStatus> = {
    open: "new",
    acknowledged: "acknowledged",
    resolved: "resolved",
    ignored: "ignored",
  };
  return statusMap[status] || "new";
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({ all: 0, new: 0, acknowledged: 0, resolved: 0, ignored: 0 });
  
  // Filtres
  const [severityFilter, setSeverityFilter] = useState<FilterSeverity>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // Récupérer les compteurs par status (une seule fois)
  useEffect(() => {
    async function fetchCounts() {
      const { count: total } = await supabase.from("alerts").select("*", { count: "exact", head: true });
      const { count: open } = await supabase.from("alerts").select("*", { count: "exact", head: true }).eq("status", "open");
      const { count: acknowledged } = await supabase.from("alerts").select("*", { count: "exact", head: true }).eq("status", "acknowledged");
      const { count: resolved } = await supabase.from("alerts").select("*", { count: "exact", head: true }).eq("status", "resolved");
      const { count: ignored } = await supabase.from("alerts").select("*", { count: "exact", head: true }).eq("status", "ignored");
      
      setStatusCounts({
        all: total || 0,
        new: open || 0,
        acknowledged: acknowledged || 0,
        resolved: resolved || 0,
        ignored: ignored || 0,
      });
    }
    fetchCounts();
  }, []);

  // Récupérer les alertes avec pagination
  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true);

      let query = supabase
        .from("alerts")
        .select("*", { count: "exact" });

      // Filtre par status
      if (statusFilter !== "all") {
        const dbStatus = statusFilter === "new" ? "open" : statusFilter;
        query = query.eq("status", dbStatus);
      }

      // Filtre par campagne
      if (campaignFilter !== "all") {
        const campaignId = Object.entries(CAMPAIGNS_MAP).find(([, name]) => name === campaignFilter)?.[0];
        if (campaignId) {
          query = query.eq("campaign", campaignId);
        }
      }

      // Filtre par sévérité (via rule_id)
      if (severityFilter !== "all") {
        const ruleIds = Object.entries(RULES_MAP)
          .filter(([, rule]) => rule.severity === severityFilter)
          .map(([id]) => id);
        query = query.in("rule_id", ruleIds);
      }

      // Pagination
      const from = (currentPage - 1) * perPage;
      const to = from + perPage - 1;

      const { data, error, count } = await query
        .order("detected_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Erreur:", error);
      } else {
        const transformedAlerts = (data || []).map(transformAlert);
        setAlerts(transformedAlerts);
        setTotalCount(count || 0);
      }

      setLoading(false);
    }

    fetchAlerts();
  }, [currentPage, perPage, statusFilter, campaignFilter, severityFilter]);

  // Reset page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, campaignFilter, severityFilter]);

  const filteredAlerts = alerts;

  // Campagnes pour le select
  const campaigns = Object.values(CAMPAIGNS_MAP).sort();

  const hasFilters = severityFilter !== "all" || statusFilter !== "all" || campaignFilter !== "all";

  const clearFilters = () => {
    setSeverityFilter("all");
    setStatusFilter("all");
    setCampaignFilter("all");
  };

  const totalPages = Math.ceil(totalCount / perPage);

  if (loading && alerts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Alertes</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          {totalCount} alerte{totalCount > 1 ? "s" : ""} au total
        </p>
      </div>

      {/* Status tabs avec compteurs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-6">
          {[
            { key: "all", label: "Toutes", count: statusCounts.all },
            { key: "new", label: "Nouvelles", count: statusCounts.new },
            { key: "acknowledged", label: "En cours", count: statusCounts.acknowledged },
            { key: "resolved", label: "Résolues", count: statusCounts.resolved },
            { key: "ignored", label: "Ignorées", count: statusCounts.ignored },
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
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filters + Per page selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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
              <option key={c} value={c}>
                {c}
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

        {/* Per page selector */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Afficher</span>
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>par page</span>
        </div>
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">Aucune alerte ne correspond aux filtres.</p>
            <Button variant="link" onClick={clearFilters} className="mt-2">
              Effacer les filtres
            </Button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 border-t border-gray-200 dark:border-gray-800 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
