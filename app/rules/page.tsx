"use client";

import { rules, alerts } from "@/lib/mock-data";
import { SeverityBadge } from "@/components/alert-badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings2, Plus } from "lucide-react";

export default function RulesPage() {
  const alertCountByRule = rules.reduce(
    (acc, rule) => {
      acc[rule.id] = alerts.filter((a) => a.ruleId === rule.id).length;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Règles</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {rules.length} règles de détection configurées
          </p>
        </div>
        <Button disabled variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle règle (V2)
        </Button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-lg p-4">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          <strong>V1 :</strong> Les règles sont pré-configurées. La configuration personnalisée arrivera en V2.
        </p>
      </div>

      {/* Rules list */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Règle
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Sévérité
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Paramètres
              </th>
              <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Alertes
              </th>
              <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Active
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rules.map((rule) => (
              <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-5 py-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{rule.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{rule.description}</p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <SeverityBadge severity={rule.severity} />
                </td>
                <td className="px-5 py-4">
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                    {Object.entries(rule.parameters)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ")}
                  </code>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {alertCountByRule[rule.id] || 0}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <Switch checked={rule.isActive} disabled />
                </td>
                <td className="px-5 py-4 text-right">
                  <Button variant="ghost" size="sm" disabled className="text-gray-400 dark:text-gray-500">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rules explanation */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Comment fonctionnent les règles ?</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>
            Chaque règle analyse les données de Diabolocom (API + historique MySQL) pour détecter des anomalies.
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">Fréquence :</strong> Exécution toutes les 5 minutes via n8n.
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">Seuils :</strong> Paramètres configurables (durée, nombre d&apos;appels, etc.)
          </p>
        </div>
      </div>
    </div>
  );
}
