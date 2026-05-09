import { cn } from "@/lib/utils";
import { FORMA_PAGAMENTO_LABELS, type FormaPagamento } from "@/types/financeiro";

const colors: Record<FormaPagamento, string> = {
  dinheiro: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  pix: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
  credito: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  debito: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  boleto: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  transferencia: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  convenio: "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
};

export const PaymentChip = ({ value, className }: { value: FormaPagamento; className?: string }) => (
  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium", colors[value], className)}>
    {FORMA_PAGAMENTO_LABELS[value]}
  </span>
);