"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

// Données mockées pour différentes périodes
const mockData = {
  "7d": [
    { day: "Lun", critical: 4, warning: 8 },
    { day: "Mar", critical: 6, warning: 12 },
    { day: "Mer", critical: 3, warning: 7 },
    { day: "Jeu", critical: 8, warning: 15 },
    { day: "Ven", critical: 5, warning: 9 },
    { day: "Sam", critical: 2, warning: 4 },
    { day: "Dim", critical: 3, warning: 6 },
  ],
  "15d": [
    { day: "01/01", critical: 5, warning: 10 },
    { day: "02/01", critical: 3, warning: 8 },
    { day: "03/01", critical: 7, warning: 14 },
    { day: "04/01", critical: 4, warning: 9 },
    { day: "05/01", critical: 6, warning: 11 },
    { day: "06/01", critical: 8, warning: 15 },
    { day: "07/01", critical: 5, warning: 10 },
    { day: "08/01", critical: 4, warning: 8 },
    { day: "09/01", critical: 6, warning: 12 },
    { day: "10/01", critical: 3, warning: 7 },
    { day: "11/01", critical: 8, warning: 15 },
    { day: "12/01", critical: 5, warning: 9 },
    { day: "13/01", critical: 2, warning: 4 },
    { day: "14/01", critical: 3, warning: 6 },
    { day: "15/01", critical: 4, warning: 8 },
  ],
  "1m": [
    { day: "Sem 1", critical: 25, warning: 48 },
    { day: "Sem 2", critical: 32, warning: 61 },
    { day: "Sem 3", critical: 28, warning: 52 },
    { day: "Sem 4", critical: 21, warning: 45 },
  ],
  "3m": [
    { day: "Oct", critical: 89, warning: 156 },
    { day: "Nov", critical: 102, warning: 189 },
    { day: "Déc", critical: 78, warning: 134 },
  ],
  "1y": [
    { day: "Jan", critical: 95, warning: 180 },
    { day: "Fév", critical: 88, warning: 165 },
    { day: "Mar", critical: 102, warning: 195 },
    { day: "Avr", critical: 79, warning: 148 },
    { day: "Mai", critical: 85, warning: 160 },
    { day: "Juin", critical: 92, warning: 175 },
    { day: "Juil", critical: 68, warning: 125 },
    { day: "Août", critical: 55, warning: 98 },
    { day: "Sep", critical: 78, warning: 145 },
    { day: "Oct", critical: 89, warning: 156 },
    { day: "Nov", critical: 102, warning: 189 },
    { day: "Déc", critical: 78, warning: 134 },
  ],
};

const periods = [
  { key: "7d", label: "7 jours" },
  { key: "15d", label: "15 jours" },
  { key: "1m", label: "1 mois" },
  { key: "3m", label: "3 mois" },
  { key: "1y", label: "1 an" },
] as const;

type PeriodKey = keyof typeof mockData;

// Tooltip personnalisé
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
      <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-gray-400">
                {entry.dataKey === "critical" ? "Critiques" : "Attention"}
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
  const chartData = mockData[period];

  // Calcul de la tendance
  const totalThisperiod = chartData.reduce((sum, d) => sum + d.critical + d.warning, 0);
  const totalLastPeriod = Math.round(totalThisperiod * 0.85);
  const trend = Math.round(((totalThisperiod - totalLastPeriod) / totalLastPeriod) * 100);
  const isUp = trend > 0;

  const periodLabel = periods.find((p) => p.key === period)?.label || "";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
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
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
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
          </div>
          <div className={`font-medium ${isUp ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {isUp ? "↑" : "↓"} {Math.abs(trend)}% vs période précédente
          </div>
        </div>
      </div>
    </div>
  );
}
