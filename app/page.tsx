import { AlertTriangle, AlertCircle, Info, CheckCircle2, RefreshCw } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { AlertCard } from "@/components/alert-card";
import { AlertsChart } from "@/components/alerts-chart";
import { dashboardStats, alerts, syncLogs, formatTimeAgo } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const activeAlerts = alerts
    .filter((a) => a.status !== "resolved" && a.status !== "ignored")
    .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());

  const criticalAlerts = activeAlerts.filter((a) => a.severity === "critical");

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
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Dernière sync : {formatTimeAgo(dashboardStats.lastSyncAt)}
            <span
              className={`ml-2 inline-block w-2 h-2 rounded-full ${
                dashboardStats.lastSyncStatus === "success"
                  ? "bg-emerald-500"
                  : "bg-red-500"
              }`}
            />
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Rafraîchir
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Critiques"
          value={dashboardStats.critical}
          icon={AlertTriangle}
          variant="critical"
        />
        <StatsCard
          title="Attention"
          value={dashboardStats.warning}
          icon={AlertCircle}
          variant="warning"
        />
        <StatsCard
          title="Info"
          value={dashboardStats.info}
          icon={Info}
          variant="info"
        />
        <StatsCard
          title="Résolues (24h)"
          value={dashboardStats.resolved}
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
            <Link href="/alerts?severity=critical">
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
            <Link href="/logs">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Logs →
              </Button>
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {syncLogs.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 text-sm"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    log.status === "success" ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 dark:text-gray-300">
                    {log.status === "success" ? (
                      <>
                        Sync réussie — {log.recordsFetched} leads
                        {log.alertsGenerated > 0 && (
                          <span className="text-amber-600 dark:text-amber-400">
                            {" "}• +{log.alertsGenerated} alertes
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">
                        Erreur : {log.errorMessage}
                      </span>
                    )}
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs">
                    {formatTimeAgo(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
