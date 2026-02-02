"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

// Mapping des règles vers sévérité
const RULES_SEVERITY: Record<string, "critical" | "warning" | "info"> = {
  "00097670-06b9-406a-97cc-c8d138448eff": "critical", // Lead dormant
  "23934576-a556-4035-8dc8-2d851a86e02e": "critical", // Rappel oublié
  "59cb9b8e-6916-47f8-898c-c2e18c81f4a6": "warning",  // Unreachable suspect
  "7caa90f2-9288-4c80-8d6a-6d3078c6a135": "warning",  // Clôture trop rapide
  "c99b95b1-5dd6-48ed-b703-84df70e4eddb": "info",     // Acharnement
  // Nouvelles règles Retry
  "a1b2c3d4-1111-4000-8000-000000000001": "info",     // Retry en retard (léger)
  "a1b2c3d4-2222-4000-8000-000000000002": "warning",  // Retry en retard (modéré)
  "a1b2c3d4-3333-4000-8000-000000000003": "critical", // Retry en retard (critique)
};

interface ChartDataPoint {
  day: string;
  critical: number;
  warning: number;
  info: number;
}

const periods = [
  { key: "7d", label: "7 jours", days: 7 },
  { key: "15d", label: "15 jours", days: 15 },
  { key: "1m", label: "1 mois", days: 30 },
  { key: "3m", label: "3 mois", days: 90 },
] as const;

type PeriodKey = "7d" | "15d" | "1m" | "3m";

// Tooltip personnalisé
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; dataKey: string; value: number }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;

  const labels: Record<string, string> = {
    critical: "Critiques",
    warning: "Attention",
    info: "Info",
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
      <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-gray-400">
                {labels[entry.dataKey] || entry.dataKey}
              </span>
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AlertsChart() {
  const [period, setPeriod] = useState<PeriodKey>("7d");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState(0);

  useEffect(() => {
    async function fetchChartData() {
      setLoading(true);
      
      const periodConfig = periods.find(p => p.key === period);
      const days = periodConfig?.days || 7;
      
      // Date de début
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      // Date de début période précédente (pour le trend)
      const prevStartDate = new Date();
      prevStartDate.setDate(prevStartDate.getDate() - (days * 2));
      prevStartDate.setHours(0, 0, 0, 0);

      // Fetch alertes de la période
      const { data: alerts } = await supabase
        .from("alerts")
        .select("rule_id, detected_at")
        .gte("detected_at", startDate.toISOString())
        .order("detected_at", { ascending: true });

      // Fetch alertes période précédente (pour trend)
      const { data: prevAlerts } = await supabase
        .from("alerts")
        .select("rule_id")
        .gte("detected_at", prevStartDate.toISOString())
        .lt("detected_at", startDate.toISOString());

      // Grouper par jour
      const dataByDay: Record<string, { critical: number; warning: number; info: number }> = {};
      
      // Initialiser tous les jours de la période
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayKey = formatDayKey(date, days);
        dataByDay[dayKey] = { critical: 0, warning: 0, info: 0 };
      }

      // Compter les alertes par jour et sévérité
      (alerts || []).forEach((alert) => {
        const date = new Date(alert.detected_at);
        const dayKey = formatDayKey(date, days);
        const severity = RULES_SEVERITY[alert.rule_id] || "info";
        
        if (dataByDay[dayKey]) {
          if (severity === "critical") {
            dataByDay[dayKey].critical++;
          } else if (severity === "warning") {
            dataByDay[dayKey].warning++;
          } else {
            dataByDay[dayKey].info++;
          }
        }
      });

      // Convertir en array pour le chart
      const chartDataArray: ChartDataPoint[] = Object.entries(dataByDay).map(([day, counts]) => ({
        day,
        critical: counts.critical,
        warning: counts.warning,
        info: counts.info,
      }));

      setChartData(chartDataArray);

      // Calculer le trend
      const currentTotal = (alerts || []).length;
      const prevTotal = (prevAlerts || []).length;
      
      if (prevTotal > 0) {
        const trendValue = Math.round(((currentTotal - prevTotal) / prevTotal) * 100);
        setTrend(trendValue);
      } else if (currentTotal > 0) {
        setTrend(100);
      } else {
        setTrend(0);
      }

      setLoading(false);
    }

    fetchChartData();
  }, [period]);

  const periodLabel = periods.find((p) => p.key === period)?.label || "";
  const isUp = trend > 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      {/* Header avec filtre */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="font-medium text-gray-900 dark:text-gray-100">Évolution des alertes</h2>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-0.5">{periodLabel}</p>
        </div>
        
        {/* Filtre de période */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1 gap-1">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                "px-3 py-1 rounded text-sm transition-colors",
                period === p.key
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-5">
        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            Aucune donnée pour cette période
          </div>
        ) : (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  className="fill-gray-500 dark:fill-gray-400"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  className="fill-gray-500 dark:fill-gray-400"
                  width={35}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  dataKey="info"
                  type="monotone"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="warning"
                  type="monotone"
                  fill="#f59e0b"
                  fillOpacity={0.2}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="critical"
                  type="monotone"
                  fill="#ef4444"
                  fillOpacity={0.3}
                  stroke="#ef4444"
                  strokeWidth={2}
                  stackId="a"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="text-gray-600 dark:text-gray-400">Critiques</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-gray-600 dark:text-gray-400">Attention</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-gray-600 dark:text-gray-400">Info</span>
            </div>
          </div>
          <div className={`font-medium ${isUp ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {trend === 0 ? "—" : (isUp ? "↑" : "↓")} {Math.abs(trend)}% vs période précédente
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper pour formater les labels des jours
function formatDayKey(date: Date, totalDays: number): string {
  if (totalDays <= 7) {
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    return days[date.getDay()];
  } else if (totalDays <= 31) {
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  } else {
    const weekNum = Math.ceil(date.getDate() / 7);
    return `Sem ${weekNum}`;
  }
}
