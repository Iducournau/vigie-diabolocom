// Theme centralisé pour Vigie Diabolocom
// Toutes les couleurs et tokens de design sont définis ici

import { Severity, AlertStatus } from "./types";

// ============================================
// COULEURS SÉMANTIQUES
// ============================================

export const colors = {
  // Sévérités
  severity: {
    critical: {
      bg: "bg-severity-critical",
      bgSubtle: "bg-severity-critical/50",
      text: "text-severity-critical-foreground",
      border: "border-severity-critical-border",
      icon: "text-severity-critical-foreground",
      dot: "bg-severity-critical-foreground",
      hex: "#ef4444",
    },
    warning: {
      bg: "bg-severity-warning",
      bgSubtle: "bg-severity-warning/50",
      text: "text-severity-warning-foreground",
      border: "border-severity-warning-border",
      icon: "text-severity-warning-foreground",
      dot: "bg-severity-warning-foreground",
      hex: "#f59e0b",
    },
    info: {
      bg: "bg-severity-info",
      bgSubtle: "bg-severity-info/50",
      text: "text-severity-info-foreground",
      border: "border-severity-info-border",
      icon: "text-severity-info-foreground",
      dot: "bg-severity-info-foreground",
      hex: "#3b82f6",
    },
  },

  // Statuts
  status: {
    new: {
      bg: "bg-status-new",
      text: "text-status-new-foreground",
      border: "border-status-new",
    },
    acknowledged: {
      bg: "bg-status-ack",
      text: "text-status-ack-foreground",
      border: "border-status-ack",
    },
    resolved: {
      bg: "bg-status-resolved",
      text: "text-status-resolved-foreground",
      border: "border-status-resolved",
    },
    dismissed: {
      bg: "bg-status-dismissed",
      text: "text-status-dismissed-foreground",
      border: "border-status-dismissed",
    },
    ignored: {
      bg: "bg-status-dismissed",
      text: "text-status-dismissed-foreground",
      border: "border-status-dismissed",
    },
  },

  // Feedback types
  feedback: {
    bug: {
      bg: "bg-severity-critical",
      text: "text-severity-critical-foreground",
      border: "border-severity-critical-border",
    },
    improvement: {
      bg: "bg-severity-warning",
      text: "text-severity-warning-foreground",
      border: "border-severity-warning-border",
    },
    question: {
      bg: "bg-severity-info",
      text: "text-severity-info-foreground",
      border: "border-severity-info-border",
    },
  },

  // États génériques
  success: {
    bg: "bg-status-resolved",
    bgSubtle: "bg-status-resolved/50",
    text: "text-status-resolved-foreground",
    border: "border-status-resolved",
    icon: "text-status-resolved-foreground",
    dot: "bg-status-resolved-foreground",
    hex: "#10b981",
  },
  error: {
    bg: "bg-severity-critical",
    bgSubtle: "bg-severity-critical/50",
    text: "text-severity-critical-foreground",
    border: "border-severity-critical-border",
    icon: "text-severity-critical-foreground",
    hex: "#ef4444",
  },

  // Couleurs pour les charts (OKLCH converties en hex)
  chart: {
    critical: "#dc2626", // rouge vif
    warning: "#d97706", // ambre
    info: "#2563eb", // bleu
    success: "#059669", // emerald
    // Couleurs du thème Vega pour séries multiples
    series: ["#dc2626", "#ea580c", "#ca8a04", "#65a30d", "#2563eb"],
  },
} as const;

// ============================================
// HELPERS
// ============================================

export function getSeverityColor(severity: Severity) {
  return colors.severity[severity];
}

export function getStatusColor(status: AlertStatus | string) {
  const normalizedStatus = status === "ignored" ? "dismissed" : status;
  return colors.status[normalizedStatus as keyof typeof colors.status] || colors.status.dismissed;
}

export function getSeverityDot(severity: Severity): string {
  return colors.severity[severity].dot;
}

export function getChartColor(severity: Severity): string {
  return colors.chart[severity];
}
