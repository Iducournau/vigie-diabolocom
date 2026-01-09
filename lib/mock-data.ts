// Données mockées pour le développement
import { Alert, Rule, SyncLog, Campaign, DashboardStats } from "./types";

// Campagnes Diabolocom (basées sur le brief)
export const campaigns: Campaign[] = [
  { id: "1", name: "CA - Céramiste Fleuriste", formations: ["CAP Fleuriste", "CAP Céramiste"] },
  { id: "2", name: "CA - Excel et Formateur", formations: ["Excel", "Devenir Formateur"] },
  { id: "3", name: "CA - Métiers de Bouche", formations: ["CAP Cuisine", "CAP Pâtissier", "CAP Boulanger"] },
  { id: "4", name: "CA - Métiers de la Beauté", formations: ["CAP Esthétique", "CAP Coiffure", "Prothésiste Ongulaire", "Maquillage Pro"] },
  { id: "5", name: "CA - Titres Professionnels", formations: ["TP SAMA", "TP EAA", "TP ARH", "TP SC", "TP CA"] },
  { id: "6", name: "Campagne AEPE", formations: ["CAP AEPE", "ATSEM"] },
  { id: "7", name: "Campagne Décorateur Intérieur", formations: ["Décorateur Intérieur"] },
  { id: "8", name: "Campagne Mode", formations: ["CAP Mode"] },
  { id: "9", name: "Campagne Nutritionniste", formations: ["Nutritionniste"] },
  { id: "10", name: "CAP MIS Electricien", formations: ["CAP Electricien"] },
  { id: "11", name: "Formation Métiers Animaliers", formations: ["Métiers Animaliers", "ACACED Chien", "ACACED Chat", "ACACED NAC"] },
];

// Règles de détection V1
export const rules: Rule[] = [
  {
    id: "r1",
    name: "Lead fantôme",
    description: "Lead en priorité 1 avec 0 appel depuis plus de X heures",
    severity: "critical",
    logicType: "lead_not_called",
    parameters: { hoursThreshold: 24 },
    isActive: true,
    createdAt: new Date("2026-01-09"),
  },
  {
    id: "r2",
    name: "Injoignable suspect",
    description: "Code 'unreachable' mais durée d'appel supérieure à X secondes",
    severity: "warning",
    logicType: "unreachable_long_call",
    parameters: { durationThreshold: 30 },
    isActive: true,
    createdAt: new Date("2026-01-09"),
  },
  {
    id: "r3",
    name: "Argued express",
    description: "Code 'argued' (perdu) avec durée d'appel inférieure à X secondes",
    severity: "warning",
    logicType: "argued_short_call",
    parameters: { durationThreshold: 10 },
    isActive: true,
    createdAt: new Date("2026-01-09"),
  },
  {
    id: "r4",
    name: "Lead en boucle",
    description: "Lead avec plus de X appels sans issue finale",
    severity: "info",
    logicType: "lead_loop",
    parameters: { callThreshold: 10 },
    isActive: true,
    createdAt: new Date("2026-01-09"),
  },
  {
    id: "r5",
    name: "Rappel oublié",
    description: "Code 'tocall' mais dernier appel il y a plus de X heures",
    severity: "warning",
    logicType: "forgotten_callback",
    parameters: { hoursThreshold: 48 },
    isActive: true,
    createdAt: new Date("2026-01-09"),
  },
];

