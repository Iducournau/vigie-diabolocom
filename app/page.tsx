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
import { styles } from "@/lib/styles";
import { colors } from "@/lib/theme";
import {
  RULES_MAP,
  CAMPAIGNS_MAP,
  getCampaignName,
  getRuleInfo,
  mapStatus,
  formatTimeAgo,
} from "@/lib/constants";
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
    <div className={cn(styles.card.base, "p-4 h-full flex flex-col")}>
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
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; fill: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      const item = sortedData.find(d => d.shortName === label);
      const total = payload.reduce((sum, p) => sum + (p.value || 0), 0);
      return (
        <div className={styles.tooltip.container}>
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{item?.name || label}</p>
          <div className="space-y-1 text-sm">
            {payload.filter((p) => p.value > 0).map((p, i) => (
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
  const RoundedBar = (props: { x?: number; y?: number; width?: number; height?: number; fill?: string; dataKey?: string; payload?: CampaignSeverityData }) => {
    const { x = 0, y = 0, width = 0, height = 0, fill, dataKey, payload } = props;
    if (!height || height <= 0 || !payload) return null;

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
    <div className={cn(styles.card.base, "p-4 h-full flex flex-col")}>
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
              fill={colors.chart.critical}
              shape={<RoundedBar />}
              maxBarSize={45}
            />
            <Bar
              dataKey="warning"
              name="Attention"
              stackId="stack"
              fill={colors.chart.warning}
              shape={<RoundedBar />}
              maxBarSize={45}
            />
            <Bar
              dataKey="info"
              name="Info"
              stackId="stack"
              fill={colors.chart.info}
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
    <div className={cn(styles.card.base, "h-full flex flex-col")}>
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
                      colors.severity[alert.severity].dot
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
          <Button size="sm" className="w-full">
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
      const ruleInfo = getRuleInfo(alert.rule_id);
      if (ruleInfo.severity === "critical") critical++;
      else if (ruleInfo.severity === "warning") warning++;
      else if (ruleInfo.severity === "info") info++;

      typeCount[alert.rule_id] = (typeCount[alert.rule_id] || 0) + 1;

      // Compter par campagne ET par sévérité
      if (alert.campaign) {
        if (!campaignSeverity[alert.campaign]) {
          campaignSeverity[alert.campaign] = { critical: 0, warning: 0, info: 0 };
        }
        campaignSeverity[alert.campaign][ruleInfo.severity]++;
      }
    });

    const total = critical + warning + info;

    // Préparer les données pour les charts
    const byType = Object.entries(typeCount).map(([ruleId, count], index) => ({
      name: getRuleInfo(ruleId).name,
      value: count,
      color: colors.chart.series[index % colors.chart.series.length],
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
      const ruleInfo = getRuleInfo(data.rule_id);
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
    try {
      await fetchDashboardData();
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loading.wrapper}>
        <Loader2 className={styles.loading.spinner} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={styles.page.title}>Tableau de bord</h1>
          <p className={styles.page.subtitle}>
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
          <Button onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Rafraîchir
              </>
            )}
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
