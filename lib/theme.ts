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
      bg: "bg-red-100 dark:bg-red-900/50",
      bgSubtle: "bg-red-50 dark:bg-red-950/50",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
      icon: "text-red-500",
      dot: "bg-red-500",
      hex: "#ef4444",
    },
    warning: {
      bg: "bg-amber-100 dark:bg-amber-900/50",
      bgSubtle: "bg-amber-50 dark:bg-amber-950/50",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
      icon: "text-amber-500",
      dot: "bg-amber-500",
      hex: "#f59e0b",
    },
    info: {
      bg: "bg-blue-100 dark:bg-blue-900/50",
      bgSubtle: "bg-blue-50 dark:bg-blue-950/50",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
      icon: "text-blue-500",
      dot: "bg-blue-500",
      hex: "#3b82f6",
    },
  },

  // Statuts
  status: {
    new: {
      bg: "bg-blue-100 dark:bg-blue-900/50",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
    },
    acknowledged: {
      bg: "bg-amber-100 dark:bg-amber-900/50",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
    },
    resolved: {
      bg: "bg-emerald-100 dark:bg-emerald-900/50",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800",
    },
    dismissed: {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-600 dark:text-gray-400",
      border: "border-gray-200 dark:border-gray-700",
    },
    ignored: {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-600 dark:text-gray-400",
      border: "border-gray-200 dark:border-gray-700",
    },
  },

  // Feedback types
  feedback: {
    bug: {
      bg: "bg-red-100 dark:bg-red-900/50",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-300 dark:border-red-800",
    },
    improvement: {
      bg: "bg-amber-100 dark:bg-amber-900/50",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-300 dark:border-amber-800",
    },
    question: {
      bg: "bg-blue-100 dark:bg-blue-900/50",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-300 dark:border-blue-800",
    },
  },

  // États génériques
  success: {
    bg: "bg-emerald-100 dark:bg-emerald-900/50",
    bgSubtle: "bg-emerald-50 dark:bg-emerald-950/50",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: "text-emerald-500",
    dot: "bg-emerald-500",
    hex: "#10b981",
  },
  error: {
    bg: "bg-red-100 dark:bg-red-900/50",
    bgSubtle: "bg-red-50 dark:bg-red-950/50",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-500",
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
