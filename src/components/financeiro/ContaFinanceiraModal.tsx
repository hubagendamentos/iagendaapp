import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TIPO_CONTA_LABELS, type TipoConta } from "@/types/financeiro";
import type { FinancialAccount } from "@/contexts/FinancialAccountsContext";

interface Props {
  open: boolean;
  onClose: () => void;
  conta: FinancialAccount | null;
  onSave: (data: Omit<FinancialAccount, "id"> & { id?: string }) => void;
}

export const ContaFinanceiraModal = ({ open, onClose, conta, onSave }: Props) => {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoConta>("caixa");
  const [cor, setCor] = useState("#3b82f6");
  const [saldoInicial, setSaldoInicial] = useState("0");
  const [ativo, setAtivo] = useState(true);
  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    if (open) {
      setNome(conta?.nome || "");
      setTipo(conta?.tipo || "caixa");
      setCor(conta?.cor || "#3b82f6");
      setSaldoInicial(String(conta?.saldoInicial ?? 0));
      setAtivo(conta?.ativo ?? true);
      setObservacao(conta?.observacao || "");
    }
  }, [open, conta]);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{conta ? "Editar Conta" : "Nova Conta Financeira"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Caixa Recepção" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoConta)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_CONTA_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <Input type="color" value={cor} onChange={(e) => setCor(e.target.value)} className="h-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Saldo Inicial (R$)</Label>
            <Input value={saldoInicial} onChange={(e) => setSaldoInicial(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Observação</Label>
            <Input value={observacao} onChange={(e) => setObservacao(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={ativo} onCheckedChange={setAtivo} />
            <Label>{ativo ? "Ativo" : "Inativo"}</Label>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button
              disabled={!nome.trim()}
              onClick={() => {
                onSave({
                  id: conta?.id,
                  nome: nome.trim(),
                  tipo,
                  cor,
                  saldoInicial: Number(saldoInicial.replace(",", ".")) || 0,
                  ativo,
                  observacao,
                });
                onClose();
              }}
            >
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};