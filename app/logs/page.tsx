"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, Database, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { styles } from "@/lib/styles";
import { statsCardVariants } from "@/lib/styles";
import { RULES_MAP, getRuleInfo, formatTimeAgo, formatDateTime } from "@/lib/constants";

interface Log {
  id: string;
  rule_id: string;
  execution_time: string;
  status: string;
  alerts_count: number;
  error_message: string | null;
  duration_ms: number;
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
      <div className={styles.loading.wrapper}>
        <Loader2 className={styles.loading.spinner} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={styles.page.title}>Logs</h1>
          <p className={styles.page.subtitle}>
            Historique des synchronisations n8n
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
          Rafraîchir
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={cn("rounded-lg border p-4", statsCardVariants.success.bg, statsCardVariants.success.border)}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", statsCardVariants.success.icon)}>
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className={cn("text-2xl font-semibold", statsCardVariants.success.value)}>{successCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Réussies</p>
            </div>
          </div>
        </div>
        <div className={cn("rounded-lg border p-4", statsCardVariants.critical.bg, statsCardVariants.critical.border)}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", statsCardVariants.critical.icon)}>
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className={cn("text-2xl font-semibold", statsCardVariants.critical.value)}>{errorCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Erreurs</p>
            </div>
          </div>
        </div>
        <div className={cn("rounded-lg border p-4", statsCardVariants.info.bg, statsCardVariants.info.border)}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", statsCardVariants.info.icon)}>
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className={cn("text-2xl font-semibold", statsCardVariants.info.value)}>{avgDuration > 0 ? `${avgDuration}ms` : "—"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Durée moyenne</p>
            </div>
          </div>
        </div>
        <div className={cn("rounded-lg border p-4", statsCardVariants.warning.bg, statsCardVariants.warning.border)}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", statsCardVariants.warning.icon)}>
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className={cn("text-2xl font-semibold", statsCardVariants.warning.value)}>{totalAlerts}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Alertes générées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logs table */}
      <div className={styles.table.wrapper}>
        {logs.length === 0 ? (
          <div className={styles.empty.wrapper}>
            <Database className={styles.empty.icon} />
            <p className={styles.empty.title}>Aucun log</p>
            <p className={styles.empty.description}>Les logs apparaîtront ici après les exécutions n8n</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className={styles.table.header}>
              <tr>
                <th className={styles.table.headerCell}>
                  Statut
                </th>
                <th className={styles.table.headerCell}>
                  Règle
                </th>
                <th className={styles.table.headerCell}>
                  Date
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Alertes
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Durée
                </th>
                <th className={styles.table.headerCell}>
                  Message
                </th>
              </tr>
            </thead>
            <tbody className={styles.table.body}>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className={cn(
                    styles.table.row,
                    log.status === "error" && "bg-red-50/50 dark:bg-red-950/20"
                  )}
                >
                  <td className={styles.table.cell}>
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
                  <td className={styles.table.cell}>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {getRuleInfo(log.rule_id).name}
                    </span>
                  </td>
                  <td className={styles.table.cell}>
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
                  <td className={styles.table.cell}>
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
