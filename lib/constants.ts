// Constantes centralisées pour Vigie Diabolocom
// RULES_MAP, CAMPAIGNS_MAP et labels sont définis ici

import { Severity, AlertStatus } from "./types";

// ============================================
// RÈGLES DE DÉTECTION (8 règles)
// ============================================

export const RULES_MAP: Record<string, { name: string; severity: Severity; description: string }> = {
  // Règles originales (5)
  "00097670-06b9-406a-97cc-c8d138448eff": {
    name: "Lead dormant",
    severity: "critical",
    description: "Lead prioritaire sans appel depuis plus de 72h",
  },
  "23934576-a556-4035-8dc8-2d851a86e02e": {
    name: "Rappel oublié",
    severity: "critical",
    description: "RDV programmé sans rappel effectué depuis 48h",
  },
  "59cb9b8e-6916-47f8-898c-c2e18c81f4a6": {
    name: "Unreachable suspect",
    severity: "warning",
    description: "Wrapup Injoignable avec talk_duration > 30s",
  },
  "7caa90f2-9288-4c80-8d6a-6d3078c6a135": {
    name: "Clôture trop rapide",
    severity: "warning",
    description: "Wrapup Perdu/Raccroche avec talk_duration < 10s",
  },
  "c99b95b1-5dd6-48ed-b703-84df70e4eddb": {
    name: "Acharnement",
    severity: "info",
    description: "Lead avec 10+ appels sur 7 jours",
  },
  // Règles Retry en retard (3)
  "a1b2c3d4-1111-4000-8000-000000000001": {
    name: "Retry en retard (léger)",
    severity: "info",
    description: "RDV programmé dépassé de 24h sans rappel",
  },
  "a1b2c3d4-2222-4000-8000-000000000002": {
    name: "Retry en retard (modéré)",
    severity: "warning",
    description: "RDV programmé dépassé de 48h sans rappel",
  },
  "a1b2c3d4-3333-4000-8000-000000000003": {
    name: "Retry en retard (critique)",
    severity: "critical",
    description: "RDV programmé dépassé de 72h sans rappel",
  },
};

// Helper pour récupérer les infos d'une règle
export function getRuleInfo(ruleId: string) {
  return RULES_MAP[ruleId] || { name: "Règle inconnue", severity: "info" as Severity, description: "" };
}

// Liste des IDs de règles pour les filtres
export const RULE_IDS = Object.keys(RULES_MAP);

// ============================================
// CAMPAGNES ADMISSIONS (12)
// ============================================

export const CAMPAIGNS_MAP: Record<string, string> = {
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

// Helper pour récupérer le nom d'une campagne
export function getCampaignName(campaignId: string): string {
  return CAMPAIGNS_MAP[campaignId] || `Campagne ${campaignId}`;
}

// Liste des IDs de campagnes pour les filtres
export const CAMPAIGN_IDS = Object.keys(CAMPAIGNS_MAP);

// ============================================
// LABELS FRANÇAIS
// ============================================

export const STATUS_LABELS: Record<string, string> = {
  new: "Nouvelle",
  open: "Nouvelle",
  acknowledged: "En cours",
  resolved: "Résolue",
  dismissed: "Ignorée",
  ignored: "Ignorée",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: "Critique",
  warning: "Attention",
  info: "Info",
};

export const ACTION_LABELS: Record<string, string> = {
  acknowledged: "Prise en charge",
  resolved: "Marquée résolue",
  ignored: "Ignorée",
  dismissed: "Ignorée",
  reopened: "Réouverte",
};

// ============================================
// HELPERS DE FORMATAGE
// ============================================

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${diffDays}j`;
}

export function formatDateTime(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(seconds: number | undefined): string {
  if (!seconds) return "—";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m${secs > 0 ? ` ${secs}s` : ""}`;
}

export function formatPhone(phone: string): string {
  if (!phone) return "";
  if (phone.startsWith("33")) {
    const digits = phone.slice(2);
    return `+33 ${digits.slice(0, 1)} ${digits.slice(1, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  }
  return phone;
}

// ============================================
// HELPERS DE MAPPING
// ============================================

export function mapStatus(status: string): AlertStatus {
  if (status === "open") return "new";
  if (status === "ignored") return "ignored";
  return status as AlertStatus;
}

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

// ============================================
// SOURCES DE LEADS
// ============================================

export const LEAD_SOURCES: Record<string, { label: string; icon: string; color: string }> = {
  appel_entrant: { label: "Appel entrant", icon: "📞", color: "blue" },
  wordpress: { label: "WordPress", icon: "🌐", color: "purple" },
  ADWORDS: { label: "Google Ads", icon: "🎯", color: "green" },
  facebook: { label: "Facebook", icon: "📘", color: "blue" },
  instagram: { label: "Instagram", icon: "📷", color: "pink" },
  unknown: { label: "Inconnu", icon: "❓", color: "gray" },
};

export function getLeadSourceInfo(source: string | null | undefined) {
  if (!source) return LEAD_SOURCES.unknown;
  return LEAD_SOURCES[source] || { label: source, icon: "📋", color: "gray" };
}
