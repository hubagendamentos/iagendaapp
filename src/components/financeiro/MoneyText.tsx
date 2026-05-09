import { cn } from "@/lib/utils";

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const MoneyText = ({
  value,
  tipo,
  className,
}: {
  value: number;
  tipo?: "entrada" | "saida" | "neutro";
  className?: string;
}) => {
  const cls =
    tipo === "entrada"
      ? "text-emerald-600 dark:text-emerald-400"
      : tipo === "saida"
      ? "text-red-600 dark:text-red-400"
      : "text-foreground";
  return (
    <span className={cn("font-semibold tabular-nums", cls, className)}>
      {tipo === "saida" ? "- " : ""}{formatBRL(value)}
    </span>
  );
};