// ============================================================
// FluxoCaixa.tsx (COMPLETO - Cards mobile com TipoBadge)
// ============================================================
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, TrendingUp, TrendingDown, Scale, ArrowLeftRight, Plus, X } from "lucide-react";
import { useCaixa } from "@/contexts/CaixaContext";
import { useFinancialAccounts } from "@/contexts/FinancialAccountsContext";
import { usePlanoContas } from "@/contexts/PlanoContasContext";
import { useUser } from "@/contexts/UserContext";
import { LancamentoModal } from "@/components/financeiro/LancamentoModal";
import { TransferenciaModal } from "@/components/financeiro/TransferenciaModal";
import { PaymentChip } from "@/components/financeiro/PaymentChip";
import { TipoBadge } from "@/components/financeiro/TipoBadge";
import { StatusBadge } from "@/components/financeiro/StatusBadge";
import { MoneyText, formatBRL } from "@/components/financeiro/MoneyText";
import { ORIGEM_LABELS } from "@/types/financeiro";
import { cn } from "@/lib/utils";

export default function FluxoCaixa() {
  const { lancamentos, cancelarLancamento } = useCaixa();
  const { accounts, getSaldoAtual, getSaldoGeral, getAccountById } = useFinancialAccounts();
  const { getPlanoNome } = usePlanoContas();
  const { user } = useUser();

  const today = format(new Date(), "yyyy-MM-dd");
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [contaFilter, setContaFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("confirmado");
  const [modal, setModal] = useState(false);
  const [transfModal, setTransfModal] = useState(false);

  const periodoFiltrado = useMemo(() => {
    return lancamentos
      .filter((l) => {
        const date = l.dataHora.slice(0, 10);
        if (date < dateFrom || date > dateTo) return false;
        if (contaFilter !== "all" && l.contaFinanceiraId !== contaFilter) return false;
        if (tipoFilter !== "all" && l.tipo !== tipoFilter) return false;
        if (statusFilter !== "all" && l.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => b.dataHora.localeCompare(a.dataHora));
  }, [lancamentos, dateFrom, dateTo, contaFilter, tipoFilter, statusFilter]);

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

  const totalPeriodo = periodoFiltrado
    .filter((l) => l.status === "confirmado" && l.afetaResultado !== false)
    .reduce((s, l) => s + (l.tipo === "entrada" ? l.valor : -l.valor), 0);
  const qtdLancamentosPeriodo = periodoFiltrado.length;

  const handleCancel = (id: string) => {
    const motivo = window.prompt("Motivo do cancelamento:");
    if (!motivo) return;
    cancelarLancamento(id, motivo, user?.name || "Sistema");
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Fluxo de Caixa</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {contaFilter === "all"
              ? "Visão consolidada — transferências internas não impactam o resultado."
              : `Movimentações de ${getAccountById(contaFilter)?.nome ?? ""}.`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setTransfModal(true)} className="h-9 text-xs sm:text-sm">
            <ArrowLeftRight className="h-4 w-4 mr-1.5" /> Transferência
          </Button>
          <Button size="sm" onClick={() => setModal(true)} className="h-9 text-xs sm:text-sm">
            <Plus className="h-4 w-4 mr-1.5" /> Novo Lançamento
          </Button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <MiniCard icon={Scale} label={contaFilter === "all" ? "Saldo Geral" : "Saldo"} value={formatBRL(saldoAtual)} tone={saldoAtual >= 0 ? "neutro" : "saida"} />
        <MiniCard icon={TrendingUp} label="Entradas hoje" value={formatBRL(entradasHoje)} tone="entrada" />
        <MiniCard icon={TrendingDown} label="Saídas hoje" value={formatBRL(saidasHoje)} tone="saida" />
        <MiniCard icon={Wallet} label="Saldo do dia" value={formatBRL(entradasHoje - saidasHoje)} tone={(entradasHoje - saidasHoje) >= 0 ? "entrada" : "saida"} />
      </div>

      {/* Filtros */}
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur py-2 sm:py-3 -mx-3 sm:-mx-6 px-3 sm:px-6 border-b space-y-2">
        <div className="flex items-center gap-2">
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[140px] sm:w-[150px] h-8 sm:h-9 text-xs" />
          <span className="text-xs text-muted-foreground">até</span>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[140px] sm:w-[150px] h-8 sm:h-9 text-xs" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={contaFilter} onValueChange={setContaFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-8 sm:h-9 text-xs"><SelectValue placeholder="Contas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as contas</SelectItem>
              {accounts.filter((a) => a.ativo).map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="flex-1 sm:w-[120px] h-8 sm:h-9 text-xs"><SelectValue placeholder="Tipos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="entrada">Entradas</SelectItem>
                <SelectItem value="saida">Saídas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1 sm:w-[120px] h-8 sm:h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-muted-foreground w-full sm:w-auto sm:ml-auto text-right">
            {qtdLancamentosPeriodo} lançamentos · Total{" "}
            <span className={cn("font-semibold", totalPeriodo >= 0 ? "text-emerald-600" : "text-red-600")}>{formatBRL(totalPeriodo)}</span>
          </div>
        </div>
      </div>

      {/* MOBILE: Cards individuais */}
      <div className="sm:hidden space-y-2">
        {rows.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Wallet className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Sem movimentações no período.</p>
          </div>
        ) : (
          rows.map((r) => {
            if (r.kind === "transferencia") {
              return (
                <div key={r.id} className={cn("border rounded-lg p-3 bg-muted/30", r.status === "cancelado" && "opacity-60")}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium">Transferência</p>
                          <TipoBadge tipo="entrada" />
                        </div>
                        <p className="text-[10px] text-muted-foreground">{format(new Date(r.dataHora), "dd/MM HH:mm")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatBRL(r.valor)}</p>
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{r.origemConta} → {r.destinoConta}</p>
                </div>
              );
            }
            const l = r.l;
            return (
              <div key={l.id} className={cn(
                "border rounded-lg p-3",
                l.status === "confirmado" && (l.tipo === "entrada" ? "bg-emerald-500/5" : "bg-red-500/5"),
                l.status === "cancelado" && "opacity-60"
              )}>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{getPlanoNome(l.planoContas)}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-muted-foreground">{format(new Date(l.dataHora), "dd/MM HH:mm")}</p>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <TipoBadge tipo={l.tipo} />
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <MoneyText value={l.valor} tipo={l.tipo} />
                    <div className="mt-0.5"><StatusBadge status={l.status} /></div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <PaymentChip value={l.formaPagamento} />
                    <span>·</span>
                    <span>{l.contaFinanceiraId ? getAccountById(l.contaFinanceiraId)?.nome : "—"}</span>
                  </div>
                  {l.status === "confirmado" && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCancel(l.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP: Tabela */}
      <div className="hidden sm:block rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Data</TableHead>
                <TableHead className="text-xs">Tipo</TableHead>
                <TableHead className="text-xs">Plano / Descrição</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Conta</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Forma</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Origem</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Valor</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                    <Wallet className="mx-auto h-8 w-8 mb-2 opacity-50" /> Sem movimentações.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => {
                  if (r.kind === "transferencia") {
                    return (
                      <TableRow key={r.id} className={cn("bg-muted/30", r.status === "cancelado" && "opacity-60")}>
                        <TableCell className="text-xs">{format(new Date(r.dataHora), "dd/MM HH:mm")}</TableCell>
                        <TableCell><span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground"><ArrowLeftRight className="h-3 w-3" /> Transf.</span></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.origemConta} → {r.destinoConta}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">—</TableCell>
                        <TableCell className="hidden md:table-cell"><PaymentChip value="transferencia" /></TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">Transferência</TableCell>
                        <TableCell><StatusBadge status={r.status} /></TableCell>
                        <TableCell className="text-right text-xs font-medium">{formatBRL(r.valor)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    );
                  }
                  const l = r.l;
                  const isTransfer = l.origem === "transferencia";
                  return (
                    <TableRow key={l.id} className={cn(
                      l.status === "confirmado" && !isTransfer && (l.tipo === "entrada" ? "bg-emerald-500/5" : "bg-red-500/5"),
                      isTransfer && "bg-muted/30",
                      l.status === "cancelado" && "opacity-60"
                    )}>
                      <TableCell className="text-xs whitespace-nowrap">{format(new Date(l.dataHora), "dd/MM HH:mm")}</TableCell>
                      <TableCell>{isTransfer ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground"><ArrowLeftRight className="h-3 w-3" /> {l.tipo === "entrada" ? "Tr.E" : "Tr.S"}</span>
                      ) : <TipoBadge tipo={l.tipo} />}</TableCell>
                      <TableCell className="text-xs">{isTransfer ? (l.descricao || "Transferência") : getPlanoNome(l.planoContas)}</TableCell>
                      <TableCell className="text-xs hidden md:table-cell">{l.contaFinanceiraId ? getAccountById(l.contaFinanceiraId)?.nome : "—"}</TableCell>
                      <TableCell className="hidden md:table-cell"><PaymentChip value={l.formaPagamento} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{ORIGEM_LABELS[l.origem] || l.origem}</TableCell>
                      <TableCell><StatusBadge status={l.status} /></TableCell>
                      <TableCell className="text-right">{isTransfer ? <span className="text-xs font-medium">{formatBRL(l.valor)}</span> : <MoneyText value={l.valor} tipo={l.tipo} />}</TableCell>
                      <TableCell>
                        {l.status === "confirmado" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCancel(l.id)}><X className="h-3.5 w-3.5" /></Button>
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

      <LancamentoModal open={modal} onClose={() => setModal(false)} />
      <TransferenciaModal open={transfModal} onClose={() => setTransfModal(false)} />
    </div>
  );
}

function MiniCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "entrada" | "saida" | "neutro" }) {
  const cls =
    tone === "entrada"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "saida"
        ? "text-red-600 dark:text-red-400"
        : "text-foreground";
  return (
    <div className="rounded-lg border bg-card p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] sm:text-xs text-muted-foreground truncate mr-1">{label}</p>
        <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0", cls)} />
      </div>
      <p className={cn("text-base sm:text-xl font-bold mt-0.5 sm:mt-1 tabular-nums", cls)}>{value}</p>
    </div>
  );
}