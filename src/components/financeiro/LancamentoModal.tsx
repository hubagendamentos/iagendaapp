import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinancialAccounts } from "@/contexts/FinancialAccountsContext";
import { usePlanoContas } from "@/contexts/PlanoContasContext";
import { useCaixa } from "@/contexts/CaixaContext";
import { useUser } from "@/contexts/UserContext";
import { FORMA_PAGAMENTO_LABELS, type FormaPagamento } from "@/types/financeiro";
import { TipoBadge } from "./TipoBadge";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const LancamentoModal = ({ open, onClose }: Props) => {
  const { accounts } = useFinancialAccounts();
  const { planos } = usePlanoContas();
  const { addLancamento } = useCaixa();
  const { user } = useUser();

  const [planoId, setPlanoId] = useState("");
  const [contaId, setContaId] = useState("");
  const [valor, setValor] = useState("");
  const [forma, setForma] = useState<FormaPagamento>("dinheiro");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 16));
  const [competencia, setCompetencia] = useState(() => new Date().toISOString().slice(0, 10));
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    if (open) {
      setPlanoId("");
      setContaId(accounts.find((a) => a.ativo)?.id || "");
      setValor("");
      setForma("dinheiro");
      setData(new Date().toISOString().slice(0, 16));
      setCompetencia(new Date().toISOString().slice(0, 10));
      setDescricao("");
    }
  }, [open, accounts]);

  const planosDisponiveis = useMemo(
    () => planos.filter((p) => p.ativo && p.id !== "transferencia"),
    [planos]
  );
  const planoSel = planosDisponiveis.find((p) => p.id === planoId);
  const tipo = planoSel?.tipoFinanceiro;

  const canSave = !!planoId && !!contaId && !!valor && Number(valor.replace(",", ".")) > 0;

  const handleSave = () => {
    if (!canSave || !planoSel) return;
    const v = Number(valor.replace(",", "."));
    if (v <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }
    addLancamento({
      tipo: planoSel.tipoFinanceiro,
      origem: "manual",
      atendimentoId: "",
      paciente: "",
      profissional: "",
      profissionalId: "",
      valor: v,
      formaPagamento: forma,
      planoContas: planoSel.id,
      contaFinanceiraId: contaId,
      descricao,
      dataHora: new Date(data).toISOString(),
      competencia,
      usuarioId: user?.id,
      usuarioNome: user?.name || "Sistema",
    });
    toast.success("Lançamento criado");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Lançamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Plano de Contas</Label>
            <Select value={planoId} onValueChange={setPlanoId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1 text-[10px] uppercase text-muted-foreground">Entradas</div>
                {planosDisponiveis.filter((p) => p.tipoFinanceiro === "entrada").map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                ))}
                <div className="px-2 py-1 text-[10px] uppercase text-muted-foreground mt-1">Saídas</div>
                {planosDisponiveis.filter((p) => p.tipoFinanceiro === "saida").map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tipo && (
              <div className="pt-1">
                <TipoBadge tipo={tipo} />
                <span className="text-xs text-muted-foreground ml-2">
                  Tipo definido automaticamente pelo plano
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Conta Financeira</Label>
              <Select value={contaId} onValueChange={setContaId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {accounts.filter((a) => a.ativo).map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select value={forma} onValueChange={(v) => setForma(v as FormaPagamento)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(FORMA_PAGAMENTO_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" inputMode="decimal" />
            </div>
            <div className="space-y-2">
              <Label>Data/Hora</Label>
              <Input type="datetime-local" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Competência</Label>
              <Input type="date" value={competencia} onChange={(e) => setCompetencia(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Observações (opcional)" rows={2} />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button disabled={!canSave} onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};