import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface Paciente {
  id?: string;
  nome: string;
  celular: string;
  nascimento: string;
  observacoes: string;
  ultimaConsulta?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Paciente) => void;
  paciente: Paciente | null;
}

const empty: Paciente = { nome: "", celular: "", nascimento: "", observacoes: "" };

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Paciente" : "Novo Paciente"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Nome completo" />
          </div>
          <div className="space-y-1.5">
            <Label>Celular</Label>
            <Input value={form.celular} onChange={(e) => set("celular", e.target.value)} placeholder="(00) 00000-0000" />
          </div>
          <div className="space-y-1.5">
            <Label>Data de Nascimento</Label>
            <Input type="date" value={form.nascimento} onChange={(e) => set("nascimento", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} placeholder="Alergias, condições..." rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
