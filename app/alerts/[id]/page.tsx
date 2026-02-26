"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Alert, Severity, AlertStatus } from "@/lib/types";
import { SeverityBadge, StatusBadge } from "@/components/alert-badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Eye,
  RotateCcw,
  Loader2,
  Copy,
  Phone,
  User,
  Calendar,
  AlertCircle,
  Mail,
  Tag,
  Clock,
  Info,
} from "lucide-react";
import {
  getCampaignName,
  ACTION_LABELS,
  mapStatus,
  formatTimeAgo,
  formatDateTime,
  formatPhone,
  getLeadSourceInfo,
  getDotColorByAction,
} from "@/lib/constants";
import { useRules, getRuleInfo } from "@/lib/rules";
import { InfoField } from "@/components/info-field";
import { styles } from "@/lib/styles";
import { cn } from "@/lib/utils";

// Types
interface HistoryEntry {
  id: string;
  action: string;
  previous_status: string;
  new_status: string;
  performed_by: string;
  performed_at: string;
}

interface CallHistoryEntry {
  call_start: string;
  wrapup_name: string;
  talk_duration: number;
  agent: string;
  try_number: number;
}

interface AlertData {
  hoursWithoutCall?: number;
  priority?: number;
  triesNumber?: number;
  callDuration?: number;
  closingCode?: string;
  // Infos contact
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  // Infos agents
  agentName?: string;
  lastAgent?: string;
  createdBy?: string;
  lastUpdatedBy?: string;
  // Dates
  createdAt?: string;
  lastUpdatedAt?: string;
  lastCallTime?: string;
  retryDate?: string;
  // État
  state?: string;
  excludedDetail?: string;
  // Source et historique
  leadSource?: string;
  callHistory?: CallHistoryEntry[];
  // IDs système
  systemId?: string;
  contactId?: string;
  [key: string]: unknown;
}

// Mapping des états Diabolocom
const STATE_LABELS: Record<string, string> = {
  "processing_not_in_progress": "En attente de traitement",
  "processing_in_progress": "En cours de traitement",
  "processed": "Traité",
  "excluded": "Exclu",
};

// getStatusColor removed - using getDotColorByAction from constants instead

interface TransformedAlert extends Omit<Alert, 'data'> {
  data: AlertData;
  campaignId?: string;
}

