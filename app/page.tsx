"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, AlertCircle, Info, CheckCircle2, RefreshCw, Loader2 } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { AlertCard } from "@/components/alert-card";
import { AlertsChart } from "@/components/alerts-chart";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Alert, Severity, AlertStatus } from "@/lib/types";

// Mapping des règles
const RULES_MAP: Record<string, { name: string; severity: Severity }> = {
  "00097670-06b9-406a-97cc-c8d138448eff": { name: "Lead dormant", severity: "critical" },
  "23934576-a556-4035-8dc8-2d851a86e02e": { name: "Rappel oublié", severity: "critical" },
  "59cb9b8e-6916-47f8-898c-c2e18c81f4a6": { name: "Unreachable suspect", severity: "warning" },
  "7caa90f2-9288-4c80-8d6a-6d3078c6a135": { name: "Clôture trop rapide", severity: "warning" },
  "c99b95b1-5dd6-48ed-b703-84df70e4eddb": { name: "Acharnement", severity: "info" },
};

// Mapping des campagnes
const CAMPAIGNS_MAP: Record<string, string> = {
  "5927": "Electricien",
  "3389": "CPF : Relances CPF",
  "2602": "Coaching 2",
  "2603": "Coaching 3",
  "5659": "Coaching SKETCHUP",
  "6083": "CA - Elec MIT MIS",
  "5671": "Coaching CFA",
  "4118": "Coaching 1 : nouveaux inscrits",
  "5920": "CAP MIS",
  "6067": "CA - Excel et Formateur",
  "6082": "CA - Mode Déco",
  "6064": "CA - Titres Professionnels",
  "6050": "CA - Céramiste Fleuriste",
  "6051": "CA - Métiers de la Beauté",
  "6046": "CA - Métiers de Bouche",
  "3148": "Campagne A",
  "5571": "Test - Conseiller Fleuriste2",
  "6016": "CRE : leads autonomes",
  "5582": "CRE",
  "5921": "CAP MIT",
  "5611": "Campagne Mode",
  "5622": "Campagne Nutritionniste",
  "5621": "Décorateur Intérieur",
  "5612": "Métiers Animaliers",
  "5580": "Campagne AEPE",
  "5617": "Admin apprentissage",
  "5600": "Tiers Financement",
  "5520": "Recouvrement",
  "5534": "Recouvrement v2 test",
  "5667": "Resiliation",
  "3512": "CONTENTIEUX",
  "3511": "COMPTA",
  "3510": "ACCORD NON RESPECTÉ",
};

function getCampaignName(campaignId: string): string {
  return CAMPAIGNS_MAP[campaignId] || `Campagne ${campaignId}`;
}

