"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Alert, Severity, AlertStatus } from "@/lib/types";
import { SeverityBadge, StatusBadge } from "@/components/alert-badge";
import { Button } from "@/components/ui/button";
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

interface AlertData {
  hoursWithoutCall?: number;
  priority?: number;
  triesNumber?: number;
  callDuration?: number;
  closingCode?: string;
  phone?: string;
  lastAgent?: string;
  createdBy?: string;
  createdAt?: string;
  lastUpdatedAt?: string;
  state?: string;
  excludedDetail?: string;
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

    const alertData = typeof data.alert_data === "string" 
      ? JSON.parse(data.alert_data) 
      : data.alert_data || {};

    const ruleInfo = getRuleInfo(data.rule_id);

    const createdAt = new Date(alertData.createdAt || data.detected_at);
    const now = new Date();
    const hoursWithoutCall = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));

    const transformed: TransformedAlert = {
      id: data.id,
      ruleId: data.rule_id,
      ruleName: ruleInfo.name,
      severity: ruleInfo.severity,
      status: mapStatus(data.status),
      leadId: data.lead_id,
      campaign: getCampaignName(data.campaign),
      detectedAt: new Date(data.detected_at),
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
      resolvedBy: data.resolved_by || undefined,
      data: {
        hoursWithoutCall,
        priority: alertData.priority,
        triesNumber: alertData.triesNumber,
        phone: alertData.contactCardDisplayNumber || undefined,
        lastAgent: alertData.lastUpdatedBy || undefined,
        createdBy: alertData.createdBy || undefined,
        createdAt: alertData.createdAt || undefined,
        lastUpdatedAt: alertData.lastUpdatedAt || undefined,
        state: alertData.state || undefined,
        excludedDetail: alertData.excludedDetail || undefined,
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
            Lead #{alert.leadId} • {alert.campaign}
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
          {/* Infos Lead */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Informations du lead</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {alert.data.lastAgent && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
                    <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Dernier agent</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{alert.data.lastAgent}</p>
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">Créé le</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(alert.data.createdAt)}</p>
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

          {/* Données de l'alerte */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Données de l&apos;alerte</h2>
            <dl className="grid grid-cols-2 gap-4">
              {alert.data.priority !== undefined && (
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Priorité</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{alert.data.priority}</dd>
                </div>
              )}
              {alert.data.triesNumber !== undefined && (
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre de tentatives</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{alert.data.triesNumber}</dd>
                </div>
              )}
              {alert.data.hoursWithoutCall !== undefined && (
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Temps sans appel</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{alert.data.hoursWithoutCall}h</dd>
                </div>
              )}
              {alert.data.callDuration !== undefined && (
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Durée du dernier appel</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{alert.data.callDuration} sec</dd>
                </div>
              )}
              {alert.data.closingCode && (
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Code de clôture</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{alert.data.closingCode}</dd>
                </div>
              )}
            </dl>
          </div>

          {ruleInfo && (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Règle déclenchée</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Nom : </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{ruleInfo.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Description : </span>
                  <span className="text-gray-700 dark:text-gray-300">{ruleInfo.description}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Sévérité : </span>
                  <SeverityBadge severity={ruleInfo.severity} />
                </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Données brutes</h2>
            <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-xs overflow-x-auto text-gray-700 dark:text-gray-300">
              {JSON.stringify(alert, null, 2)}
            </pre>
          </div>
        </div>

        <div className="space-y-6">
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

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Informations</h2>
            <dl className="space-y-3 text-sm">
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
              <div className="flex justify-between items-center">
                <dt className="text-gray-500 dark:text-gray-400">ID Lead</dt>
                <dd className="flex items-center gap-1">
                  <span className="font-mono text-gray-700 dark:text-gray-300">{alert.leadId}</span>
                  <button
                    onClick={() => copyToClipboard(alert.leadId, "ID Lead")}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Copier l'ID Lead"
                  >
                    <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  </button>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Campagne</dt>
                <dd className="text-gray-700 dark:text-gray-300 text-right max-w-32 truncate">{alert.campaign}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
