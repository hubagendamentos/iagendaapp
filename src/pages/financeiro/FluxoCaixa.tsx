import { useState, useMemo } from "react";
import { format } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, TrendingUp, TrendingDown, Scale, ArrowLeftRight } from "lucide-react";
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
  const { accounts, getSaldoAtual, getSaldoGeral, getAccountById } = useFinancialAccounts();
  const { getPlanoNome } = usePlanoContas();

  const today = format(new Date(), "yyyy-MM-dd");
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [contaFilter, setContaFilter] = useState("all");

  // Lançamentos no período + filtro de conta
  const periodoFiltrado = useMemo(() => {
    return lancamentos
      .filter((l) => {
        const date = l.dataHora.slice(0, 10);
        if (date < dateFrom || date > dateTo) return false;
        if (contaFilter !== "all" && l.contaFinanceiraId !== contaFilter) return false;
        return true;
      })
      .sort((a, b) => b.dataHora.localeCompare(a.dataHora));
  }, [lancamentos, dateFrom, dateTo, contaFilter]);

  // Agrupar transferências em linhas únicas (apenas na visão consolidada)
  type Row =
    | { kind: "lancamento"; l: typeof lancamentos[number] }
    | { kind: "transferencia"; id: string; dataHora: string; valor: number; origemConta?: string; destinoConta?: string; status: typeof lancamentos[number]["status"] };

  const rows: Row[] = useMemo(() => {
    if (contaFilter !== "all") {
      return periodoFiltrado.map((l) => ({ kind: "lancamento" as const, l }));
    }
    const seenTransfer = new Set<string>();
    const out: Row[] = [];
    for (const l of periodoFiltrado) {
      if (l.origem === "transferencia" && l.transferenciaId) {
        if (seenTransfer.has(l.transferenciaId)) continue;
        seenTransfer.add(l.transferenciaId);
        const pair = lancamentos.filter((x) => x.transferenciaId === l.transferenciaId);
        const saida = pair.find((x) => x.tipo === "saida");
        const entrada = pair.find((x) => x.tipo === "entrada");
        out.push({
          kind: "transferencia",
          id: l.transferenciaId,
          dataHora: l.dataHora,
          valor: l.valor,
          origemConta: saida?.contaFinanceiraId ? getAccountById(saida.contaFinanceiraId)?.nome : undefined,
          destinoConta: entrada?.contaFinanceiraId ? getAccountById(entrada.contaFinanceiraId)?.nome : undefined,
          status: l.status,
        });
      } else {
        out.push({ kind: "lancamento", l });
      }
    }
    return out;
  }, [periodoFiltrado, contaFilter, lancamentos, getAccountById]);

  // Cards: ignoram transferências (afetaResultado === false)
  const isHoje = (d: string) => d.slice(0, 10) === today;
  const escopoCards = lancamentos.filter((l) =>
    contaFilter === "all" ? true : l.contaFinanceiraId === contaFilter
  );
  const entradasHoje = escopoCards
    .filter((l) => l.status === "confirmado" && l.tipo === "entrada" && l.afetaResultado !== false && isHoje(l.dataHora))
    .reduce((s, l) => s + l.valor, 0);
  const saidasHoje = escopoCards
    .filter((l) => l.status === "confirmado" && l.tipo === "saida" && l.afetaResultado !== false && isHoje(l.dataHora))
    .reduce((s, l) => s + l.valor, 0);
  const saldoAtual = contaFilter === "all" ? getSaldoGeral() : getSaldoAtual(contaFilter);

  // Total no período (cards "Total" da barra) também ignora transferências
  const totalPeriodo = periodoFiltrado
    .filter((l) => l.status === "confirmado" && l.afetaResultado !== false)
    .reduce((s, l) => s + (l.tipo === "entrada" ? l.valor : -l.valor), 0);
  const qtdLancamentosPeriodo = periodoFiltrado.filter(
    (l) => l.status === "confirmado" && l.afetaResultado !== false
  ).length;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader
        title="Fluxo de Caixa"
        subtitle={
          contaFilter === "all"
            ? "Visão consolidada — transferências internas não impactam o resultado."
            : `Movimentações de ${getAccountById(contaFilter)?.nome ?? ""}.`
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card
          icon={Scale}
          label={contaFilter === "all" ? "Saldo Geral" : "Saldo da Conta"}
          value={formatBRL(saldoAtual)}
          tone={saldoAtual >= 0 ? "neutro" : "saida"}
        />
        <Card icon={TrendingUp} label="Entradas hoje" value={formatBRL(entradasHoje)} tone="entrada" />
        <Card icon={TrendingDown} label="Saídas hoje" value={formatBRL(saidasHoje)} tone="saida" />
        <Card icon={Wallet} label="Saldo do dia" value={formatBRL(entradasHoje - saidasHoje)} tone={(entradasHoje - saidasHoje) >= 0 ? "entrada" : "saida"} />
      </div>

      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur py-3 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b">
        <div className="flex flex-wrap gap-3 items-end">
          <Select value={contaFilter} onValueChange={setContaFilter}>
            <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as contas</SelectItem>
              {accounts.filter((a) => a.ativo).map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[150px]" />
            <span className="text-sm text-muted-foreground">até</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[150px]" />
          </div>
          <div className="ml-auto text-sm text-muted-foreground">
            {qtdLancamentosPeriodo} lançamentos · Total{" "}
            <span className="font-semibold text-foreground">{formatBRL(totalPeriodo)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Forma</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  <Wallet className="mx-auto h-8 w-8 mb-2 opacity-50" /> Sem movimentações no período.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => {
                if (r.kind === "transferencia") {
                  return (
                    <TableRow key={r.id} className={cn("bg-muted/30 hover:bg-muted/50", r.status === "cancelado" && "opacity-60")}>
                      <TableCell className="text-sm whitespace-nowrap">{format(new Date(r.dataHora), "dd/MM HH:mm")}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground">
                          <ArrowLeftRight className="h-3 w-3" /> Transferência
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.origemConta ?? "—"} <ArrowLeftRight className="inline h-3 w-3 mx-1" /> {r.destinoConta ?? "—"}
                      </TableCell>
                      <TableCell><PaymentChip value="transferencia" /></TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell className="text-right text-sm font-medium tabular-nums text-muted-foreground">{formatBRL(r.valor)}</TableCell>
                    </TableRow>
                  );
                }
                const l = r.l;
                const isTransfer = l.origem === "transferencia";
                return (
                  <TableRow
                    key={l.id}
                    className={cn(
                      l.status === "confirmado" && !isTransfer && (l.tipo === "entrada" ? "bg-emerald-500/5 hover:bg-emerald-500/10" : "bg-red-500/5 hover:bg-red-500/10"),
                      isTransfer && "bg-muted/30 hover:bg-muted/50",
                      l.status === "cancelado" && "opacity-60"
                    )}
                  >
                    <TableCell className="text-sm whitespace-nowrap">{format(new Date(l.dataHora), "dd/MM HH:mm")}</TableCell>
                    <TableCell>
                      {isTransfer ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground">
                          <ArrowLeftRight className="h-3 w-3" /> {l.tipo === "entrada" ? "Transf. entrada" : "Transf. saída"}
                        </span>
                      ) : (
                        <TipoBadge tipo={l.tipo} />
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{isTransfer ? (l.descricao || "Transferência entre contas") : getPlanoNome(l.planoContas)}</TableCell>
                    <TableCell><PaymentChip value={l.formaPagamento} /></TableCell>
                    <TableCell><StatusBadge status={l.status} /></TableCell>
                    <TableCell className="text-right">
                      {isTransfer ? (
                        <span className="text-sm font-medium tabular-nums text-muted-foreground">{formatBRL(l.valor)}</span>
                      ) : (
                        <MoneyText value={l.valor} tipo={l.tipo} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
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