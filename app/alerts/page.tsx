"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Search,
  X,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Download,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Severity, AlertStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

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

  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${diffDays}j`;
}

function formatDuration(seconds: number | undefined): string {
  if (!seconds) return "-";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m${secs > 0 ? ` ${secs}s` : ""}`;
}

// Labels français
const STATUS_LABELS: Record<string, string> = {
  new: "Nouvelle",
  acknowledged: "En cours",
  resolved: "Résolue",
  dismissed: "Ignorée",
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: "Critique",
  warning: "Attention",
  info: "Info",
};

// Types
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
  tryNumber?: number;
  talkDuration?: number;
  agent?: string;
  wrapupName?: string;
}

// Colonnes du tableau
const columns: ColumnDef<AlertRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Tout sélectionner"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Sélectionner la ligne"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "severity",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4"
      >
        Priorité
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const severity = row.getValue("severity") as Severity;
      return (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              severity === "critical" ? "bg-red-500" :
              severity === "warning" ? "bg-amber-500" : "bg-blue-500"
            )}
          />
          <Badge
            variant="outline"
            className={cn(
              "font-normal",
              severity === "critical" ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400" :
              severity === "warning" ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400" :
              "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
            )}
          >
            {SEVERITY_LABELS[severity]}
          </Badge>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[rowA.original.severity] - order[rowB.original.severity];
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "ruleName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4"
      >
        Type d'anomalie
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link
        href={`/alerts/${row.original.id}`}
        className="font-medium hover:underline text-gray-900 dark:text-gray-100"
      >
        {row.getValue("ruleName")}
      </Link>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.original.ruleId);
    },
  },
  {
    accessorKey: "leadId",
    header: "N° Lead",
    cell: ({ row }) => (
      <Link
        href={`/alerts/${row.original.id}`}
        className="font-mono text-xs text-gray-600 dark:text-gray-400 hover:underline"
      >
        #{row.getValue("leadId")}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.getValue("status") as AlertStatus;
      return (
        <Badge
          variant="outline"
          className={cn(
            "font-normal",
            status === "new" ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400" :
            status === "acknowledged" ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400" :
            status === "resolved" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400" :
            "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
          )}
        >
          {STATUS_LABELS[status] || status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "campaign",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4"
      >
        Formation
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px] block">
        {row.getValue("campaign")}
      </span>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.original.campaignId);
    },
  },
  {
    accessorKey: "agent",
    header: "Agent",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {row.getValue("agent") || "-"}
      </span>
    ),
  },
  {
    accessorKey: "wrapupName",
    header: "Qualification",
    cell: ({ row }) => {
      const wrapup = row.getValue("wrapupName") as string | undefined;
      if (!wrapup) return <span className="text-gray-400">-</span>;
      
      return (
        <Badge
          variant="outline"
          className={cn(
            "font-normal text-xs",
            ["Perdu", "Pas intéressé", "Raccroche", "Faux numéro"].includes(wrapup)
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400" :
            ["RDV", "RDV IN", "Appel intermédiaire", "Besoin de réflexion"].includes(wrapup)
              ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400" :
            ["Répondeur", "Injoignable"].includes(wrapup)
              ? "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-400" :
            ["Gagné"].includes(wrapup)
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400" :
              "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
          )}
        >
          {wrapup}
        </Badge>
      );
    },
  },
  {
    accessorKey: "tryNumber",
    header: "Tentative",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 dark:text-gray-400 text-center block">
        {row.getValue("tryNumber") || "-"}
      </span>
    ),
  },
  {
    accessorKey: "talkDuration",
    header: "Durée",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {formatDuration(row.getValue("talkDuration"))}
      </span>
    ),
  },
  {
    accessorKey: "detectedAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4"
      >
        Détecté
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("detectedAt") as Date;
      return (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-gray-100">{formatTimeAgo(date)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {date.toLocaleDateString("fr-FR")}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const alert = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end"
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/alerts/${alert.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Voir le détail
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Marquer résolu
            </DropdownMenuItem>
            <DropdownMenuItem>
              <XCircle className="mr-2 h-4 w-4" />
              Ignorer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function AlertsPage() {
  const [data, setData] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "detectedAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Filtres personnalisés
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");

  async function fetchAlerts() {
    const { data: alertsData } = await supabase
      .from("alerts")
      .select("*")
      .order("detected_at", { ascending: false })
      .limit(500);

    const transformed: AlertRow[] = (alertsData || []).map((data) => {
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
        tryNumber: alertData.triesNumber || alertData.try_number || alertData.call_count,
        talkDuration: alertData.talk_duration || alertData.talkDuration,
        agent: alertData.agent || alertData.user_login1 || alertData.user_login,
        wrapupName: alertData.wrapup_name || alertData.wrapupName || alertData.wrapup,
      };
    });

    setData(transformed);
    setLoading(false);
  }

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Filtrage des données
  const filteredData = useMemo(() => {
    return data.filter((alert) => {
      if (severityFilter !== "all" && alert.severity !== severityFilter) return false;
      if (typeFilter !== "all" && alert.ruleId !== typeFilter) return false;
      if (statusFilter !== "all" && alert.status !== statusFilter) return false;
      if (campaignFilter !== "all" && alert.campaignId !== campaignFilter) return false;
      if (globalFilter) {
        const search = globalFilter.toLowerCase();
        return (
          alert.leadId.toLowerCase().includes(search) ||
          alert.ruleName.toLowerCase().includes(search) ||
          alert.campaign.toLowerCase().includes(search) ||
          (alert.agent && alert.agent.toLowerCase().includes(search))
        );
      }
      return true;
    });
  }, [data, severityFilter, typeFilter, statusFilter, campaignFilter, globalFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const hasActiveFilters = severityFilter !== "all" || typeFilter !== "all" || statusFilter !== "all" || campaignFilter !== "all" || globalFilter !== "";

  function clearFilters() {
    setSeverityFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
    setCampaignFilter("all");
    setGlobalFilter("");
  }

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Alertes</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Gérez et traitez les anomalies détectées par Vigie
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4">
        {/* Row 1: Search + Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher lead, agent..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filtre Type */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type d'anomalie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {Object.entries(RULES_MAP).map(([id, rule]) => (
                <SelectItem key={id} value={id}>
                  {rule.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtre Priorité */}
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="critical">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Critique
                </span>
              </SelectItem>
              <SelectItem value="warning">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Attention
                </span>
              </SelectItem>
              <SelectItem value="info">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Info
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Filtre Statut */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="new">Nouvelle</SelectItem>
              <SelectItem value="acknowledged">En cours</SelectItem>
              <SelectItem value="resolved">Résolue</SelectItem>
              <SelectItem value="dismissed">Ignorée</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtre Formation */}
          <Select value={campaignFilter} onValueChange={setCampaignFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Formation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {Object.entries(CAMPAIGNS_MAP).map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="h-9 px-3">
              Réinitialiser
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Row 2: Actions + Column visibility */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedCount > 0 && (
              <>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedCount} sélectionnée{selectedCount > 1 ? "s" : ""}
                </span>
                <Button variant="outline" size="sm">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Marquer résolu
                </Button>
                <Button variant="outline" size="sm">
                  <XCircle className="mr-2 h-4 w-4" />
                  Ignorer
                </Button>
              </>
            )}
            {selectedCount === 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredData.length} alerte{filteredData.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Colonnes
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end"
                className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    const columnNames: Record<string, string> = {
                      severity: "Priorité",
                      ruleName: "Type d'anomalie",
                      leadId: "N° Lead",
                      status: "Statut",
                      campaign: "Formation",
                      agent: "Agent",
                      wrapupName: "Qualification",
                      tryNumber: "Tentative",
                      talkDuration: "Durée",
                      detectedAt: "Détecté",
                    };
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {columnNames[column.id] || column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <CheckCircle2 className="h-8 w-8 text-gray-300" />
                    Aucune alerte trouvée
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Réinitialiser les filtres
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {selectedCount > 0 ? (
            <span>{selectedCount} sur {filteredData.length} sélectionnée{selectedCount > 1 ? "s" : ""}</span>
          ) : (
            <span>
              Page {table.getState().pagination.pageIndex + 1} sur{" "}
              {table.getPageCount()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Lignes par page</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              {"<<"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {"<"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {">"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              {">>"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
