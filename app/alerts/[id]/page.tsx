"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getAlertById, getRuleById, formatTimeAgo } from "@/lib/mock-data";
import { SeverityBadge, StatusBadge } from "@/components/alert-badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Eye,
  RotateCcw,
} from "lucide-react";

export default function AlertDetailPage() {
  const params = useParams();
  const alertId = params.id as string;
  const alert = getAlertById(alertId);

  if (!alert) {
    return (
      <div className="space-y-6">
        <Link href="/alerts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux alertes
          </Button>
        </Link>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">Alerte introuvable.</p>
        </div>
      </div>
    );
  }

  const rule = getRuleById(alert.ruleId);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/alerts">
        <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux alertes
        </Button>
      </Link>

      {/* Header */}
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

        {/* Actions */}
        <div className="flex items-center gap-2">
          {alert.status === "new" && (
            <>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Prendre en charge
              </Button>
              <Button variant="outline" size="sm">
                <XCircle className="h-4 w-4 mr-2" />
                Ignorer
              </Button>
            </>
          )}
          {alert.status === "acknowledged" && (
            <Button size="sm">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Marquer résolu
            </Button>
          )}
          {alert.status === "resolved" && (
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Rouvrir
            </Button>
          )}
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Diabolocom
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alert data */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Données de l&apos;alerte</h2>
            <dl className="grid grid-cols-2 gap-4">
              {alert.data.priority !== undefined && (
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Priorité</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{alert.data.priority}</dd>
                </div>
              )}
              {alert.data.callCount !== undefined && (
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre d&apos;appels</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{alert.data.callCount}</dd>
                </div>
              )}
              {alert.data.callDuration !== undefined && (
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Durée du dernier appel</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{alert.data.callDuration} sec</dd>
                </div>
              )}
              {alert.data.hoursWithoutCall !== undefined && (
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Temps sans appel</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{alert.data.hoursWithoutCall}h</dd>
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

          {/* Rule info */}
          {rule && (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Règle déclenchée</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Nom : </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{rule.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Description : </span>
                  <span className="text-gray-700 dark:text-gray-300">{rule.description}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Paramètres : </span>
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                    {JSON.stringify(rule.parameters)}
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* Raw JSON */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Données brutes</h2>
            <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-xs overflow-x-auto text-gray-700 dark:text-gray-300">
              {JSON.stringify(alert, null, 2)}
            </pre>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Chronologie</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">Alerte détectée</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(alert.detectedAt)}</p>
                </div>
              </div>
              {alert.resolvedAt && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">Résolue par {alert.resolvedBy}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(alert.resolvedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick info */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Informations</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">ID Alerte</dt>
                <dd className="font-mono text-gray-700 dark:text-gray-300">{alert.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">ID Lead</dt>
                <dd className="font-mono text-gray-700 dark:text-gray-300">{alert.leadId}</dd>
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
