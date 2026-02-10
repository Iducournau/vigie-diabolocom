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
  ExternalLink,
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
  RULES_MAP,
  getRuleInfo,
  getCampaignName,
  ACTION_LABELS,
  mapStatus,
  formatTimeAgo,
  formatDateTime,
  formatPhone,
  getLeadSourceInfo,
} from "@/lib/constants";

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

function getStatusColor(status: string): string {
  switch (status) {
    case "acknowledged": return "bg-blue-500";
    case "resolved": return "bg-emerald-500";
    case "ignored": return "bg-gray-400";
    case "reopened": return "bg-amber-500";
    default: return "bg-gray-400";
  }
}

interface TransformedAlert extends Omit<Alert, 'data'> {
  data: AlertData;
  campaignId?: string;
}

export default function AlertDetailPage() {
  const params = useParams();
  const alertId = params.id as string;
  
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
    const ruleInfo = getRuleInfo(data.rule_id);

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
      leadId: data.lead_id,
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
    fetchAlert();
    fetchHistory();
  }, [alertId]);

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
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
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
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">{error || "Alerte introuvable."}</p>
        </div>
      </div>
    );
  }

  const ruleInfo = getRuleInfo(alert.ruleId);

  return (
    <div className="space-y-6">
      <Link href="/alerts">
        <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux alertes
        </Button>
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{alert.ruleName}</h1>
            <SeverityBadge severity={alert.severity} />
            <StatusBadge status={alert.status} />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {alert.data.fullName || (alert.data.firstName && alert.data.lastName && `${alert.data.firstName} ${alert.data.lastName}`) ? (
              <>
                {alert.data.fullName || `${alert.data.firstName} ${alert.data.lastName}`} • Lead #{alert.leadId} • {alert.campaign}
              </>
            ) : (
              <>
                Lead #{alert.leadId} • {alert.campaign}
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
                className="bg-gray-900 text-white hover:bg-gray-900/80 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-100/80"
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
                className="bg-gray-900 text-white hover:bg-gray-900/80 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-100/80"
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
          <Button variant="outline" size="sm" asChild>
            <a
              href={`https://youschool.diabolocom.com/desk/campaign-contacts/${alert.leadId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Diabolocom
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Infos Prospect */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Informations du prospect</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(alert.data.fullName || (alert.data.firstName && alert.data.lastName)) && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                    <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nom</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {alert.data.fullName || `${alert.data.firstName} ${alert.data.lastName}`}
                    </p>
                  </div>
                </div>
              )}
              {alert.data.email && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{alert.data.email}</p>
                  </div>
                </div>
              )}
              {alert.data.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Téléphone</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatPhone(alert.data.phone)}</p>
                  </div>
                </div>
              )}
              {alert.campaign && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
                    <Tag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Campagne</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{alert.campaign}</p>
                  </div>
                </div>
              )}
              {alert.data.createdBy && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center">
                    <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Créé par</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{alert.data.createdBy}</p>
                  </div>
                </div>
              )}
              {alert.data.createdAt && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Fiche créée dans Diabolocom le</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(alert.data.createdAt)}</p>
                  </div>
                </div>
              )}
              {alert.data.lastCallTime && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-50 dark:bg-cyan-950 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Dernier appel</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(alert.data.lastCallTime)}</p>
                  </div>
                </div>
              )}
              {alert.data.state && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">État</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {STATE_LABELS[alert.data.state] || alert.data.state}
                    </p>
                  </div>
                </div>
              )}
              {alert.data.excludedDetail && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center">
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Raison exclusion</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{alert.data.excludedDetail}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grid: Informations Diabolocom + Historique des appels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations Diabolocom */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Informations Diabolocom</h2>
              <dl className="space-y-3 text-sm">
                {(alert.data.contactId || alert.leadId) && (
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-500 dark:text-gray-400">Contact ID</dt>
                    <dd className="flex items-center gap-1">
                      <span className="font-mono text-gray-700 dark:text-gray-300">{alert.data.contactId || alert.leadId}</span>
                      <button
                        onClick={() => copyToClipboard(alert.data.contactId || alert.leadId, "Contact ID")}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Copier le Contact ID"
                      >
                        <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                      </button>
                    </dd>
                  </div>
                )}
                {(alert.data.agentName || alert.data.lastAgent) && (
                  <div className="flex justify-between items-start">
                    <dt className="text-gray-500 dark:text-gray-400">Agent</dt>
                    <dd className="text-right text-gray-700 dark:text-gray-300">{alert.data.agentName || alert.data.lastAgent}</dd>
                  </div>
                )}
                {alert.campaignId && (
                  <div className="flex justify-between items-start">
                    <dt className="text-gray-500 dark:text-gray-400">Campaign ID</dt>
                    <dd className="text-right text-gray-700 dark:text-gray-300">{alert.campaignId}</dd>
                  </div>
                )}
                {alert.data.leadSource && (
                  <div className="flex justify-between items-start">
                    <dt className="text-gray-500 dark:text-gray-400">Provenance</dt>
                    <dd className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-base">{getLeadSourceInfo(alert.data.leadSource).icon}</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {getLeadSourceInfo(alert.data.leadSource).label}
                        </span>
                      </div>
                    </dd>
                  </div>
                )}
                {alert.data.systemId && (
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-500 dark:text-gray-400">System ID</dt>
                    <dd className="flex items-center gap-1">
                      <span className="font-mono text-gray-700 dark:text-gray-300 text-xs">{alert.data.systemId}</span>
                      <button
                        onClick={() => copyToClipboard(alert.data.systemId!, "System ID")}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Copier le System ID"
                      >
                        <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                      </button>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Historique des appels */}
            {alert.data.callHistory && alert.data.callHistory.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
                <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Historique des appels</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-gray-400">Date</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-gray-400">Wrapup</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-gray-400">Durée</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-gray-400">Agent</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-gray-400">Essai #</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alert.data.callHistory.map((call, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                          <td className="py-3 px-2 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            {call.call_start ? formatDateTime(call.call_start) : "—"}
                          </td>
                          <td className="py-3 px-2 text-gray-900 dark:text-gray-100">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                              {call.wrapup_name || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 text-gray-400" />
                              {call.talk_duration !== undefined ? `${call.talk_duration}s` : "—"}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-gray-900 dark:text-gray-100">{call.agent || "—"}</td>
                          <td className="py-3 px-2 text-gray-900 dark:text-gray-100">{call.try_number !== undefined ? call.try_number : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>


          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-gray-900 dark:text-gray-100">Données brutes</h2>
              <button
                onClick={() => copyToClipboard(JSON.stringify(alert, null, 2), "Données brutes")}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                title="Copier le JSON"
              >
                <Copy className="h-3 w-3" />
                Copier
              </button>
            </div>
            <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-xs overflow-x-auto text-gray-700 dark:text-gray-300">
              {JSON.stringify(alert, null, 2)}
            </pre>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-gray-900 dark:text-gray-100">Détails de l&apos;alerte</h2>
              <SeverityBadge severity={ruleInfo.severity} />
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <dt className="text-gray-500 dark:text-gray-400">Règle</dt>
                <dd className="flex items-center gap-1.5">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{ruleInfo.name}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{ruleInfo.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-gray-500 dark:text-gray-400">ID Alerte</dt>
                <dd className="flex items-center gap-1">
                  <span className="font-mono text-gray-700 dark:text-gray-300 text-xs">{alert.id.slice(0, 8)}...</span>
                  <button
                    onClick={() => copyToClipboard(alert.id, "ID Alerte")}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Copier l'ID complet"
                  >
                    <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  </button>
                </dd>
              </div>
              <div className="flex justify-between items-start">
                <dt className="text-gray-500 dark:text-gray-400">Date de détection</dt>
                <dd className="text-right">
                  <div className="text-gray-700 dark:text-gray-300">{formatDateTime(alert.detectedAt)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(alert.detectedAt)}</div>
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Métriques du lead</h2>
            <dl className="space-y-3 text-sm">
              {alert.data.priority !== undefined && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Priorité</dt>
                  <dd className="text-gray-700 dark:text-gray-300 font-medium">{alert.data.priority}</dd>
                </div>
              )}
              {alert.data.createdAt && (
                <div className="flex justify-between items-start">
                  <dt className="text-gray-500 dark:text-gray-400">Date création lead</dt>
                  <dd className="text-right text-gray-700 dark:text-gray-300">{formatDateTime(alert.data.createdAt)}</dd>
                </div>
              )}
              {alert.data.hoursWithoutCall !== undefined && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Temps sans appels</dt>
                  <dd className="text-gray-700 dark:text-gray-300 font-medium">{alert.data.hoursWithoutCall}h</dd>
                </div>
              )}
              {alert.data.callDuration !== undefined && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Durée dernier appel</dt>
                  <dd className="text-gray-700 dark:text-gray-300">{alert.data.callDuration}s</dd>
                </div>
              )}
              {alert.data.closingCode && (
                <div className="flex justify-between items-start">
                  <dt className="text-gray-500 dark:text-gray-400">Code de clôture</dt>
                  <dd className="text-right text-gray-700 dark:text-gray-300">{alert.data.closingCode}</dd>
                </div>
              )}
              {alert.data.triesNumber !== undefined && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Tentatives</dt>
                  <dd className="text-gray-700 dark:text-gray-300">{alert.data.triesNumber}</dd>
                </div>
              )}
              {alert.data.retryDate && (
                <div className="flex justify-between items-start">
                  <dt className="text-gray-500 dark:text-gray-400">Date de retry</dt>
                  <dd className="text-right text-gray-700 dark:text-gray-300">{formatDateTime(alert.data.retryDate)}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Historique</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">Alerte détectée</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(alert.detectedAt)}</p>
                </div>
              </div>

              {history.map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(entry.action)} mt-2 shrink-0`} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {ACTION_LABELS[entry.action] || entry.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
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