function mapStatus(status: string): AlertStatus {
  if (status === "open") return "new";
  return status as AlertStatus;
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

interface DashboardStats {
  critical: number;
  warning: number;
  info: number;
  resolved: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ critical: 0, warning: 0, info: 0, resolved: 0 });
  const [criticalAlerts, setCriticalAlerts] = useState<Alert[]>([]);
  const [recentActivity, setRecentActivity] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  async function fetchDashboardData() {
    // Fetch stats par sévérité (alertes ouvertes)
    const { data: openAlerts } = await supabase
      .from("alerts")
      .select("rule_id, status")
      .in("status", ["open", "acknowledged"]);

    // Compter par sévérité
    let critical = 0, warning = 0, info = 0;
    (openAlerts || []).forEach((alert) => {
      const ruleInfo = RULES_MAP[alert.rule_id];
      if (ruleInfo) {
        if (ruleInfo.severity === "critical") critical++;
        else if (ruleInfo.severity === "warning") warning++;
        else if (ruleInfo.severity === "info") info++;
      }
    });

    // Compter résolues (dernières 24h)
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    
    const { count: resolvedCount } = await supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("status", "resolved")
      .gte("resolved_at", yesterday.toISOString());

    setStats({
      critical,
      warning,
      info,
      resolved: resolvedCount || 0,
    });

    // Fetch alertes critiques (pour la liste)
    const { data: criticalData } = await supabase
      .from("alerts")
      .select("*")
      .in("status", ["open", "acknowledged"])
      .order("detected_at", { ascending: false })
      .limit(10);

    const transformedCritical: Alert[] = (criticalData || [])
      .map((data) => {
        const ruleInfo = RULES_MAP[data.rule_id] || { name: "Règle inconnue", severity: "info" as Severity };
        const alertData = typeof data.alert_data === "string" ? JSON.parse(data.alert_data) : data.alert_data || {};
        
        return {
          id: data.id,
          ruleId: data.rule_id,
          ruleName: ruleInfo.name,
          severity: ruleInfo.severity,
          status: mapStatus(data.status),
          leadId: data.lead_id,
          campaign: getCampaignName(data.campaign),
          detectedAt: new Date(data.detected_at),
          data: alertData,
        };
      })
      .filter((a) => a.severity === "critical");

    setCriticalAlerts(transformedCritical);

    // Fetch activité récente (dernières alertes créées/résolues)
    const { data: recentData } = await supabase
      .from("alerts")
      .select("*")
      .order("detected_at", { ascending: false })
      .limit(6);

    const transformedRecent: Alert[] = (recentData || []).map((data) => {
      const ruleInfo = RULES_MAP[data.rule_id] || { name: "Règle inconnue", severity: "info" as Severity };
      const alertData = typeof data.alert_data === "string" ? JSON.parse(data.alert_data) : data.alert_data || {};
      
      return {
        id: data.id,
        ruleId: data.rule_id,
        ruleName: ruleInfo.name,
        severity: ruleInfo.severity,
        status: mapStatus(data.status),
        leadId: data.lead_id,
        campaign: getCampaignName(data.campaign),
        detectedAt: new Date(data.detected_at),
        data: alertData,
      };
    });

    setRecentActivity(transformedRecent);
    setLastSync(new Date());
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchDashboardData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Surveillance des anomalies en temps réel
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastSync && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Dernière sync : {formatTimeAgo(lastSync)}
              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Rafraîchir
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Critiques"
          value={stats.critical}
          icon={AlertTriangle}
          variant="critical"
        />
        <StatsCard
          title="Attention"
          value={stats.warning}
          icon={AlertCircle}
          variant="warning"
        />
        <StatsCard
          title="Info"
          value={stats.info}
          icon={Info}
          variant="info"
        />
        <StatsCard
          title="Résolues (24h)"
          value={stats.resolved}
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      {/* Chart */}
      <AlertsChart />

      {/* Two columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical alerts */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Alertes critiques
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({criticalAlerts.length})
              </span>
            </h2>
            <Link href="/alerts?status=new">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Voir tout →
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {criticalAlerts.length > 0 ? (
              criticalAlerts
                .slice(0, 5)
                .map((alert) => (
                  <AlertCard key={alert.id} alert={alert} compact />
                ))
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-3" />
                <p className="font-medium">Aucune alerte critique</p>
                <p className="text-sm">Tout fonctionne normalement</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-medium text-gray-900 dark:text-gray-100">Activité récente</h2>
            <Link href="/alerts">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Alertes →
              </Button>
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((alert) => (
                <Link key={alert.id} href={`/alerts/${alert.id}`}>
                  <div className="flex items-start gap-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 -mx-2 px-2 py-1.5 rounded-md transition-colors">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        alert.severity === "critical"
                          ? "bg-red-500"
                          : alert.severity === "warning"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 dark:text-gray-300 truncate">
                        {alert.ruleName}
                        <span className="text-gray-400 dark:text-gray-500"> • Lead #{alert.leadId}</span>
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs">
                        {formatTimeAgo(alert.detectedAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                Aucune activité récente
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
