"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  RefreshCw, 
  Loader2,
  ArrowRight,
} from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { AlertsChart } from "@/components/alerts-chart";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Severity, AlertStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Label,
  CartesianGrid,
  Legend,
} from "recharts";

// Mapping des règles
const RULES_MAP: Record<string, { name: string; severity: Severity }> = {
  "00097670-06b9-406a-97cc-c8d138448eff": { name: "Lead dormant", severity: "critical" },
  "23934576-a556-4035-8dc8-2d851a86e02e": { name: "Rappel oublié", severity: "critical" },
  "59cb9b8e-6916-47f8-898c-c2e18c81f4a6": { name: "Unreachable suspect", severity: "warning" },
  "7caa90f2-9288-4c80-8d6a-6d3078c6a135": { name: "Clôture trop rapide", severity: "warning" },
  "c99b95b1-5dd6-48ed-b703-84df70e4eddb": { name: "Acharnement", severity: "info" },
};

// Mapping des campagnes Admissions (12)
const CAMPAIGNS_MAP: Record<string, string> = {
  "5612": "Métiers Animaliers",
  "5927": "Electricien",
  "5920": "CAP MIS",
  "5622": "Campagne Nutritionniste",
  "5611": "Campagne Mode",
  "5621": "Décorateur Intérieur",
  "5580": "Campagne AEPE",
  "6064": "CA - Titres Professionnels",
  "6051": "CA - Métiers de la Beauté",
  "6046": "CA - Métiers de Bouche",
  "6050": "CA - Céramiste Fleuriste",
  "6082": "CA - Mode Déco",
};

// Couleurs pour les charts
const RULE_COLORS = [
  "#ef4444", // rouge
  "#f97316", // orange
  "#eab308", // jaune
  "#84cc16", // lime
  "#3b82f6", // bleu
];

function getCampaignName(campaignId: string): string {
  return CAMPAIGNS_MAP[campaignId] || `Campagne ${campaignId}`;
}

