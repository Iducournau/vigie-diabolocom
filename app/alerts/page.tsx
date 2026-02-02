"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ColumnDef,
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
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  X,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Circle,
  Clock,
  Settings2,
  CheckIcon,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Severity, AlertStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { styles } from "@/lib/styles";
import {
  RULES_MAP,
  CAMPAIGNS_MAP,
  getCampaignName,
  getRuleInfo,
  mapStatus,
  formatTimeAgo,
} from "@/lib/constants";

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
  agent?: string;
  // Colonnes dynamiques (depuis alert_data)
  lastCall?: Date;
  wrapup?: string;
  talkDuration?: number;
  tryNumber?: number;
  callCount?: number;
  wrapupList?: string;
  retryDate?: Date;
  delayHours?: number;
}

// Options pour les filtres avec icônes
const severityOptions = [
  { label: "Critique", value: "critical", icon: ArrowUp },
  { label: "Attention", value: "warning", icon: ArrowRight },
  { label: "Info", value: "info", icon: ArrowDown },
];

const statusOptions = [
  { label: "Nouvelle", value: "new", icon: Circle },
  { label: "En cours", value: "acknowledged", icon: Clock },
  { label: "Résolue", value: "resolved", icon: CheckCircle2 },
  { label: "Ignorée", value: "dismissed", icon: XCircle },
];

const ruleOptions = Object.entries(RULES_MAP).map(([id, rule]) => ({
  label: rule.name,
  value: id,
}));

const campaignOptions = Object.entries(CAMPAIGNS_MAP).map(([id, name]) => ({
  label: name,
  value: id,
}));

// Labels des colonnes pour le bouton View
const columnLabels: Record<string, string> = {
  leadId: "Lead",
  ruleName: "Règle",
  status: "Statut",
  campaign: "Formation",
  agent: "Agent",
  detectedAt: "Détecté",
  lastCall: "Dernier appel",
  wrapup: "Wrapup",
  talkDuration: "Durée conversation",
  tryNumber: "N° tentative",
  callCount: "Nb appels",
  wrapupList: "Liste wrapups",
  retryDate: "Date retry",
  delayHours: "Délai (h)",
};

// Composant Faceted Filter inline
interface FacetedFilterProps {
  title: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  selectedValues: Set<string>;
  onSelectionChange: (values: Set<string>) => void;
  facets?: Map<string, number>;
}

