import { cn } from "@/lib/utils";
import type { StatusLancamento } from "@/types/financeiro";

export const StatusBadge = ({ status, className }: { status: StatusLancamento; className?: string }) => (
  <span
    className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium",
      status === "confirmado"
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
        : "bg-muted text-muted-foreground line-through",
      className
    )}
  >
    {status === "confirmado" ? "Confirmado" : "Cancelado"}
  </span>
);