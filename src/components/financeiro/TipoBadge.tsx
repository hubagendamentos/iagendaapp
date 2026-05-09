import { cn } from "@/lib/utils";
import type { TipoFinanceiro } from "@/types/financeiro";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export const TipoBadge = ({ tipo, className }: { tipo: TipoFinanceiro; className?: string }) => {
  const isEntrada = tipo === "entrada";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
        isEntrada ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
        className
      )}
    >
      {isEntrada ? <ArrowUpCircle className="h-3 w-3" /> : <ArrowDownCircle className="h-3 w-3" />}
      {isEntrada ? "Entrada" : "Saída"}
    </span>
  );
};