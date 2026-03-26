import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneMaskInput } from "@/components/PhoneMaskInput";

const ufs = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export interface Paciente {
  id?: string;
  nome: string;
  celular: string;
  nascimento: string;
  observacoes: string;
  ultimaConsulta?: string;
  cpf?: string;
  email?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  contatoAdicional?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Paciente) => void;
  paciente: Paciente | null;
}

const empty: Paciente = { nome: "", celular: "", nascimento: "", observacoes: "", cpf: "", email: "", endereco: "", numero: "", bairro: "", cidade: "", uf: "", contatoAdicional: "" };

export function PacienteModal({ open, onClose, onSave, paciente }: Props) {
  const [form, setForm] = useState<Paciente>(empty);
  const isEdit = !!paciente?.id;

  useEffect(() => {
    setForm(paciente ?? empty);
  }, [paciente, open]);

  const set = (field: keyof Paciente, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!form.nome.trim()) return;
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[100dvh] sm:max-h-[90vh] overflow-hidden flex flex-col !inset-0 !translate-x-0 !translate-y-0 !top-0 !left-0 sm:!inset-auto sm:!left-[50%] sm:!top-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] rounded-none sm:rounded-lg w-full sm:w-auto">
        <DialogHeader className="shrink-0">
          <DialogTitle>{isEdit ? "Editar Paciente" : "Novo Paciente"}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2 -mx-6 px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Nome completo" className="w-full" />
            </div>
            <div className="space-y-1.5">
              <Label>Celular</Label>
              <PhoneMaskInput value={form.celular} onChange={(v) => set("celular", v)} />
            </div>
            <div className="space-y-1.5">
              <Label>Data de Nascimento</Label>
              <Input type="date" value={form.nascimento} onChange={(e) => set("nascimento", e.target.value)} className="w-full" />
            </div>
            <div className="space-y-1.5">
              <Label>CPF</Label>
              <Input value={form.cpf || ""} onChange={(e) => set("cpf", e.target.value)} placeholder="000.000.000-00" className="w-full" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} placeholder="email@exemplo.com" className="w-full" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Endereço</Label>
              <Input value={form.endereco || ""} onChange={(e) => set("endereco", e.target.value)} placeholder="Rua, Avenida..." className="w-full" />
            </div>
            <div className="space-y-1.5">
              <Label>Número</Label>
              <Input value={form.numero || ""} onChange={(e) => set("numero", e.target.value)} placeholder="Nº" className="w-full" />
            </div>
            <div className="space-y-1.5">
              <Label>Bairro</Label>
              <Input value={form.bairro || ""} onChange={(e) => set("bairro", e.target.value)} placeholder="Bairro" className="w-full" />
            </div>
            <div className="space-y-1.5">
              <Label>Cidade</Label>
              <Input value={form.cidade || ""} onChange={(e) => set("cidade", e.target.value)} placeholder="Cidade" className="w-full" />
            </div>
            <div className="space-y-1.5">
              <Label>UF</Label>
              <Select value={form.uf || ""} onValueChange={(v) => set("uf", v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {ufs.map((uf) => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Contato Adicional</Label>
              <PhoneMaskInput value={form.contatoAdicional || ""} onChange={(v) => set("contatoAdicional", v)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} placeholder="Alergias, condições..." rows={3} className="w-full" />
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t pt-3">
          <Button variant="outline" onClick={onClose} className="h-10">Cancelar</Button>
          <Button onClick={handleSave} className="h-10">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
