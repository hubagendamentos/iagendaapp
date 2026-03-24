import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface Profissional {
  id?: string;
  nome: string;
  especialidade: string;
  ativo: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Profissional) => void;
  profissional: Profissional | null;
}

const empty: Profissional = { nome: "", especialidade: "", ativo: true };

export function ProfissionalModal({ open, onClose, onSave, profissional }: Props) {
  const [form, setForm] = useState<Profissional>(empty);
  const isEdit = !!profissional?.id;

  useEffect(() => {
    setForm(profissional ?? empty);
  }, [profissional, open]);

  const set = (field: keyof Profissional, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!form.nome.trim()) return;
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Profissional" : "Novo Profissional"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Nome completo" />
          </div>
          <div className="space-y-1.5">
            <Label>Especialidade</Label>
            <Input value={form.especialidade} onChange={(e) => set("especialidade", e.target.value)} placeholder="Ex: Dermatologia" />
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
