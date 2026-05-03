import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useCaixa, type FormaPagamento } from "@/contexts/CaixaContext";
import { usePlanoContas } from "@/contexts/PlanoContasContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar as CalendarIcon, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

const formaLabels: Record<FormaPagamento, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao: "Cartão",
  convenio: "Convênio",
  outros: "Outros",
};

const professionals = [
  { id: "p1", name: "Dr. João Silva" },
  { id: "p2", name: "Dra. Maria Santos" },
  { id: "p3", name: "Dr. Pedro Lima" },
];

export default function Caixa() {
  const { lancamentos } = useCaixa();
  const { getPlanoNome, planos } = usePlanoContas();

  const [dateFrom, setDateFrom] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formaFilter, setFormaFilter] = useState<string>("all");
  const [profFilter, setProfFilter] = useState<string>("all");
  const [planoFilter, setPlanoFilter] = useState<string>("all");

  const planosUnicosIds = useMemo(() => [...new Set(lancamentos.map((l) => l.planoContas))], [lancamentos]);

  const filtered = useMemo(() => {
    return lancamentos.filter((l) => {
      const date = l.dataHora.slice(0, 10);
      if (date < dateFrom || date > dateTo) return false;
      if (formaFilter !== "all" && l.formaPagamento !== formaFilter) return false;
      if (profFilter !== "all" && l.profissionalId !== profFilter) return false;
      if (planoFilter !== "all" && l.planoContas !== planoFilter) return false;
      return true;
    });
  }, [lancamentos, dateFrom, dateTo, formaFilter, profFilter, planoFilter]);

  const totalEntradas = filtered.filter((l) => l.tipo === "entrada").reduce((s, l) => s + l.valor, 0);
  const totalSaidas = filtered.filter((l) => l.tipo === "saida").reduce((s, l) => s + l.valor, 0);
  const saldo = totalEntradas - totalSaidas;

  const currency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Caixa"
        subtitle="Gestão do caixa com movimentações financeiras."
      />

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">De</span>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[150px]" />
          <span className="text-muted-foreground">Até</span>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[150px]" />
        </div>

        <Select value={formaFilter} onValueChange={setFormaFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Pagamento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Formas</SelectItem>
            {Object.entries(formaLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={profFilter} onValueChange={setProfFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Profissional" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Profissionais</SelectItem>
            {professionals.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={planoFilter} onValueChange={setPlanoFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Plano de contas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Planos</SelectItem>
            {planosUnicosIds.map((p) => (
              <SelectItem key={p} value={p}>{getPlanoNome(p)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Totais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total de entradas</p>
          <p className="text-xl font-bold text-emerald-600">{currency(totalEntradas)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total de saídas</p>
          <p className="text-xl font-bold text-red-600">{currency(totalSaidas)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Saldo do período</p>
          <p className={`text-xl font-bold ${saldo >= 0 ? "text-emerald-600" : "text-red-600"}`}>{currency(saldo)}</p>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Forma Pgto.</TableHead>
              <TableHead>Plano de Contas</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <Wallet className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  Nenhuma movimentação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-sm">{format(new Date(l.dataHora), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell className="font-medium">{l.paciente}</TableCell>
                  <TableCell>{l.profissional}</TableCell>
                  <TableCell>{formaLabels[l.formaPagamento]}</TableCell>
                  <TableCell>{getPlanoNome(l.planoContas)}</TableCell>
                  <TableCell className="text-right font-medium text-emerald-600">{currency(l.valor)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}