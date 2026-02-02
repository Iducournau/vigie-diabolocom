// Types pour Vigie Diabolocom

export type Severity = "critical" | "warning" | "info";

export type AlertStatus = "new" | "acknowledged" | "resolved" | "ignored" | "dismissed";

export type RuleLogicType =
  | "lead_not_called"
  | "unreachable_long_call"
  | "argued_short_call"
  | "lead_loop"
  | "forgotten_callback";

export interface Rule {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  logicType: RuleLogicType;
  parameters: Record<string, number>;
  isActive: boolean;
  createdAt: Date;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  leadId: string;
  campaign: string;
  severity: Severity;
  status: AlertStatus;
  data: {
    priority?: number;
    callCount?: number;
    callDuration?: number;
    closingCode?: string;
    hoursWithoutCall?: number;
    [key: string]: unknown;
  };
  detectedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface AlertLog {
  id: string;
  alertId: string;
  action: "acknowledged" | "resolved" | "ignored" | "reopened";
  comment?: string;
  userId: string;
  createdAt: Date;
}

export interface SyncLog {
  id: string;
  source: "diabolocom_api" | "mysql";
  status: "success" | "error";
  recordsFetched: number;
  alertsGenerated: number;
  durationMs: number;
  errorMessage?: string;
  createdAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  formations: string[];
}

// Stats pour le dashboard
export interface DashboardStats {
  critical: number;
  warning: number;
  info: number;
  resolved: number;
  lastSyncAt: Date;
  lastSyncStatus: "success" | "error";
}