function FacetedFilter({
  title,
  options,
  selectedValues,
  onSelectionChange,
  facets,
}: FacetedFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="size-4" />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} sélectionnés
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>Aucun résultat.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      const newValues = new Set(selectedValues);
                      if (isSelected) {
                        newValues.delete(option.value);
                      } else {
                        newValues.add(option.value);
                      }
                      onSelectionChange(newValues);
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border border-gray-300 dark:border-gray-600",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "[&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className="h-3 w-3" />
                    </div>
                    {option.icon && (
                      <option.icon className="text-muted-foreground size-4" />
                    )}
                    <span className="flex-1">{option.label}</span>
                    {facets?.get(option.value) !== undefined && (
                      <span className="ml-auto font-mono text-xs text-muted-foreground">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onSelectionChange(new Set())}
                    className="justify-center text-center"
                  >
                    Effacer les filtres
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
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
        aria-label="Sélectionner"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "leadId",
    header: () => <span className="text-sm font-medium">Lead</span>,
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue("leadId")}</div>
    ),
  },
  {
    accessorKey: "ruleName",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
            >
              <span>Règle</span>
              <ChevronsUpDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUp className="text-muted-foreground size-4" />
              Asc
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDown className="text-muted-foreground size-4" />
              Desc
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    cell: ({ row }) => {
      const severity = row.original.severity;
      return (
        <div className="flex gap-2">
          <Badge variant={severity}>{row.getValue("ruleName")}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
            >
              <span>Statut</span>
              <ChevronsUpDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUp className="text-muted-foreground size-4" />
              Asc
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDown className="text-muted-foreground size-4" />
              Desc
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as AlertStatus;
      const statusConfig: Record<
        AlertStatus,
        {
          label: string;
          icon: React.ComponentType<{ className?: string }>;
        }
      > = {
        new: { label: "Nouvelle", icon: Circle },
        acknowledged: { label: "En cours", icon: Clock },
        resolved: { label: "Résolue", icon: CheckCircle2 },
        dismissed: { label: "Ignorée", icon: XCircle },
        ignored: { label: "Ignorée", icon: XCircle },
      };
      const config = statusConfig[status] || statusConfig.new;
      const Icon = config.icon;
      return (
        <div className="flex w-[100px] items-center gap-2">
          <Icon className="text-muted-foreground size-4" />
          <span>{config.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "campaign",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
            >
              <span>Formation</span>
              <ChevronsUpDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUp className="text-muted-foreground size-4" />
              Asc
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDown className="text-muted-foreground size-4" />
              Desc
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate font-medium">
        {row.getValue("campaign")}
      </span>
    ),
  },
  {
    accessorKey: "agent",
    header: () => <span className="text-sm font-medium">Agent</span>,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue("agent") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "detectedAt",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
            >
              <span>Détecté</span>
              <ChevronsUpDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUp className="text-muted-foreground size-4" />
              Asc
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDown className="text-muted-foreground size-4" />
              Desc
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatTimeAgo(row.getValue("detectedAt"))}
      </span>
    ),
  },
  // Colonnes dynamiques (masquées par défaut)
  {
    accessorKey: "lastCall",
    header: () => <span className="text-sm font-medium">Dernier appel</span>,
    cell: ({ row }) => {
      const value = row.getValue("lastCall") as Date | undefined;
      return (
        <span className="text-muted-foreground">
          {value ? formatTimeAgo(value) : "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "wrapup",
    header: () => <span className="text-sm font-medium">Wrapup</span>,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue("wrapup") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "talkDuration",
    header: () => <span className="text-sm font-medium">Durée (s)</span>,
    cell: ({ row }) => {
      const value = row.getValue("talkDuration") as number | undefined;
      return (
        <span className="text-muted-foreground">
          {value !== undefined ? `${value}s` : "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "tryNumber",
    header: () => <span className="text-sm font-medium">N° tent.</span>,
    cell: ({ row }) => {
      const value = row.getValue("tryNumber") as number | undefined;
      return (
        <span className="text-muted-foreground">
          {value !== undefined ? value : "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "callCount",
    header: () => <span className="text-sm font-medium">Nb appels</span>,
    cell: ({ row }) => {
      const value = row.getValue("callCount") as number | undefined;
      return (
        <span className="text-muted-foreground">
          {value !== undefined ? value : "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "wrapupList",
    header: () => <span className="text-sm font-medium">Wrapups</span>,
    cell: ({ row }) => (
      <span className="text-muted-foreground max-w-[150px] truncate">
        {row.getValue("wrapupList") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "retryDate",
    header: () => <span className="text-sm font-medium">Date retry</span>,
    cell: ({ row }) => {
      const value = row.getValue("retryDate") as Date | undefined;
      return (
        <span className="text-muted-foreground">
          {value ? formatTimeAgo(value) : "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "delayHours",
    header: () => <span className="text-sm font-medium">Délai (h)</span>,
    cell: ({ row }) => {
      const value = row.getValue("delayHours") as number | undefined;
      return (
        <span className="text-muted-foreground">
          {value !== undefined ? `${value}h` : "—"}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const alert = row.original;
      const meta = table.options.meta as { onAction?: (id: string, action: string) => void } | undefined;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 data-[state=open]:bg-muted"
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/alerts/${alert.id}`}>
                <Eye className="size-4" />
                Voir détail
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => meta?.onAction?.(alert.id, "resolved")}>
              <CheckCircle2 className="size-4" />
              Résoudre
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta?.onAction?.(alert.id, "ignored")}>
              <XCircle className="size-4" />
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
  const [refreshing, setRefreshing] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "detectedAt", desc: true },
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // Colonnes dynamiques masquées par défaut
    lastCall: false,
    wrapup: false,
    talkDuration: false,
    tryNumber: false,
    callCount: false,
    wrapupList: false,
    retryDate: false,
    delayHours: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Filtres
  const [severityFilter, setSeverityFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [ruleFilter, setRuleFilter] = useState<Set<string>>(new Set());
  const [campaignFilter, setCampaignFilter] = useState<Set<string>>(new Set());

  async function fetchAlerts() {
    try {
      const { data: alertsData, error } = await supabase
        .from("alerts")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(500);

      if (error) {
        console.error("Erreur fetch alertes:", error);
        setLoading(false);
        return;
      }

      const transformed: AlertRow[] = (alertsData || []).map((data) => {
        const ruleInfo = getRuleInfo(data.rule_id);
        const alertData =
          typeof data.alert_data === "string"
            ? JSON.parse(data.alert_data)
            : data.alert_data || {};

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
          agent: alertData.user_login1 || alertData.user_login || alertData.agent || alertData.lastUpdatedBy,
          // Colonnes dynamiques depuis alert_data
          lastCall: alertData.last_call || alertData.call_start
            ? new Date(alertData.last_call || alertData.call_start)
            : undefined,
          wrapup: alertData.wrapup || alertData.wrapup_name,
          talkDuration: alertData.talk_duration,
          tryNumber: alertData.try_number,
          callCount: alertData.call_count || alertData.total_calls,
          wrapupList: alertData.wrapup_list,
          retryDate: alertData.retry_date ? new Date(alertData.retry_date) : undefined,
          delayHours: alertData.delay_hours || alertData.hours_since_retry,
        };
      });

      setData(transformed);
      setLoading(false);
    } catch (err) {
      console.error("Erreur fetch alertes:", err);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Filtrage des données
  const filteredData = useMemo(() => {
    return data.filter((alert) => {
      if (severityFilter.size > 0 && !severityFilter.has(alert.severity))
        return false;
      if (statusFilter.size > 0 && !statusFilter.has(alert.status))
        return false;
      if (ruleFilter.size > 0 && !ruleFilter.has(alert.ruleId)) return false;
      if (campaignFilter.size > 0 && !campaignFilter.has(alert.campaignId))
        return false;
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
  }, [
    data,
    severityFilter,
    statusFilter,
    ruleFilter,
    campaignFilter,
    globalFilter,
  ]);

  // Facets (compteurs)
  const severityFacets = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((alert) => {
      map.set(alert.severity, (map.get(alert.severity) || 0) + 1);
    });
    return map;
  }, [data]);

  const statusFacets = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((alert) => {
      map.set(alert.status, (map.get(alert.status) || 0) + 1);
    });
    return map;
  }, [data]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
    meta: {
      onAction: handleSingleAction,
    },
  });

  const hasActiveFilters =
    severityFilter.size > 0 ||
    statusFilter.size > 0 ||
    ruleFilter.size > 0 ||
    campaignFilter.size > 0 ||
    globalFilter !== "";

  function clearFilters() {
    setSeverityFilter(new Set());
    setStatusFilter(new Set());
    setRuleFilter(new Set());
    setCampaignFilter(new Set());
    setGlobalFilter("");
  }

  // Mise à jour du statut d'une alerte
  async function updateAlertStatus(alertId: string, newStatus: string) {
    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === "resolved") {
      updateData.resolved_at = new Date().toISOString();
      updateData.resolved_by = "Utilisateur";
    }

    const { error } = await supabase
      .from("alerts")
      .update(updateData)
      .eq("id", alertId);

    if (error) {
      console.error("Erreur mise à jour:", error);
      return false;
    }
    return true;
  }

  // Actions de masse
  async function handleBulkAction(action: "resolved" | "ignored") {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    const promises = selectedRows.map((row) =>
      updateAlertStatus(row.original.id, action)
    );

    const results = await Promise.all(promises);
    const successCount = results.filter(Boolean).length;

    if (successCount > 0) {
      toast.success(
        action === "resolved"
          ? `${successCount} alerte(s) résolue(s)`
          : `${successCount} alerte(s) ignorée(s)`
      );
      table.resetRowSelection();
      fetchAlerts();
    } else {
      toast.error("Erreur lors de la mise à jour");
    }
  }

  // Action individuelle
  async function handleSingleAction(alertId: string, action: "resolved" | "ignored") {
    const success = await updateAlertStatus(alertId, action);
    if (success) {
      toast.success(action === "resolved" ? "Alerte résolue" : "Alerte ignorée");
      fetchAlerts();
    } else {
      toast.error("Erreur lors de la mise à jour");
    }
  }

  // Rafraîchir les alertes via webhook n8n
  async function handleRefresh() {
    setRefreshing(true);
    try {
      const response = await fetch("https://n8n.vps.youschool.fr/webhook/refresh-alerts", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Erreur webhook: ${response.status}`);
      }

      await fetchAlerts();
      toast.success("Alertes rafraîchies");
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
      toast.error("Erreur lors du rafraîchissement des alertes");
    } finally {
      setRefreshing(false);
    }
  }

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  if (loading) {
    return (
      <div className={styles.loading.wrapper}>
        <Loader2 className={styles.loading.spinner} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Alertes</h2>
          <p className="text-muted-foreground">
            Gérez les anomalies détectées par Vigie
          </p>
        </div>
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

      {/* Toolbar */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center gap-2">
            {/* Recherche sans icône */}
            <Input
              placeholder="Filtrer les alertes..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-8 w-[150px] lg:w-[250px]"
            />

            {/* Filtres faceted */}
            <FacetedFilter
              title="Sévérité"
              options={severityOptions}
              selectedValues={severityFilter}
              onSelectionChange={setSeverityFilter}
              facets={severityFacets}
            />
            <FacetedFilter
              title="Statut"
              options={statusOptions}
              selectedValues={statusFilter}
              onSelectionChange={setStatusFilter}
              facets={statusFacets}
            />
            <FacetedFilter
              title="Règle"
              options={ruleOptions}
              selectedValues={ruleFilter}
              onSelectionChange={setRuleFilter}
            />
            <FacetedFilter
              title="Formation"
              options={campaignOptions}
              selectedValues={campaignFilter}
              onSelectionChange={setCampaignFilter}
            />

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-8 px-2 lg:px-3"
              >
                Réinitialiser
                <X className="size-4" />
              </Button>
            )}
          </div>

          {/* Bouton View */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto hidden h-8 lg:flex"
                >
                  <Settings2 className="size-4" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuLabel>Afficher/Masquer</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => {
                    const label = columnLabels[column.id] || column.id;
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {label}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Actions de masse */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedCount} sélectionnée{selectedCount > 1 ? "s" : ""}
            </span>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction("resolved")}>
              <CheckCircle2 className="size-4" />
              Résoudre
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction("ignored")}>
              <XCircle className="size-4" />
              Ignorer
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.id === "select" ? "w-[40px]" : undefined}
                  >
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
                    <TableCell
                      key={cell.id}
                      className={cell.column.id === "select" ? "w-[40px]" : undefined}
                    >
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="size-8 opacity-50" />
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
      <div className="flex items-center justify-between px-2">
        <div className="text-muted-foreground flex-1 text-sm">
          {selectedCount} sur {filteredData.length} ligne(s) sélectionnée(s).
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Lignes par page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
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
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} sur{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Première page</span>
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Page précédente</span>
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Page suivante</span>
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Dernière page</span>
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
