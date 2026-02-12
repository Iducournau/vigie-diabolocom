// Styles centralisés pour Vigie Diabolocom
// Classes CSS réutilisables pour garantir la cohérence UI

// ============================================
// COMPOSANTS DE BASE
// ============================================

export const styles = {
  // Cards
  card: {
    base: "bg-card rounded-lg border border-border",
    noPadding: "bg-card rounded-lg border border-border",
    withPadding: "bg-card rounded-lg border border-border p-5",
    flat: "bg-card rounded-lg border border-border",
  },

  // Tables
  table: {
    wrapper: "bg-card rounded-lg border border-border overflow-hidden",
    header: "bg-muted border-b border-border",
    headerCell: "text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider",
    body: "divide-y divide-border",
    row: "hover:bg-muted/50 transition-colors",
    cell: "px-5 py-4",
  },

  // Headers de page
  page: {
    title: "text-2xl font-semibold text-foreground",
    subtitle: "text-muted-foreground mt-1 text-sm",
  },

  // Badges
  badge: {
    base: "px-2 py-1 text-xs font-medium rounded-full border",
  },

  // Infos/Banners
  banner: {
    info: "bg-severity-info/50 border border-severity-info-border rounded-lg p-4",
    warning: "bg-severity-warning/50 border border-severity-warning-border rounded-lg p-4",
    error: "bg-severity-critical/50 border border-severity-critical-border rounded-lg p-4",
    success: "bg-status-resolved/50 border border-status-resolved rounded-lg p-4",
  },

  // Textes
  text: {
    primary: "text-foreground",
    secondary: "text-muted-foreground",
    muted: "text-muted-foreground",
    link: "text-foreground hover:underline",
  },

  // Inputs
  input: {
    base: "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-interactive-accent focus:outline-none focus:ring-1 focus:ring-interactive-accent",
  },

  // Dropdown menu
  dropdown: {
    content: "bg-card border border-border shadow-lg",
  },

  // Empty states
  empty: {
    wrapper: "p-12 text-center text-muted-foreground",
    icon: "h-10 w-10 mx-auto mb-3 opacity-50",
    title: "font-medium",
    description: "text-sm",
  },

  // Loading states
  loading: {
    wrapper: "flex items-center justify-center h-64",
    spinner: "h-8 w-8 animate-spin text-muted-foreground",
  },

  // Code blocks
  code: {
    inline: "text-xs bg-muted px-2 py-1 rounded text-muted-foreground",
    block: "bg-muted p-4 rounded-lg text-xs overflow-x-auto text-foreground",
  },

  // Icon containers
  iconBox: {
    base: "p-2 rounded-lg",
    sm: "p-1.5 rounded-lg",
    lg: "p-2.5 rounded-lg",
  },

  // Tooltips (Recharts)
  tooltip: {
    container: "bg-card border border-border rounded-lg shadow-lg p-3",
  },
} as const;

// ============================================
// VARIANTS POUR STATS CARDS
// ============================================

export const statsCardVariants = {
  critical: {
    bg: "bg-card",
    border: "border-border",
    icon: "text-severity-critical-foreground bg-severity-critical",
    value: "text-foreground",
  },
  warning: {
    bg: "bg-card",
    border: "border-border",
    icon: "text-severity-warning-foreground bg-severity-warning",
    value: "text-foreground",
  },
  info: {
    bg: "bg-card",
    border: "border-border",
    icon: "text-severity-info-foreground bg-severity-info",
    value: "text-foreground",
  },
  success: {
    bg: "bg-card",
    border: "border-border",
    icon: "text-status-resolved-foreground bg-status-resolved",
    value: "text-foreground",
  },
  default: {
    bg: "bg-card",
    border: "border-border",
    icon: "text-muted-foreground bg-muted",
    value: "text-foreground",
  },
} as const;

export type StatsCardVariant = keyof typeof statsCardVariants;
