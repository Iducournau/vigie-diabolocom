"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SeverityBadge } from "@/components/alert-badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings2, Plus, Loader2 } from "lucide-react";
import { Severity } from "@/lib/types";

// Types
interface Rule {
  id: string;
  name: string;
  description: string;
  rule_type: string;
  severity: Severity;
  parameters: Record<string, number>;
  is_active: boolean;
  alert_count: number;
}

// Mapping des règles avec leurs paramètres, sévérité et descriptions techniques
const RULES_CONFIG: Record<string, { 
  severity: Severity; 
  parameters: Record<string, number>;
  description: string;
}> = {
  "00097670-06b9-406a-97cc-c8d138448eff": { 
    severity: "critical", 
    parameters: { hoursThreshold: 72 },
    description: "Lead priorité 1 sans appel depuis 72h+ (API Diabolocom, folder Admissions)"
  },
  "23934576-a556-4035-8dc8-2d851a86e02e": { 
    severity: "critical", 
    parameters: { hoursThreshold: 48 },
    description: "Wrapup RDV/SUIVI/Rappel sans nouvel appel depuis 48h (MySQL call_logs_v3)"
  },
  "59cb9b8e-6916-47f8-898c-c2e18c81f4a6": { 
    severity: "warning", 
    parameters: { durationThreshold: 30 },
    description: "Wrapup Injoignable/Répondeur/Faux numéro avec talk_duration > 30s (MySQL)"
  },
  "7caa90f2-9288-4c80-8d6a-6d3078c6a135": { 
    severity: "warning", 
    parameters: { durationThreshold: 10 },
    description: "Wrapup Perdu/Pas intéressé/Raccroche avec talk_duration < 10s (MySQL)"
  },
  "c99b95b1-5dd6-48ed-b703-84df70e4eddb": { 
    severity: "info", 
    parameters: { callThreshold: 10 },
    description: "Lead avec 10+ appels sur 7 jours sans clôture définitive (MySQL GROUP BY)"
  },
};

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRules() {
      setLoading(true);

      // Récupérer les règles
      const { data: rulesData, error: rulesError } = await supabase
        .from("rules")
        .select("*")
        .order("name");

      if (rulesError) {
        console.error("Erreur rules:", rulesError);
        setLoading(false);
        return;
      }

      // Récupérer le nombre d'alertes par règle
      const { data: alertCounts, error: alertError } = await supabase
        .from("alerts")
        .select("rule_id")
        .eq("status", "open");

      if (alertError) {
        console.error("Erreur alerts:", alertError);
      }

      // Compter les alertes par rule_id
      const countByRule: Record<string, number> = {};
      (alertCounts || []).forEach((alert) => {
        countByRule[alert.rule_id] = (countByRule[alert.rule_id] || 0) + 1;
      });

      // Transformer les données
      const transformedRules: Rule[] = (rulesData || []).map((rule) => {
        const config = RULES_CONFIG[rule.id] || { 
          severity: "info", 
          parameters: {},
          description: rule.description || "Règle personnalisée"
        };
        return {
          id: rule.id,
          name: rule.name,
          description: config.description,
          rule_type: rule.rule_type,
          severity: config.severity,
          parameters: config.parameters,
          is_active: true, // V1: toutes actives
          alert_count: countByRule[rule.id] || 0,
        };
      });

      setRules(transformedRules);
      setLoading(false);
    }

    fetchRules();
  }, []);

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
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-md">{rule.description}</p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <SeverityBadge severity={rule.severity} />
                </td>
                <td className="px-5 py-4">
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                    {Object.entries(rule.parameters)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ") || "—"}
                  </code>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {rule.alert_count}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <Switch checked={rule.is_active} disabled />
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
            <strong className="text-gray-700 dark:text-gray-300">Sources :</strong> API Diabolocom (leads en temps réel) + MySQL call_logs_v3 (historique appels)
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">Fréquence :</strong> Exécution toutes les 5 minutes via n8n
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">Campagnes :</strong> 12 campagnes Admissions (IDs: 5612, 5927, 5920, 5622, 5611, 5621, 5580, 6064, 6051, 6046, 6050, 6082)
          </p>
        </div>
      </div>
    </div>
  );
}