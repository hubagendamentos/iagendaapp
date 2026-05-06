// ============================================================
// EncerrarAtendimentoModal.tsx (FINAL - sem pagamento parcial)
// ============================================================
import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { Appointment } from "@/components/AppointmentModal";
import type { FormaPagamento } from "@/contexts/CaixaContext";
import { CreditCard, Wallet, Trash2, CheckCircle2 } from "lucide-react";
import { usePlanoContas } from "@/contexts/PlanoContasContext";
import { format } from "date-fns";
import { toast } from "sonner";

const formasPagamento: { value: FormaPagamento; label: string }[] = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao", label: "Cartão" },
  { value: "convenio", label: "Convênio" },
  { value: "outros", label: "Outros" },
];

interface PagamentoRealizado {
  valor: number;
  formaPagamento: FormaPagamento;
  planoContasId: string;
}

interface PagamentoLinha {
  id: string;
  valor: string;
  formaPagamento: FormaPagamento | "";
  planoContasId: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment;
  profissionalNome: string;
  onConfirm: (data: { pagamentos: PagamentoRealizado[]; totalComDesconto: number }) => void;
}

export function EncerrarAtendimentoModal({ open, onOpenChange, appointment, profissionalNome, onConfirm }: Props) {
  const { getPlanosReceita } = usePlanoContas();
  const planosReceita = getPlanosReceita();

  const valorTotal = appointment.price ?? 0;
  const valorJaPago = appointment.valor_pago ?? 0;
  const valorRestante = Math.max(0, valorTotal - valorJaPago);

  const [desconto, setDesconto] = useState("0");
  const descontoValor = parseFloat(desconto) || 0;
  const totalComDesconto = Math.max(0, valorRestante - descontoValor);

  const [pagamentosConfirmados, setPagamentosConfirmados] = useState<PagamentoRealizado[]>([]);

  const [linhaAtual, setLinhaAtual] = useState<PagamentoLinha>({
    id: crypto.randomUUID(),
    valor: "",
    formaPagamento: "",
    planoContasId: "",
  });

  const totalJaConfirmado = useMemo(
    () => pagamentosConfirmados.reduce((s, p) => s + p.valor, 0),
    [pagamentosConfirmados]
  );

  const restanteApos = totalComDesconto - totalJaConfirmado;

  // Atualiza sugestão de valor
  useEffect(() => {
    if (pagamentosConfirmados.length === 0 && restanteApos > 0) {
      setLinhaAtual((prev) => ({ ...prev, valor: restanteApos.toFixed(2) }));
    } else {
      setLinhaAtual((prev) => ({ ...prev, valor: restanteApos > 0.01 ? restanteApos.toFixed(2) : "" }));
    }
  }, [descontoValor, totalComDesconto, pagamentosConfirmados.length]);

  const linhaPreenchida =
    parseFloat(linhaAtual.valor) > 0 &&
    linhaAtual.formaPagamento !== "" &&
    linhaAtual.planoContasId !== "";

  const removerPagamento = (index: number) => {
    setPagamentosConfirmados((prev) => prev.filter((_, i) => i !== index));
  };

  // ============================================================
  // LANÇAR RECEBIMENTO (acumula pagamentos)
  // ============================================================
  const handleLancarRecebimento = () => {
    if (!linhaPreenchida) {
      toast.error("Preencha valor, forma e plano de contas.");
      return;
    }

    const valorLinha = parseFloat(linhaAtual.valor);
    const novoTotal = totalJaConfirmado + valorLinha;

    if (novoTotal > totalComDesconto + 0.01) {
      toast.error("Valor ultrapassa o total a pagar.");
      return;
    }

    // Adiciona à lista de confirmados
    const novosPagamentos: PagamentoRealizado[] = [
      ...pagamentosConfirmados,
      {
        valor: valorLinha,
        formaPagamento: linhaAtual.formaPagamento as FormaPagamento,
        planoContasId: linhaAtual.planoContasId,
      },
    ];

    const totalNovo = novosPagamentos.reduce((s, p) => s + p.valor, 0);

    if (Math.abs(totalComDesconto - totalNovo) <= 0.01) {
      // VALOR COMPLETO → finaliza
      onConfirm({ pagamentos: novosPagamentos, totalComDesconto });
      limparEstado();
      onOpenChange(false);
      return;
    }

    // Ainda falta → acumula
    setPagamentosConfirmados(novosPagamentos);
    setLinhaAtual({
      id: crypto.randomUUID(),
      valor: (totalComDesconto - totalNovo).toFixed(2),
      formaPagamento: "",
      planoContasId: "",
    });
    toast.info(`Restante: ${currency(totalComDesconto - totalNovo)}`);
  };

  const limparEstado = () => {
    setPagamentosConfirmados([]);
    setLinhaAtual({
      id: crypto.randomUUID(),
      valor: "",
      formaPagamento: "",
      planoContasId: "",
    });
    setDesconto("0");
  };

  const currency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const faltaCompletar = Math.abs(restanteApos) > 0.01;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="px-5 py-3 border-b flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          <DialogTitle className="text-lg">Lançar Recebimento</DialogTitle>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Dados do paciente */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm bg-muted/30 rounded-lg p-3">
            <div>
              <span className="text-xs text-muted-foreground">Paciente</span>
              <p className="font-semibold">{appointment.patientName}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Profissional</span>
              <p className="font-semibold">{profissionalNome}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Data/Hora</span>
              <p className="font-semibold">
                {appointment.date ? format(new Date(appointment.date + "T" + (appointment.time || "00:00")), "dd/MM/yyyy HH:mm") : "—"}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Convênio</span>
              <p className="font-semibold">
                {appointment.paymentType === "plan" && appointment.planName ? appointment.planName : "Particular"}
              </p>
            </div>
          </div>

          {/* Tabela + Desconto */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Descrição</th>
                  <th className="text-center w-12 py-2 font-medium text-muted-foreground">Qtd</th>
                  <th className="text-right w-24 py-2 font-medium text-muted-foreground">Valor Unit.</th>
                  <th className="text-right px-4 w-24 py-2 font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 font-medium">{appointment.serviceName || "Serviço"}</td>
                  <td className="text-center py-2">1</td>
                  <td className="text-right py-2">{currency(valorTotal)}</td>
                  <td className="text-right px-4 py-2 font-medium">{currency(valorTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Desconto</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={desconto}
                onChange={(e) => setDesconto(e.target.value)}
                className="w-24 h-8 text-sm"
              />
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Subtotal: {currency(valorRestante)}</p>
              <p className="text-sm text-muted-foreground">Desconto: {currency(descontoValor)}</p>
              <p className="font-bold text-lg">Total: {currency(totalComDesconto)}</p>
            </div>
          </div>

          <Separator />

          {/* Pagamentos já confirmados */}
          {pagamentosConfirmados.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Recebimentos confirmados ({currency(totalJaConfirmado)})
              </h4>
              <div className="border rounded-lg divide-y max-h-28 overflow-y-auto">
                {pagamentosConfirmados.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currency(p.valor)}</span>
                      <span className="text-muted-foreground">• {formasPagamento.find(f => f.value === p.formaPagamento)?.label}</span>
                      <span className="text-muted-foreground">• {planosReceita.find(pl => pl.id === p.planoContasId)?.nome || "—"}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removerPagamento(idx)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linha de pagamento atual */}
          <div>
            <h4 className="text-sm font-semibold mb-1.5">
              {pagamentosConfirmados.length > 0
                ? `Novo recebimento (falta ${currency(restanteApos)})`
                : "Forma de pagamento"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <div>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={linhaAtual.valor}
                  onChange={(e) => setLinhaAtual((prev) => ({ ...prev, valor: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <Select value={linhaAtual.formaPagamento} onValueChange={(v) => setLinhaAtual((prev) => ({ ...prev, formaPagamento: v as FormaPagamento }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Forma de pagamento" /></SelectTrigger>
                  <SelectContent>
                    {formasPagamento.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Select value={linhaAtual.planoContasId} onValueChange={(v) => setLinhaAtual((prev) => ({ ...prev, planoContasId: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Plano de contas" /></SelectTrigger>
                  <SelectContent>
                    {planosReceita.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Resumo */}
          {totalJaConfirmado > 0 && (
            <div className="flex items-center justify-between text-sm border-t pt-3">
              <span className="text-muted-foreground">
                Total confirmado: <span className="font-semibold text-foreground">{currency(totalJaConfirmado)}</span>
              </span>
              {faltaCompletar && (
                <span className="text-amber-600 font-medium">
                  Restante: {currency(restanteApos)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={() => { limparEstado(); onOpenChange(false); }}>
            Cancelar
          </Button>
          <Button
            onClick={handleLancarRecebimento}
            disabled={!linhaPreenchida}
            size="sm"
            className="gap-1.5"
          >
            <CreditCard className="h-4 w-4" />
            {linhaPreenchida && Math.abs((parseFloat(linhaAtual.valor) || 0) - restanteApos) <= 0.01
              ? "Lançar Recebimento"
              : "Adicionar Pagamento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}