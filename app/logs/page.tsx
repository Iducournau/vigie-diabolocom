"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, Database, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mapping des règles
const RULES_MAP: Record<string, string> = {
  "00097670-06b9-406a-97cc-c8d138448eff": "Lead dormant",
  "23934576-a556-4035-8dc8-2d851a86e02e": "Rappel oublié",
  "59cb9b8e-6916-47f8-898c-c2e18c81f4a6": "Unreachable suspect",
  "7caa90f2-9288-4c80-8d6a-6d3078c6a135": "Clôture trop rapide",
  "c99b95b1-5dd6-48ed-b703-84df70e4eddb": "Acharnement",
};

interface Log {
  id: string;
  rule_id: string;
  execution_time: string;
  status: string;
  alerts_count: number;
  error_message: string | null;
  duration_ms: number;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${diffDays}j`;
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchLogs() {
    const { data, error } = await supabase
      .from("logs")
      .select("*")
      .order("execution_time", { ascending: false })
      .limit(100);

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchLogs();
  }

  const successCount = logs.filter((l) => l.status === "success").length;
  const errorCount = logs.filter((l) => l.status === "error").length;
  const successLogs = logs.filter((l) => l.status === "success" && l.duration_ms > 0);
  const avgDuration = successLogs.length > 0 
    ? Math.round(successLogs.reduce((sum, l) => sum + l.duration_ms, 0) / successLogs.length)
    : 0;
  const totalAlerts = logs.reduce((sum, l) => sum + (l.alerts_count || 0), 0);

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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Logs</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Historique des synchronisations n8n
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Rafraîchir
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{successCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Réussies</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/50">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{errorCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Erreurs</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{avgDuration > 0 ? `${avgDuration}ms` : "—"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Durée moyenne</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50">
              <Database className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{totalAlerts}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Alertes générées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logs table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <Database className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Aucun log</p>
            <p className="text-sm">Les logs apparaîtront ici après les exécutions n8n</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Règle
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Alertes
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Durée
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Message
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                    log.status === "error" && "bg-red-50/50 dark:bg-red-950/20"
                  )}
                >
                  <td className="px-5 py-3">
                    {log.status === "success" ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        Succès
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-red-700 dark:text-red-400 text-sm">
                        <XCircle className="h-4 w-4" />
                        Erreur
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {RULES_MAP[log.rule_id] || "Règle inconnue"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {formatTimeAgo(new Date(log.execution_time))}
                      </span>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDateTime(log.execution_time)}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        log.alerts_count > 0 ? "text-amber-600 dark:text-amber-400" : "text-gray-400 dark:text-gray-500"
                      )}
                    >
                      {log.alerts_count > 0 ? `+${log.alerts_count}` : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {log.duration_ms > 0 ? `${log.duration_ms}ms` : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {log.error_message ? (
                      <span className="text-sm text-red-600 dark:text-red-400">{log.error_message}</span>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
