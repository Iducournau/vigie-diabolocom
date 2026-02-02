"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SeverityBadge } from "@/components/alert-badge";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { Severity } from "@/lib/types";
import { styles } from "@/lib/styles";
import { RULES_MAP, getRuleInfo } from "@/lib/constants";

// Types
interface Rule {
  id: string;
  name: string;
  description: string;
  technical: string[];
  severity: Severity;
  parameters: Record<string, number>;
  is_active: boolean;
  alert_count: number;
}

// Configuration des règles avec détails techniques
const RULES_CONFIG: Record<string, {
  technical: string[];
  parameters: Record<string, number>;
}> = {
  "00097670-06b9-406a-97cc-c8d138448eff": {
    technical: ["API Diabolocom", "priority = 1", "folder: Admissions"],
    parameters: { hoursThreshold: 72 },
  },
  "23934576-a556-4035-8dc8-2d851a86e02e": {
    technical: ["MySQL call_logs_v3", "wrapup: RDV/SUIVI"],
    parameters: { hoursThreshold: 48 },
  },
  "59cb9b8e-6916-47f8-898c-c2e18c81f4a6": {
    technical: ["MySQL", "wrapup: Répondeur/Injoignable/Faux numéro"],
    parameters: { durationThreshold: 30 },
  },
  "7caa90f2-9288-4c80-8d6a-6d3078c6a135": {
    technical: ["MySQL", "wrapup: Perdu/Pas intéressé/Raccroche"],
    parameters: { durationThreshold: 10 },
  },
  "c99b95b1-5dd6-48ed-b703-84df70e4eddb": {
    technical: ["MySQL GROUP BY", "période: 7 jours"],
    parameters: { callThreshold: 10 },
  },
  "a1b2c3d4-1111-4000-8000-000000000001": {
    technical: ["API Diabolocom", "retryDate dépassé"],
    parameters: { hoursThreshold: 24 },
  },
  "a1b2c3d4-2222-4000-8000-000000000002": {
    technical: ["API Diabolocom", "retryDate dépassé"],
    parameters: { hoursThreshold: 48 },
  },
  "a1b2c3d4-3333-4000-8000-000000000003": {
    technical: ["API Diabolocom", "retryDate dépassé"],
    parameters: { hoursThreshold: 72 },
  },
};

// Composant Badge technique
function TechBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700 mr-1 mb-1">
      {text}
    </span>
  );
}

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

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
      const ruleInfo = getRuleInfo(rule.id);
      const config = RULES_CONFIG[rule.id];

      if (!config) {
        return {
          id: rule.id,
          name: ruleInfo.name,
          description: ruleInfo.description || "Règle personnalisée",
          technical: ["custom"],
          severity: ruleInfo.severity,
          parameters: {},
          is_active: rule.is_active ?? true,
          alert_count: countByRule[rule.id] || 0,
        };
      }

      return {
        id: rule.id,
        name: ruleInfo.name,
        description: ruleInfo.description,
        technical: config.technical,
        severity: ruleInfo.severity,
        parameters: config.parameters,
        is_active: rule.is_active ?? true,
        alert_count: countByRule[rule.id] || 0,
      };
    });

    setRules(transformedRules);
    setLoading(false);
  }

  async function toggleRule(ruleId: string, currentState: boolean) {
    setUpdating(ruleId);

    const { error } = await supabase
      .from("rules")
      .update({ is_active: !currentState })
      .eq("id", ruleId);

    if (error) {
      console.error("Erreur mise à jour:", error);
      setUpdating(null);
      return;
    }

    // Mettre à jour l'état local
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, is_active: !currentState } : rule
      )
    );

    setUpdating(null);
  }

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
      <div>
        <h1 className={styles.page.title}>Règles</h1>
        <p className={styles.page.subtitle}>
          {rules.length} règles de détection configurées
        </p>
      </div>

      {/* Info banner */}
      <div className={styles.banner.info}>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Vous pouvez activer ou désactiver les règles. Pour créer, modifier ou supprimer une règle, contactez le Product Builder.
        </p>
      </div>

      {/* Rules table */}
      <div className={styles.table.wrapper}>
        <table className="w-full">
          <thead className={styles.table.header}>
            <tr>
              <th className={styles.table.headerCell}>
                Règle
              </th>
              <th className={styles.table.headerCell}>
                Technique
              </th>
              <th className={styles.table.headerCell}>
                Sévérité
              </th>
              <th className={styles.table.headerCell}>
                Paramètres
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Alertes
              </th>
              <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Active
              </th>
            </tr>
          </thead>
          <tbody className={styles.table.body}>
            {rules.map((rule) => (
              <tr
                key={rule.id}
                className={`${styles.table.row} ${!rule.is_active ? 'opacity-50' : ''}`}
              >
                {/* Règle: Nom + Description */}
                <td className={styles.table.cell}>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {rule.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-xs">
                    {rule.description}
                  </p>
                </td>

                {/* Technique */}
                <td className={styles.table.cell}>
                  <div className="flex flex-wrap max-w-xs">
                    {rule.technical.map((tech, index) => (
                      <TechBadge key={index} text={tech} />
                    ))}
                  </div>
                </td>

                {/* Sévérité */}
                <td className={styles.table.cell}>
                  <SeverityBadge severity={rule.severity} />
                </td>

                {/* Paramètres */}
                <td className={styles.table.cell}>
                  <code className={styles.code.inline}>
                    {Object.entries(rule.parameters)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ") || "—"}
                  </code>
                </td>

                {/* Alertes */}
                <td className="px-5 py-4 text-right">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {rule.alert_count}
                  </p>
                </td>

                {/* Active */}
                <td className="px-5 py-4 text-center">
                  <Switch
                    checked={rule.is_active}
                    disabled={updating === rule.id}
                    onCheckedChange={() => toggleRule(rule.id, rule.is_active)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Légende */}
      <div className={styles.card.withPadding}>
        <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Comment fonctionnent les règles ?</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>
            Chaque règle analyse les données de Diabolocom pour détecter des anomalies. Une règle désactivée ne génère plus de nouvelles alertes.
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">Sources :</strong> API Diabolocom (leads en temps réel) + MySQL call_logs_v3 (historique appels)
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">Campagnes :</strong> 12 campagnes Admissions surveillées
          </p>
        </div>
      </div>
    </div>
  );
}
