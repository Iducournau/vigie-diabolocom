"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Severity } from "@/lib/types";

// Interface Rule pour les données Supabase
export interface Rule {
  id: string;
  name: string;
  description: string;
  rule_type: string;
  severity: Severity;
  conditions: Record<string, unknown> | null;
  is_active: boolean;
}

// Map de règles indexée par ID
export type RulesMap = Record<string, Rule>;

// Cache mémoire
let cachedRules: Rule[] | null = null;
let cachedRulesMap: RulesMap | null = null;
let fetchPromise: Promise<Rule[]> | null = null;

// Dériver la sévérité depuis le rule_type (fallback si severity est null en BDD)
// Note : les vrais rule_type en BDD sont "traitement", "cloture", "retry_late"
// Ce fallback est imprécis car plusieurs sévérités partagent le même rule_type.
// Préférer renseigner la colonne severity directement en BDD.
function deriveSeverity(ruleType: string): Severity {
  const severityMap: Record<string, Severity> = {
    traitement: "critical",
    cloture: "warning",
    retry_late: "warning",
  };
  return severityMap[ruleType] || "info";
}

// Fetch les règles depuis Supabase (avec déduplication)
async function fetchRulesFromSupabase(): Promise<Rule[]> {
  const { data, error } = await supabase
    .from("rules")
    .select("*")
    .order("name");

  if (error) {
    console.error("Erreur fetch rules:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description || "",
    rule_type: row.rule_type || "",
    severity: (row.severity as Severity) || deriveSeverity(row.rule_type || ""),
    conditions: row.conditions || null,
    is_active: row.is_active ?? true,
  }));
}

// Construire le map depuis le tableau
function buildRulesMap(rules: Rule[]): RulesMap {
  const map: RulesMap = {};
  for (const rule of rules) {
    map[rule.id] = rule;
  }
  return map;
}

// Hook principal
export function useRules() {
  const [rules, setRules] = useState<Rule[]>(cachedRules || []);
  const [rulesMap, setRulesMap] = useState<RulesMap>(cachedRulesMap || {});
  const [loading, setLoading] = useState(!cachedRules);

  useEffect(() => {
    if (cachedRules && cachedRulesMap) {
      setRules(cachedRules);
      setRulesMap(cachedRulesMap);
      setLoading(false);
      return;
    }

    // Déduplication : si un fetch est déjà en cours, on attend le même
    if (!fetchPromise) {
      fetchPromise = fetchRulesFromSupabase();
    }

    fetchPromise
      .then((fetchedRules) => {
        const map = buildRulesMap(fetchedRules);
        cachedRules = fetchedRules;
        cachedRulesMap = map;
        setRules(fetchedRules);
        setRulesMap(map);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur useRules:", err);
        setLoading(false);
      })
      .finally(() => {
        fetchPromise = null;
      });
  }, []);

  return { rules, rulesMap, loading };
}

// Helper pour récupérer les infos d'une règle à partir du map
export function getRuleInfo(
  rulesMap: RulesMap,
  ruleId: string
): { name: string; severity: Severity; description: string } {
  const rule = rulesMap[ruleId];
  if (rule) {
    return { name: rule.name, severity: rule.severity, description: rule.description };
  }
  return { name: "Règle inconnue", severity: "info" as Severity, description: "" };
}

// Invalider le cache (utile après modification des règles)
export function invalidateRulesCache() {
  cachedRules = null;
  cachedRulesMap = null;
  fetchPromise = null;
}
