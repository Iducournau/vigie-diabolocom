// Styles centralisés pour Vigie Diabolocom
// Classes CSS réutilisables pour garantir la cohérence UI

// ============================================
// COMPOSANTS DE BASE
// ============================================

export const styles = {
  // Cards
  card: {
    base: "bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800",
    noPadding: "bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800",
    withPadding: "bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5",
    flat: "bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800",
  },

  // Tables
  table: {
    wrapper: "bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden",
    header: "bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",
    headerCell: "text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
    body: "divide-y divide-gray-100 dark:divide-gray-800",
    row: "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
    cell: "px-5 py-4",
  },

  // Headers de page
  page: {
    title: "text-2xl font-semibold text-gray-900 dark:text-gray-100",
    subtitle: "text-gray-500 dark:text-gray-400 mt-1 text-sm",
  },

  // Badges
  badge: {
    base: "px-2 py-1 text-xs font-medium rounded-full border",
  },

  // Infos/Banners
  banner: {
    info: "bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-lg p-4",
    warning: "bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900 rounded-lg p-4",
    error: "bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900 rounded-lg p-4",
    success: "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 rounded-lg p-4",
  },

  // Textes
  text: {
    primary: "text-gray-900 dark:text-gray-100",
    secondary: "text-gray-600 dark:text-gray-400",
    muted: "text-gray-500 dark:text-gray-400",
    link: "text-gray-900 dark:text-gray-100 hover:underline",
  },

  // Inputs
  input: {
    base: "w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500",
  },

  // Dropdown menu
  dropdown: {
    content: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg",
  },

  // Empty states
  empty: {
    wrapper: "p-12 text-center text-gray-500 dark:text-gray-400",
    icon: "h-10 w-10 mx-auto mb-3 opacity-50",
    title: "font-medium",
    description: "text-sm",
  },

  // Loading states
  loading: {
    wrapper: "flex items-center justify-center h-64",
    spinner: "h-8 w-8 animate-spin text-gray-400",
  },

  // Code blocks
  code: {
    inline: "text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400",
    block: "bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-xs overflow-x-auto text-gray-700 dark:text-gray-300",
  },

  // Icon containers
  iconBox: {
    base: "p-2 rounded-lg",
    sm: "p-1.5 rounded-lg",
    lg: "p-2.5 rounded-lg",
  },

  // Tooltips (Recharts)
  tooltip: {
    container: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3",
  },
} as const;

// ============================================
// VARIANTS POUR STATS CARDS
// ============================================

export const statsCardVariants = {
  critical: {
    bg: "bg-white dark:bg-gray-900",
    border: "border-gray-200 dark:border-gray-800",
    icon: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/50",
    value: "text-gray-900 dark:text-gray-100",
  },
  warning: {
    bg: "bg-white dark:bg-gray-900",
    border: "border-gray-200 dark:border-gray-800",
    icon: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/50",
    value: "text-gray-900 dark:text-gray-100",
  },
  info: {
    bg: "bg-white dark:bg-gray-900",
    border: "border-gray-200 dark:border-gray-800",
    icon: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/50",
    value: "text-gray-900 dark:text-gray-100",
  },
  success: {
    bg: "bg-white dark:bg-gray-900",
    border: "border-gray-200 dark:border-gray-800",
    icon: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/50",
    value: "text-gray-900 dark:text-gray-100",
  },
  default: {
    bg: "bg-white dark:bg-gray-900",
    border: "border-gray-200 dark:border-gray-800",
    icon: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800",
    value: "text-gray-900 dark:text-gray-100",
  },
} as const;

export type StatsCardVariant = keyof typeof statsCardVariants;
