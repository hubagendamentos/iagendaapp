import { useState, useMemo } from "react";
import { format } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ArrowLeftRight, X, Wallet } from "lucide-react";
import { useCaixa } from "@/contexts/CaixaContext";
import { useFinancialAccounts } from "@/contexts/FinancialAccountsContext";
import { usePlanoContas } from "@/contexts/PlanoContasContext";
import { useUser } from "@/contexts/UserContext";
import { LancamentoModal } from "@/components/financeiro/LancamentoModal";
import { TransferenciaModal } from "@/components/financeiro/TransferenciaModal";
import { PaymentChip } from "@/components/financeiro/PaymentChip";
import { TipoBadge } from "@/components/financeiro/TipoBadge";
import { StatusBadge } from "@/components/financeiro/StatusBadge";
import { MoneyText } from "@/components/financeiro/MoneyText";
import { ORIGEM_LABELS } from "@/types/financeiro";
import { cn } from "@/lib/utils";

export default function Lancamentos() {
  const { lancamentos, cancelarLancamento } = useCaixa();
  const { accounts, getAccountById } = useFinancialAccounts();
  const { getPlanoNome } = usePlanoContas();
  const { user } = useUser();

  const [modal, setModal] = useState(false);
  const [transfModal, setTransfModal] = useState(false);
  const [dateFrom, setDateFrom] = useState(format(new Date(new Date().setDate(1)), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [contaFilter, setContaFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("confirmado");

  const filtered = useMemo(() => {
    return lancamentos.filter((l) => {
      const date = l.dataHora.slice(0, 10);
      if (date < dateFrom || date > dateTo) return false;
      if (contaFilter !== "all" && l.contaFinanceiraId !== contaFilter) return false;
      if (tipoFilter !== "all" && l.tipo !== tipoFilter) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      return true;
    }).sort((a, b) => b.dataHora.localeCompare(a.dataHora));
  }, [lancamentos, dateFrom, dateTo, contaFilter, tipoFilter, statusFilter]);

  const handleCancel = (id: string) => {
    const motivo = window.prompt("Motivo do cancelamento:");
    if (!motivo) return;
    cancelarLancamento(id, motivo, user?.name || "Sistema");
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader
        title="Lançamentos"
        subtitle="Todos os lançamentos financeiros: manuais, da agenda e transferências."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setTransfModal(true)}>
              <ArrowLeftRight className="h-4 w-4 mr-2" /> Transferência
            </Button>
            <Button onClick={() => setModal(true)}>
              <Plus className="h-4 w-4 mr-2" /> Novo Lançamento
            </Button>
          </div>
        }
      />

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
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="entrada">Entradas</SelectItem>
              <SelectItem value="saida">Saídas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead>Forma</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                  <Wallet className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  Nenhum lançamento no período.
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
                  <TableCell className="text-sm whitespace-nowrap">{format(new Date(l.dataHora), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell><TipoBadge tipo={l.tipo} /></TableCell>
                  <TableCell className="text-sm">{getPlanoNome(l.planoContas)}</TableCell>
                  <TableCell className="text-sm">{l.contaFinanceiraId ? getAccountById(l.contaFinanceiraId)?.nome || "—" : "—"}</TableCell>
                  <TableCell><PaymentChip value={l.formaPagamento} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{ORIGEM_LABELS[l.origem]}</TableCell>
                  <TableCell><StatusBadge status={l.status} /></TableCell>
                  <TableCell className="text-right">
                    <MoneyText value={l.valor} tipo={l.tipo} />
                  </TableCell>
                  <TableCell>
                    {l.status === "confirmado" && (
                      <Button variant="ghost" size="icon" onClick={() => handleCancel(l.id)} title="Cancelar">
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <LancamentoModal open={modal} onClose={() => setModal(false)} />
      <TransferenciaModal open={transfModal} onClose={() => setTransfModal(false)} />
    </div>
  );
}