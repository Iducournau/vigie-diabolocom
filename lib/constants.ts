// Constantes centralisées pour Vigie Diabolocom
// CAMPAIGNS_MAP et labels sont définis ici
// Note: RULES_MAP a été migré vers lib/rules.ts (useRules hook)

import { Severity, AlertStatus } from "./types";

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

// ============================================
// HELPERS POUR UI
// ============================================

/**
 * Retourne la classe Tailwind pour le dot de timeline selon l'action
 */
export function getDotColorByAction(action: string): string {
  switch (action) {
    case "acknowledged":
      return "bg-blue-500";
    case "resolved":
      return "bg-emerald-500";
    case "ignored":
    case "dismissed":
      return "bg-gray-400";
    case "reopened":
      return "bg-amber-500";
    default:
      return "bg-amber-500"; // detected
  }
}
