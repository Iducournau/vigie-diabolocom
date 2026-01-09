import { syncLogs, formatTimeAgo } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, Database } from "lucide-react";

export default function LogsPage() {
  const successCount = syncLogs.filter((l) => l.status === "success").length;
  const errorCount = syncLogs.filter((l) => l.status === "error").length;
  const avgDuration = Math.round(
    syncLogs
      .filter((l) => l.status === "success")
      .reduce((sum, l) => sum + l.durationMs, 0) / successCount
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Logs</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Historique des synchronisations avec Diabolocom
        </p>
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
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{avgDuration}ms</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Durée moyenne</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50">
              <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">5 min</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Intervalle</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logs table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Source
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Records
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
            {syncLogs.map((log) => (
              <tr
                key={log.id}
                className={cn(
                  "hover:bg-gray-50 dark:hover:bg-gray-800/50",
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
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {log.source === "diabolocom_api" ? "API Diabolocom" : "MySQL"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{formatTimeAgo(log.createdAt)}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{log.recordsFetched}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      log.alertsGenerated > 0 ? "text-amber-600 dark:text-amber-400" : "text-gray-400 dark:text-gray-500"
                    )}
                  >
                    {log.alertsGenerated > 0 ? `+${log.alertsGenerated}` : "—"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{log.durationMs}ms</span>
                </td>
                <td className="px-5 py-3">
                  {log.errorMessage ? (
                    <span className="text-sm text-red-600 dark:text-red-400">{log.errorMessage}</span>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900 rounded-lg p-4">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          <strong>Note :</strong> Ces logs sont simulés. En production, ils seront alimentés par n8n.
        </p>
      </div>
    </div>
  );
}
