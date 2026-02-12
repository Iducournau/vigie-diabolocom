import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

const iconColorVariants = {
  indigo: "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
  emerald: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
  blue: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
  purple: "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
  amber: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
  cyan: "bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400",
  gray: "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  red: "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400",
  green: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400",
} as const;

type IconColor = keyof typeof iconColorVariants;

interface InfoFieldProps {
  label: string;
  value: string | React.ReactNode;
  icon?: LucideIcon;
  iconColor?: IconColor;
  copiable?: boolean;
  onCopy?: () => void;
  className?: string;
}

export function InfoField({
  label,
  value,
  icon: Icon,
  iconColor = "gray",
  copiable = false,
  onCopy,
  className,
}: InfoFieldProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {Icon && (
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            iconColorVariants[iconColor]
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium text-foreground">
            {value}
          </p>
          {copiable && onCopy && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={onCopy}
              title={`Copier ${label}`}
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