// Alertes mockées
export const alerts: Alert[] = [
  {
    id: "a1",
    ruleId: "r1",
    ruleName: "Lead fantôme",
    leadId: "45231",
    campaign: "CA - Métiers de la Beauté",
    severity: "critical",
    status: "new",
    data: { priority: 1, callCount: 0, hoursWithoutCall: 26 },
    detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2h
  },
  {
    id: "a2",
    ruleId: "r1",
    ruleName: "Lead fantôme",
    leadId: "44892",
    campaign: "Campagne AEPE",
    severity: "critical",
    status: "new",
    data: { priority: 1, callCount: 0, hoursWithoutCall: 28 },
    detectedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // Il y a 3h
  },
  {
    id: "a3",
    ruleId: "r1",
    ruleName: "Lead fantôme",
    leadId: "45102",
    campaign: "CA - Métiers de Bouche",
    severity: "critical",
    status: "new",
    data: { priority: 1, callCount: 0, hoursWithoutCall: 25 },
    detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: "a4",
    ruleId: "r2",
    ruleName: "Injoignable suspect",
    leadId: "43521",
    campaign: "CA - Titres Professionnels",
    severity: "warning",
    status: "new",
    data: { callDuration: 45, closingCode: "unreachable" },
    detectedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: "a5",
    ruleId: "r2",
    ruleName: "Injoignable suspect",
    leadId: "44201",
    campaign: "Campagne Mode",
    severity: "warning",
    status: "new",
    data: { callDuration: 62, closingCode: "unreachable" },
    detectedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
  },
  {
    id: "a6",
    ruleId: "r3",
    ruleName: "Argued express",
    leadId: "42998",
    campaign: "CA - Céramiste Fleuriste",
    severity: "warning",
    status: "acknowledged",
    data: { callDuration: 5, closingCode: "argued" },
    detectedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: "a7",
    ruleId: "r5",
    ruleName: "Rappel oublié",
    leadId: "41876",
    campaign: "Campagne Nutritionniste",
    severity: "warning",
    status: "new",
    data: { hoursWithoutCall: 52, closingCode: "tocall" },
    detectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: "a8",
    ruleId: "r4",
    ruleName: "Lead en boucle",
    leadId: "40234",
    campaign: "CA - Métiers de la Beauté",
    severity: "info",
    status: "new",
    data: { callCount: 12, priority: 12 },
    detectedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
  {
    id: "a9",
    ruleId: "r1",
    ruleName: "Lead fantôme",
    leadId: "39102",
    campaign: "Formation Métiers Animaliers",
    severity: "critical",
    status: "resolved",
    data: { priority: 1, callCount: 0, hoursWithoutCall: 30 },
    detectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    resolvedBy: "Dev Vigie",
  },
  {
    id: "a10",
    ruleId: "r2",
    ruleName: "Injoignable suspect",
    leadId: "38901",
    campaign: "CAP MIS Electricien",
    severity: "warning",
    status: "resolved",
    data: { callDuration: 38, closingCode: "unreachable" },
    detectedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 44 * 60 * 60 * 1000),
    resolvedBy: "Dev Vigie",
  },
];

// Logs de synchronisation
export const syncLogs: SyncLog[] = [
  {
    id: "s1",
    source: "diabolocom_api",
    status: "success",
    recordsFetched: 234,
    alertsGenerated: 3,
    durationMs: 1250,
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // Il y a 5 min
  },
  {
    id: "s2",
    source: "diabolocom_api",
    status: "success",
    recordsFetched: 228,
    alertsGenerated: 1,
    durationMs: 1180,
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: "s3",
    source: "diabolocom_api",
    status: "success",
    recordsFetched: 241,
    alertsGenerated: 2,
    durationMs: 1320,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: "s4",
    source: "diabolocom_api",
    status: "error",
    recordsFetched: 0,
    alertsGenerated: 0,
    durationMs: 5023,
    errorMessage: "API timeout after 5000ms",
    createdAt: new Date(Date.now() - 20 * 60 * 1000),
  },
  {
    id: "s5",
    source: "diabolocom_api",
    status: "success",
    recordsFetched: 219,
    alertsGenerated: 0,
    durationMs: 980,
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
  },
];

// Stats du dashboard
export const dashboardStats: DashboardStats = {
  critical: alerts.filter((a) => a.severity === "critical" && a.status !== "resolved").length,
  warning: alerts.filter((a) => a.severity === "warning" && a.status !== "resolved").length,
  info: alerts.filter((a) => a.severity === "info" && a.status !== "resolved").length,
  resolved: alerts.filter((a) => a.status === "resolved").length,
  lastSyncAt: syncLogs[0].createdAt,
  lastSyncStatus: syncLogs[0].status,
};

// Helpers
export function getAlertById(id: string): Alert | undefined {
  return alerts.find((a) => a.id === id);
}

export function getRuleById(id: string): Rule | undefined {
  return rules.find((r) => r.id === id);
}

export function getAlertsByStatus(status: Alert["status"]): Alert[] {
  return alerts.filter((a) => a.status === status);
}

export function getAlertsBySeverity(severity: Alert["severity"]): Alert[] {
  return alerts.filter((a) => a.severity === severity);
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${diffDays}j`;
}