function mapStatus(status: string): AlertStatus {
  if (status === "open") return "new";
  return status as AlertStatus;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${diffDays}j`;
}

interface DashboardStats {
  total: number;
  critical: number;
  warning: number;
  info: number;
  resolved: number;
}

interface AlertRow {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: Severity;
  status: AlertStatus;
  leadId: string;
  campaign: string;
  campaignId: string;
  detectedAt: Date;
  agent?: string;
}

interface ChartData {
  byType: { name: string; value: number; color: string }[];
  byCampaign: {
    name: string;
    shortName: string;
    campaignId: string;
    critical: number;
    warning: number;
    info: number;
    total: number;
  }[];
}

// Composant Donut Chart - Répartition par type (avec total au centre)
function AlertsByTypeChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4 h-full flex flex-col">
      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Répartition par type</h3>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={2}
              stroke="var(--background)"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-gray-900 dark:fill-gray-100 text-2xl font-bold"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-gray-500 dark:fill-gray-400 text-xs"
                        >
                          alertes
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <Tooltip 
              formatter={(value: number) => [value, "Alertes"]}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Légende */}
      <div className="mt-2 space-y-1">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-600 dark:text-gray-400 truncate flex-1">{item.name}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Composant Bar Chart Stacked - Alertes par formation avec sévérité
interface CampaignSeverityData {
  name: string;
  shortName: string;
  campaignId: string;
  critical: number;
  warning: number;
  info: number;
  total: number;
}

function AlertsByCampaignChart({ data }: { data: CampaignSeverityData[] }) {
  const sortedData = [...data]
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = sortedData.find(d => d.shortName === label);
      const total = payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0);
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{item?.name || label}</p>
          <div className="space-y-1 text-sm">
            {payload.filter((p: any) => p.value > 0).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
                  <span className="text-gray-600 dark:text-gray-400">{p.name}</span>
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{p.value}</span>
              </div>
            ))}
            <div className="pt-1 mt-1 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{total}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom bar shape avec radius intelligent
  const RoundedBar = (props: any) => {
    const { x, y, width, height, fill, dataKey, payload } = props;
    if (!height || height <= 0) return null;

    // Déterminer si c'est la barre du haut (pour le radius top)
    const isTopBar = 
      (dataKey === "info" && payload.info > 0) ||
      (dataKey === "warning" && payload.info === 0 && payload.warning > 0) ||
      (dataKey === "critical" && payload.info === 0 && payload.warning === 0);

    // Déterminer si c'est la barre du bas (pour le radius bottom)
    const isBottomBar = 
      (dataKey === "critical" && payload.critical > 0) ||
      (dataKey === "warning" && payload.critical === 0 && payload.warning > 0) ||
      (dataKey === "info" && payload.critical === 0 && payload.warning === 0);

    const radius = 4;
    const topRadius = isTopBar ? radius : 0;
    const bottomRadius = isBottomBar ? radius : 0;

    return (
      <path
        d={`
          M ${x + bottomRadius},${y + height}
          L ${x + bottomRadius},${y + height}
          Q ${x},${y + height} ${x},${y + height - bottomRadius}
          L ${x},${y + topRadius}
          Q ${x},${y} ${x + topRadius},${y}
          L ${x + width - topRadius},${y}
          Q ${x + width},${y} ${x + width},${y + topRadius}
          L ${x + width},${y + height - bottomRadius}
          Q ${x + width},${y + height} ${x + width - bottomRadius},${y + height}
          Z
        `}
        fill={fill}
      />
    );
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4 h-full flex flex-col">
      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Alertes par formation</h3>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="shortName" 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickMargin={8}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Legend 
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>}
            />
            <Bar 
              dataKey="critical" 
              name="Critique"
              stackId="stack"
              fill="#ef4444" 
              shape={<RoundedBar />}
              maxBarSize={45}
            />
            <Bar 
              dataKey="warning" 
              name="Attention"
              stackId="stack"
              fill="#f59e0b" 
              shape={<RoundedBar />}
              maxBarSize={45}
            />
            <Bar 
              dataKey="info" 
              name="Info"
              stackId="stack"
              fill="#3b82f6" 
              shape={<RoundedBar />}
              maxBarSize={45}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Composant Activité récente
function RecentActivityFeed({ alerts }: { alerts: AlertRow[] }) {
  const recentAlerts = alerts.slice(0, 8);
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">Activité récente</h3>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {recentAlerts.length > 0 ? (
            recentAlerts.map((alert) => (
              <Link key={alert.id} href={`/alerts/${alert.id}`}>
                <div className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-1.5 shrink-0",
                      alert.severity === "critical" ? "bg-red-500" :
                      alert.severity === "warning" ? "bg-amber-500" : "bg-blue-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                          {alert.ruleName}
                        </p>
                        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                          {formatTimeAgo(alert.detectedAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Lead #{alert.leadId} • {alert.campaign}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm">Aucune activité récente</p>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
        <Link href="/alerts">
          <Button variant="outline" size="sm" className="w-full">
            Voir toutes les alertes
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ total: 0, critical: 0, warning: 0, info: 0, resolved: 0 });
  const [recentAlerts, setRecentAlerts] = useState<AlertRow[]>([]);
  const [chartData, setChartData] = useState<ChartData>({ byType: [], byCampaign: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  async function fetchDashboardData() {
    // Fetch toutes les alertes ouvertes pour les stats
    const { data: openAlerts } = await supabase
      .from("alerts")
      .select("*")
      .in("status", ["open", "acknowledged"]);

    // Compter par sévérité
    let critical = 0, warning = 0, info = 0;
    const typeCount: Record<string, number> = {};
    const campaignSeverity: Record<string, { critical: number; warning: number; info: number }> = {};

    (openAlerts || []).forEach((alert) => {
      const ruleInfo = RULES_MAP[alert.rule_id];
      if (ruleInfo) {
        if (ruleInfo.severity === "critical") critical++;
        else if (ruleInfo.severity === "warning") warning++;
        else if (ruleInfo.severity === "info") info++;
        
        typeCount[alert.rule_id] = (typeCount[alert.rule_id] || 0) + 1;
      }
      
      // Compter par campagne ET par sévérité
      if (alert.campaign) {
        if (!campaignSeverity[alert.campaign]) {
          campaignSeverity[alert.campaign] = { critical: 0, warning: 0, info: 0 };
        }
        if (ruleInfo) {
          campaignSeverity[alert.campaign][ruleInfo.severity]++;
        }
      }
    });

    const total = critical + warning + info;

    // Préparer les données pour les charts
    const byType = Object.entries(typeCount).map(([ruleId, count], index) => ({
      name: RULES_MAP[ruleId]?.name || "Inconnu",
      value: count,
      color: RULE_COLORS[index % RULE_COLORS.length],
    }));

    // Données pour le stacked bar chart
    const byCampaign = Object.entries(campaignSeverity).map(([campaignId, severities]) => {
      const name = getCampaignName(campaignId);
      return {
        name,
        shortName: name
          .replace("Campagne ", "")
          .replace("CA - ", "")
          .replace("Métiers ", "")
          .slice(0, 10) + (name.length > 12 ? "." : ""),
        campaignId,
        critical: severities.critical,
        warning: severities.warning,
        info: severities.info,
        total: severities.critical + severities.warning + severities.info,
      };
    });

    setChartData({ byType, byCampaign });

    // Compter résolues (dernières 24h)
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    
    const { count: resolvedCount } = await supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("status", "resolved")
      .gte("resolved_at", yesterday.toISOString());

    setStats({
      total,
      critical,
      warning,
      info,
      resolved: resolvedCount || 0,
    });

    // Fetch alertes récentes
    const { data: recentData } = await supabase
      .from("alerts")
      .select("*")
      .order("detected_at", { ascending: false })
      .limit(10);

    const transformedRecent: AlertRow[] = (recentData || []).map((data) => {
      const ruleInfo = RULES_MAP[data.rule_id] || { name: "Règle inconnue", severity: "info" as Severity };
      const alertData = typeof data.alert_data === "string" ? JSON.parse(data.alert_data) : data.alert_data || {};
      
      return {
        id: data.id,
        ruleId: data.rule_id,
        ruleName: ruleInfo.name,
        severity: ruleInfo.severity,
        status: mapStatus(data.status),
        leadId: data.lead_id,
        campaign: getCampaignName(data.campaign),
        campaignId: data.campaign,
        detectedAt: new Date(data.detected_at),
        agent: alertData.agent || alertData.user_login1,
      };
    });
    setRecentAlerts(transformedRecent);

    setLastSync(new Date());
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchDashboardData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Tableau de bord</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Surveillance des anomalies en temps réel
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastSync && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Sync : {formatTimeAgo(lastSync)}
              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Rafraîchir
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total actives"
          value={stats.total}
          icon={AlertTriangle}
          variant="default"
        />
        <StatsCard
          title="Critiques"
          value={stats.critical}
          icon={AlertTriangle}
          variant="critical"
        />
        <StatsCard
          title="Attention"
          value={stats.warning}
          icon={AlertCircle}
          variant="warning"
        />
        <StatsCard
          title="Info"
          value={stats.info}
          icon={Info}
          variant="info"
        />
        <StatsCard
          title="Résolues (24h)"
          value={stats.resolved}
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      {/* Charts Row 1 - Évolution + Répartition par type */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AlertsChart />
        </div>
        <div className="lg:col-span-1">
          <AlertsByTypeChart data={chartData.byType} />
        </div>
      </div>

      {/* Charts Row 2 - Par formation + Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsByCampaignChart data={chartData.byCampaign} />
        <RecentActivityFeed alerts={recentAlerts} />
      </div>
    </div>
  );
}
