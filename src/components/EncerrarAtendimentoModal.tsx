import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Appointment } from "@/components/AppointmentModal";
import type { FormaPagamento } from "@/contexts/CaixaContext";
import { Plus, Trash2 } from "lucide-react";
import { usePlanoContas } from "@/contexts/PlanoContasContext";

const formasPagamento: { value: FormaPagamento; label: string }[] = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao", label: "Cartão" },
  { value: "convenio", label: "Convênio" },
  { value: "outros", label: "Outros" },
];

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
  onConfirm: (data: { pagamentos: Array<{ valor: number; formaPagamento: FormaPagamento; planoContasId: string }> }) => void;
}

export function EncerrarAtendimentoModal({ open, onOpenChange, appointment, profissionalNome, onConfirm }: Props) {
  const { getPlanosReceita } = usePlanoContas();
  const planosReceita = getPlanosReceita();

  const valorTotal = appointment.price ?? 0;
  const valorJaPago = appointment.valor_pago ?? 0;
  const valorRestante = valorTotal - valorJaPago;

  const [linhas, setLinhas] = useState<PagamentoLinha[]>([
    { id: crypto.randomUUID(), valor: "", formaPagamento: "", planoContasId: "" },
  ]);

  const totalInserido = useMemo(
    () => linhas.reduce((s, l) => s + (parseFloat(l.valor) || 0), 0),
    [linhas]
  );

  const restanteApos = valorRestante - totalInserido;

  const canSubmit =
    linhas.length > 0 &&
    linhas.every((l) => l.formaPagamento !== "" && l.planoContasId !== "" && parseFloat(l.valor) > 0) &&
    totalInserido > 0 &&
    totalInserido <= valorRestante + 0.01;

  const handleConfirm = () => {
    if (!canSubmit) return;
    onConfirm({
      pagamentos: linhas.map((l) => ({
        valor: parseFloat(l.valor),
        formaPagamento: l.formaPagamento as FormaPagamento,
        planoContasId: l.planoContasId,
      })),
    });
  };

  const addLinha = () => {
    setLinhas((prev) => [...prev, { id: crypto.randomUUID(), valor: "", formaPagamento: "", planoContasId: "" }]);
  };

  const removeLinha = (id: string) => {
    setLinhas((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLinha = (id: string, field: keyof PagamentoLinha, value: string) => {
    setLinhas((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const currency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Encerramento Financeiro</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3 text-sm bg-muted/50 rounded-lg p-3">
            <div>
              <span className="text-muted-foreground">Paciente</span>
              <p className="font-medium">{appointment.patientName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Profissional</span>
              <p className="font-medium">{profissionalNome}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Valor total</span>
              <p className="font-medium">{currency(valorTotal)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Já pago</span>
              <p className="font-medium">{currency(valorJaPago)}</p>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Restante</span>
              <p className={`font-bold text-lg ${valorRestante <= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                {currency(Math.max(0, valorRestante))}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold">Pagamentos</Label>
            {linhas.map((linha) => (
              <div key={linha.id} className="flex gap-2 items-start border rounded-lg p-3">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Valor *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0,00"
                      value={linha.valor}
                      onChange={(e) => updateLinha(linha.id, "valor", e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Forma *</Label>
                    <Select value={linha.formaPagamento} onValueChange={(v) => updateLinha(linha.id, "formaPagamento", v)}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {formasPagamento.map((f) => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Plano *</Label>
                    <Select value={linha.planoContasId} onValueChange={(v) => updateLinha(linha.id, "planoContasId", v)}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {planosReceita.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {linhas.length > 1 && (
                  <Button variant="ghost" size="icon" className="mt-5 h-9 w-9 shrink-0 text-destructive" onClick={() => removeLinha(linha.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button variant="outline" size="sm" onClick={addLinha} className="w-full">
              <Plus className="w-4 h-4 mr-1" /> Adicionar pagamento
            </Button>
          </div>

          <div className="flex justify-between text-sm border-t pt-3">
            <div>
              <span className="text-muted-foreground">Total inserido: </span>
              <span className={`font-bold ${totalInserido > valorRestante ? "text-destructive" : ""}`}>{currency(totalInserido)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Restante após: </span>
              <span className="font-bold">{currency(Math.max(0, restanteApos))}</span>
            </div>
          </div>

          {totalInserido > valorRestante + 0.01 && (
            <p className="text-xs text-destructive">A soma dos pagamentos ultrapassa o valor restante.</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleConfirm} disabled={!canSubmit}>
              Confirmar lançamentos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
