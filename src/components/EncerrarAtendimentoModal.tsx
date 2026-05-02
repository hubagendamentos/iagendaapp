import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Appointment } from "@/components/AppointmentModal";
import type { FormaPagamento } from "@/contexts/CaixaContext";

const formasPagamento: { value: FormaPagamento; label: string }[] = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao", label: "Cartão" },
  { value: "convenio", label: "Convênio" },
  { value: "outros", label: "Outros" },
];

const planosContas = [
  "Consulta",
  "Procedimento",
  "Exame",
  "Retorno",
  "Outros",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment;
  profissionalNome: string;
  onConfirm: (data: { formaPagamento: FormaPagamento; planoContas: string; observacao: string }) => void;
}

export function EncerrarAtendimentoModal({ open, onOpenChange, appointment, profissionalNome, onConfirm }: Props) {
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | "">("");
  const [planoContas, setPlanoContas] = useState("");
  const [observacao, setObservacao] = useState("");

  const canSubmit = formaPagamento !== "" && planoContas !== "";

  const handleConfirm = () => {
    if (!canSubmit) return;
    onConfirm({ formaPagamento: formaPagamento as FormaPagamento, planoContas, observacao });
    setFormaPagamento("");
    setPlanoContas("");
    setObservacao("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Encerramento Financeiro</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Dados somente leitura */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Paciente</span>
              <p className="font-medium">{appointment.patientName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Profissional</span>
              <p className="font-medium">{profissionalNome}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Data</span>
              <p className="font-medium">{appointment.date}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Valor</span>
              <p className="font-medium">
                {(appointment.price ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
          </div>

          {/* Forma de pagamento */}
          <div className="space-y-2">
            <Label>Forma de pagamento *</Label>
            <Select value={formaPagamento} onValueChange={(v) => setFormaPagamento(v as FormaPagamento)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {formasPagamento.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Plano de contas */}
          <div className="space-y-2">
            <Label>Plano de contas *</Label>
            <Select value={planoContas} onValueChange={setPlanoContas}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {planosContas.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Observação */}
          <div className="space-y-2">
            <Label>Observação</Label>
            <Textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Observação opcional..."
              rows={3}
            />
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleConfirm} disabled={!canSubmit}>
              Confirmar e lançar no caixa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}