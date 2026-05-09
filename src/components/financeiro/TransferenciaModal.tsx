import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinancialAccounts } from "@/contexts/FinancialAccountsContext";
import { useCaixa } from "@/contexts/CaixaContext";
import { useUser } from "@/contexts/UserContext";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const TransferenciaModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { accounts, getSaldoAtual } = useFinancialAccounts();
  const { addTransferencia } = useCaixa();
  const { user } = useUser();

  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 16));
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    if (open) {
      const ativas = accounts.filter((a) => a.ativo);
      setOrigem(ativas[0]?.id || "");
      setDestino(ativas[1]?.id || "");
      setValor("");
      setDescricao("");
    }
  }, [open, accounts]);

  const v = Number(valor.replace(",", "."));
  const canSave = origem && destino && origem !== destino && v > 0;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Transferência entre Contas</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-end gap-3">
            <div className="space-y-2">
              <Label>De</Label>
              <Select value={origem} onValueChange={setOrigem}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {accounts.filter((a) => a.ativo).map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.nome} (R$ {getSaldoAtual(a.id).toFixed(2)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground mb-2.5 hidden sm:block" />
            <div className="space-y-2">
              <Label>Para</Label>
              <Select value={destino} onValueChange={setDestino}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {accounts.filter((a) => a.ativo).map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
            </div>
            <div className="space-y-2">
              <Label>Data/Hora</Label>
              <Input type="datetime-local" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Opcional" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button
              disabled={!canSave}
              onClick={() => {
                addTransferencia({
                  contaOrigemId: origem,
                  contaDestinoId: destino,
                  valor: v,
                  dataHora: new Date(data).toISOString(),
                  descricao,
                  usuarioNome: user?.name || "Sistema",
                });
                toast.success("Transferência realizada");
                onClose();
              }}
            >
              Transferir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};