export default function AlertDetailPage() {
  const params = useParams();
  const alertId = params.id as string;
  const { rulesMap, loading: rulesLoading } = useRules();

  const [alert, setAlert] = useState<TransformedAlert | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié !`, {
      description: text.length > 30 ? text.slice(0, 30) + "..." : text,
    });
  }

  async function fetchAlert() {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("id", alertId)
      .single();

    if (error) {
      setError("Alerte introuvable");
      setLoading(false);
      return;
    }

    // Maintenant les données viennent des colonnes directes
    const ruleInfo = getRuleInfo(rulesMap, data.rule_id);

    const createdAt = new Date(data.created_at_lead || data.detected_at);
    const now = new Date();
    const hoursWithoutCall = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));

    // Parse call_history si présent
    let callHistory = [];
    if (data.call_history) {
      try {
        const parsed = typeof data.call_history === "string" ? JSON.parse(data.call_history) : data.call_history;
        callHistory = parsed.callHistory || parsed || [];
      } catch (e) {
        console.error("Failed to parse call_history:", e);
      }
    }

    const transformed: TransformedAlert = {
      id: data.id,
      ruleId: data.rule_id,
      ruleName: ruleInfo.name,
      severity: ruleInfo.severity,
      status: mapStatus(data.status),
      contactId: data.contact_id,
      campaign: getCampaignName(data.campaign),
      campaignId: data.campaign,
      detectedAt: new Date(data.detected_at),
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
      resolvedBy: data.resolved_by || undefined,
      data: {
        hoursWithoutCall,
        priority: data.priority,
        triesNumber: data.tries_number,
        // Infos contact
        firstName: data.first_name || undefined,
        lastName: data.last_name || undefined,
        fullName: data.full_name || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        // Infos agents
        agentName: data.agent_name || undefined,
        lastAgent: data.agent_name || undefined,
        createdBy: data.createdBy || undefined,
        lastUpdatedBy: data.last_updated_at || undefined,
        // Dates
        createdAt: data.created_at_lead || undefined,
        lastUpdatedAt: data.last_updated_at || undefined,
        lastCallTime: data.last_call_time || undefined,
        retryDate: data.retry_date || undefined,
        // État
        state: data.state || undefined,
        excludedDetail: data.excluded_detail || undefined,
        // Source
        leadSource: data.lead_source || undefined,
        // Historique
        callHistory,
        // IDs
        systemId: data.system_id || undefined,
        contactId: data.contact_id || undefined,
      },
    };

    setAlert(transformed);
    setLoading(false);
  }

  async function fetchHistory() {
    const { data, error } = await supabase
      .from("alert_history")
      .select("*")
      .eq("alert_id", alertId)
      .order("performed_at", { ascending: true });

    if (!error && data) {
      setHistory(data);
    }
  }

  useEffect(() => {
    if (!rulesLoading) {
      fetchAlert();
      fetchHistory();
    }
  }, [alertId, rulesLoading]);

  async function updateStatus(newStatus: "open" | "acknowledged" | "resolved" | "ignored", action: string) {
    if (!alert) return;
    setUpdating(true);
    
    const previousStatus = alert.status === "new" ? "open" : alert.status;
    const updateData: Record<string, unknown> = { status: newStatus };
    
    if (newStatus === "resolved") {
      updateData.resolved_at = new Date().toISOString();
      updateData.resolved_by = "Utilisateur";
    } else if (newStatus === "open") {
      updateData.resolved_at = null;
      updateData.resolved_by = null;
    }

    const { error: updateError } = await supabase
      .from("alerts")
      .update(updateData)
      .eq("id", alertId);

    if (updateError) {
      console.error("Erreur mise à jour:", updateError);
      toast.error("Erreur lors de la mise à jour");
      setUpdating(false);
      return;
    }

    const { error: historyError } = await supabase
      .from("alert_history")
      .insert({
        alert_id: alertId,
        action: action,
        previous_status: previousStatus,
        new_status: newStatus,
        performed_by: "Utilisateur",
      });

    if (historyError) {
      console.error("Erreur historique:", historyError);
    }

    const actionLabels: Record<string, string> = {
      acknowledged: "Alerte prise en charge",
      resolved: "Alerte marquée comme résolue",
      ignored: "Alerte ignorée",
      reopened: "Alerte réouverte",
    };
    toast.success(actionLabels[action] || "Alerte mise à jour");

    await fetchAlert();
    await fetchHistory();
    setUpdating(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="space-y-6">
        <Link href="/alerts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux alertes
          </Button>
        </Link>
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <p className="text-muted-foreground">{error || "Alerte introuvable."}</p>
        </div>
      </div>
    );
  }

  const ruleInfo = getRuleInfo(rulesMap, alert.ruleId);

  return (
    <div className="space-y-6">
      <Link href="/alerts">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux alertes
        </Button>
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className={styles.page.title}>{alert.ruleName}</h1>
            <SeverityBadge severity={alert.severity} />
            <StatusBadge status={alert.status} />
          </div>
          <p className={cn(styles.page.subtitle, "mt-1")}>
            {alert.data.fullName || (alert.data.firstName && alert.data.lastName && `${alert.data.firstName} ${alert.data.lastName}`) ? (
              <>
                {alert.data.fullName || `${alert.data.firstName} ${alert.data.lastName}`} • Contact #{alert.contactId} • {alert.campaign}
              </>
            ) : (
              <>
                Contact #{alert.contactId} • {alert.campaign}
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {alert.status === "new" && (
            <>
              <Button
                size="sm"
                onClick={() => updateStatus("acknowledged", "acknowledged")}
                disabled={updating}
              >
                {updating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                Prendre en charge
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateStatus("ignored", "ignored")}
                disabled={updating}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Ignorer
              </Button>
            </>
          )}
          {alert.status === "acknowledged" && (
            <>
              <Button
                size="sm"
                onClick={() => updateStatus("resolved", "resolved")}
                disabled={updating}
              >
                {updating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Marquer résolu
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateStatus("ignored", "ignored")}
                disabled={updating}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Ignorer
              </Button>
            </>
          )}
          {(alert.status === "resolved" || alert.status === "ignored") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStatus("open", "reopened")}
              disabled={updating}
            >
              {updating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-2" />}
              Rouvrir
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Infos Prospect */}
          <div className={styles.card.withPadding}>
            <h2 className="font-medium text-foreground mb-3">Informations du prospect</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(alert.data.fullName || (alert.data.firstName && alert.data.lastName)) && (
                <InfoField
                  icon={User}
                  iconColor="indigo"
                  label="Nom"
                  value={alert.data.fullName || `${alert.data.firstName} ${alert.data.lastName}`}
                />
              )}
              {alert.data.email && (
                <InfoField
                  icon={Mail}
                  iconColor="emerald"
                  label="Email"
                  value={alert.data.email}
                />
              )}
              {alert.data.phone && (
                <InfoField
                  icon={Phone}
                  iconColor="blue"
                  label="Téléphone"
                  value={formatPhone(alert.data.phone)}
                />
              )}
              {alert.campaign && (
                <InfoField
                  icon={Tag}
                  iconColor="purple"
                  label="Campagne"
                  value={alert.campaign}
                />
              )}
              {alert.data.createdBy && (
                <InfoField
                  icon={User}
                  iconColor="green"
                  label="Créé par"
                  value={alert.data.createdBy}
                />
              )}
              {alert.data.createdAt && (
                <InfoField
                  icon={Calendar}
                  iconColor="amber"
                  label="Fiche créée dans Diabolocom le"
                  value={formatDateTime(alert.data.createdAt)}
                />
              )}
              {alert.data.lastCallTime && (
                <InfoField
                  icon={Phone}
                  iconColor="cyan"
                  label="Dernier appel"
                  value={formatDateTime(alert.data.lastCallTime)}
                />
              )}
              {alert.data.state && (
                <InfoField
                  icon={AlertCircle}
                  iconColor="gray"
                  label="État"
                  value={STATE_LABELS[alert.data.state] || alert.data.state}
                />
              )}
              {alert.data.excludedDetail && (
                <InfoField
                  icon={XCircle}
                  iconColor="red"
                  label="Raison exclusion"
                  value={alert.data.excludedDetail}
                />
              )}
            </div>
          </div>

          {/* Grid: Informations Diabolocom + Historique des appels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations Diabolocom */}
            <div className={styles.card.withPadding}>
              <h2 className="font-medium text-foreground mb-3">Informations Diabolocom</h2>
              <dl className="space-y-3">
                {alert.contactId && (
                  <div className="flex justify-between items-center">
                    <dt className="text-xs text-muted-foreground">Contact ID</dt>
                    <dd className="flex items-center gap-1">
                      <span className="text-sm font-mono text-foreground">{alert.contactId}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(alert.contactId, "Contact ID")}
                        title="Copier le Contact ID"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </dd>
                  </div>
                )}
                {(alert.data.agentName || alert.data.lastAgent) && (
                  <div className="flex justify-between items-start">
                    <dt className="text-xs text-muted-foreground">Agent</dt>
                    <dd className="text-sm text-right text-foreground">{alert.data.agentName || alert.data.lastAgent}</dd>
                  </div>
                )}
                {alert.campaignId && (
                  <div className="flex justify-between items-start">
                    <dt className="text-xs text-muted-foreground">Campaign ID</dt>
                    <dd className="text-sm text-right text-foreground">{alert.campaignId}</dd>
                  </div>
                )}
                {alert.data.leadSource && (
                  <div className="flex justify-between items-start">
                    <dt className="text-xs text-muted-foreground">Provenance</dt>
                    <dd className="text-sm text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-base">{getLeadSourceInfo(alert.data.leadSource).icon}</span>
                        <span className="text-sm text-foreground">
                          {getLeadSourceInfo(alert.data.leadSource).label}
                        </span>
                      </div>
                    </dd>
                  </div>
                )}
                {alert.data.systemId && (
                  <div className="flex justify-between items-center">
                    <dt className="text-xs text-muted-foreground">System ID</dt>
                    <dd className="flex items-center gap-1">
                      <span className="text-sm font-mono text-foreground">{alert.data.systemId}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(alert.data.systemId!, "System ID")}
                        title="Copier le System ID"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Historique des appels */}
            <div className={styles.card.withPadding}>
              <h2 className="font-medium text-foreground mb-3">Historique des appels</h2>
              {alert.data.callHistory && alert.data.callHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Wrapup</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Durée</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Agent</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Essai #</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alert.data.callHistory.map((call, index) => (
                        <tr key={index} className="border-b border-border last:border-0">
                          <td className="px-5 py-4 text-sm text-foreground whitespace-nowrap">
                            {call.call_start ? formatDateTime(call.call_start) : "—"}
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-foreground">
                              {call.wrapup_name || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {call.talk_duration !== undefined ? `${call.talk_duration}s` : "—"}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-foreground">{call.agent || "—"}</td>
                          <td className="px-5 py-4 text-sm text-foreground">{call.try_number !== undefined ? call.try_number : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4">Aucun appel effectué.</p>
              )}
            </div>
          </div>


          <div className={styles.card.withPadding}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium text-foreground">Données brutes</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(alert, null, 2), "Données brutes")}
                title="Copier le JSON"
              >
                <Copy className="h-3 w-3 mr-2" />
                Copier
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto text-foreground">
              {JSON.stringify(alert, null, 2)}
            </pre>
          </div>
        </div>

        <div className="space-y-6">
          <div className={styles.card.withPadding}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium text-foreground">Détails de l&apos;alerte</h2>
              <SeverityBadge severity={ruleInfo.severity} />
            </div>
            <dl className="space-y-3">
              <div className="flex justify-between items-center">
                <dt className="text-xs text-muted-foreground">Règle</dt>
                <dd className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-foreground">{ruleInfo.name}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{ruleInfo.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-xs text-muted-foreground">ID Alerte</dt>
                <dd className="flex items-center gap-1">
                  <span className="text-sm font-mono text-foreground">{alert.id.slice(0, 8)}...</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(alert.id, "ID Alerte")}
                    title="Copier l'ID complet"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </dd>
              </div>
              <div className="flex justify-between items-start">
                <dt className="text-xs text-muted-foreground">Date de détection</dt>
                <dd className="text-right">
                  <div className="text-sm text-foreground">{formatDateTime(alert.detectedAt)}</div>
                  <div className="text-xs text-muted-foreground">{formatTimeAgo(alert.detectedAt)}</div>
                </dd>
              </div>
            </dl>
          </div>

          <div className={styles.card.withPadding}>
            <h2 className="font-medium text-foreground mb-3">Métriques du lead</h2>
            <dl className="space-y-3">
              {alert.data.priority !== undefined && (
                <div className="flex justify-between">
                  <dt className="text-xs text-muted-foreground">Priorité</dt>
                  <dd className="text-sm text-foreground font-medium">{alert.data.priority}</dd>
                </div>
              )}
              {alert.data.createdAt && (
                <div className="flex justify-between items-start">
                  <dt className="text-xs text-muted-foreground">Date création lead</dt>
                  <dd className="text-sm text-right text-foreground">{formatDateTime(alert.data.createdAt)}</dd>
                </div>
              )}
              {alert.data.hoursWithoutCall !== undefined && (
                <div className="flex justify-between">
                  <dt className="text-xs text-muted-foreground">Temps sans appels</dt>
                  <dd className="text-sm text-foreground font-medium">{alert.data.hoursWithoutCall}h</dd>
                </div>
              )}
              {alert.data.callDuration !== undefined && (
                <div className="flex justify-between">
                  <dt className="text-xs text-muted-foreground">Durée dernier appel</dt>
                  <dd className="text-sm text-foreground">{alert.data.callDuration}s</dd>
                </div>
              )}
              {alert.data.closingCode && (
                <div className="flex justify-between items-start">
                  <dt className="text-xs text-muted-foreground">Code de clôture</dt>
                  <dd className="text-sm text-right text-foreground">{alert.data.closingCode}</dd>
                </div>
              )}
              {alert.data.triesNumber !== undefined && (
                <div className="flex justify-between">
                  <dt className="text-xs text-muted-foreground">Tentatives</dt>
                  <dd className="text-sm text-foreground">{alert.data.triesNumber}</dd>
                </div>
              )}
              {alert.data.retryDate && (
                <div className="flex justify-between items-start">
                  <dt className="text-xs text-muted-foreground">Date de retry</dt>
                  <dd className="text-sm text-right text-foreground">{formatDateTime(alert.data.retryDate)}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className={styles.card.withPadding}>
            <h2 className="font-medium text-foreground mb-3">Activités</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Alerte détectée</p>
                  <p className="text-xs text-muted-foreground">{formatTimeAgo(alert.detectedAt)}</p>
                </div>
              </div>

              {history.map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full ${getDotColorByAction(entry.action)} mt-2 shrink-0`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {ACTION_LABELS[entry.action] || entry.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.performed_by} • {formatTimeAgo(new Date(entry.performed_at))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
