import { useState, useMemo } from "react";
import { format } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, TrendingUp, TrendingDown, Scale } from "lucide-react";
import { useCaixa } from "@/contexts/CaixaContext";
import { useFinancialAccounts } from "@/contexts/FinancialAccountsContext";
import { usePlanoContas } from "@/contexts/PlanoContasContext";
import { PaymentChip } from "@/components/financeiro/PaymentChip";
import { TipoBadge } from "@/components/financeiro/TipoBadge";
import { StatusBadge } from "@/components/financeiro/StatusBadge";
import { MoneyText, formatBRL } from "@/components/financeiro/MoneyText";
import { cn } from "@/lib/utils";

export default function FluxoCaixa() {
  const { lancamentos } = useCaixa();
  const { accounts, getSaldoAtual, getSaldoGeral } = useFinancialAccounts();
  const { getPlanoNome } = usePlanoContas();

  const today = format(new Date(), "yyyy-MM-dd");
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [contaFilter, setContaFilter] = useState("all");

  const filtered = useMemo(() => {
    return lancamentos
      .filter((l) => {
        const date = l.dataHora.slice(0, 10);
        if (date < dateFrom || date > dateTo) return false;
        if (contaFilter !== "all" && l.contaFinanceiraId !== contaFilter) return false;
        return true;
      })
      .sort((a, b) => b.dataHora.localeCompare(a.dataHora));
  }, [lancamentos, dateFrom, dateTo, contaFilter]);

  const confirmados = filtered.filter((l) => l.status === "confirmado");
  const entradasHoje = lancamentos.filter((l) => l.status === "confirmado" && l.tipo === "entrada" && l.dataHora.slice(0, 10) === today).reduce((s, l) => s + l.valor, 0);
  const saidasHoje = lancamentos.filter((l) => l.status === "confirmado" && l.tipo === "saida" && l.dataHora.slice(0, 10) === today).reduce((s, l) => s + l.valor, 0);
  const saldoGeral = getSaldoGeral();

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader title="Fluxo de Caixa" subtitle="Visão consolidada das movimentações financeiras." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card icon={Scale} label="Saldo Geral" value={formatBRL(saldoGeral)} tone={saldoGeral >= 0 ? "neutro" : "saida"} />
        <Card icon={TrendingUp} label="Entradas hoje" value={formatBRL(entradasHoje)} tone="entrada" />
        <Card icon={TrendingDown} label="Saídas hoje" value={formatBRL(saidasHoje)} tone="saida" />
        <Card icon={Wallet} label="Saldo do dia" value={formatBRL(entradasHoje - saidasHoje)} tone={(entradasHoje - saidasHoje) >= 0 ? "entrada" : "saida"} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {accounts.filter((a) => a.ativo).map((a) => {
          const s = getSaldoAtual(a.id);
          return (
            <div key={a.id} className="rounded-md border bg-card px-3 py-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: a.cor }} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-muted-foreground truncate">{a.nome}</p>
                <p className={cn("text-sm font-semibold tabular-nums", s >= 0 ? "text-foreground" : "text-red-600")}>{formatBRL(s)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur py-3 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex items-center gap-2">
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[150px]" />
            <span className="text-sm text-muted-foreground">até</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[150px]" />
          </div>
          <Select value={contaFilter} onValueChange={setContaFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as contas</SelectItem>
              {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="ml-auto text-sm text-muted-foreground">
            {confirmados.length} lançamentos · Total{" "}
            <span className="font-semibold text-foreground">
              {formatBRL(confirmados.reduce((s, l) => s + (l.tipo === "entrada" ? l.valor : -l.valor), 0))}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Forma</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  <Wallet className="mx-auto h-8 w-8 mb-2 opacity-50" /> Sem movimentações no período.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((l) => (
                <TableRow
                  key={l.id}
                  className={cn(
                    l.status === "confirmado" && (l.tipo === "entrada" ? "bg-emerald-500/5 hover:bg-emerald-500/10" : "bg-red-500/5 hover:bg-red-500/10"),
                    l.status === "cancelado" && "opacity-60"
                  )}
                >
                  <TableCell className="text-sm whitespace-nowrap">{format(new Date(l.dataHora), "dd/MM HH:mm")}</TableCell>
                  <TableCell><TipoBadge tipo={l.tipo} /></TableCell>
                  <TableCell className="text-sm">{getPlanoNome(l.planoContas)}</TableCell>
                  <TableCell><PaymentChip value={l.formaPagamento} /></TableCell>
                  <TableCell><StatusBadge status={l.status} /></TableCell>
                  <TableCell className="text-right"><MoneyText value={l.valor} tipo={l.tipo} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Card({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "entrada" | "saida" | "neutro" }) {
  const cls =
    tone === "entrada"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "saida"
      ? "text-red-600 dark:text-red-400"
      : "text-foreground";
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className={cn("h-4 w-4", cls)} />
      </div>
      <p className={cn("text-xl font-bold mt-1 tabular-nums", cls)}>{value}</p>
    </div>
  );
}