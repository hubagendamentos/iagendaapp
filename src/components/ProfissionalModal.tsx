import { useEffect, useState, useRef } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneMaskInput } from "@/components/PhoneMaskInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";

const specialties = [
  "Clínico Geral", "Cardiologia", "Dermatologia", "Ortopedia", "Pediatria",
  "Neurologia", "Ginecologia", "Oftalmologia", "Psiquiatria", "Endocrinologia",
];

export interface Profissional {
  id?: string;
  nome: string;
  crm: string;
  telefone: string;
  especialidade: string;
  foto?: string;
  ativo: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Profissional) => void;
  profissional: Profissional | null;
}

const empty: Profissional = { nome: "", crm: "", telefone: "", especialidade: "", ativo: true };

export function ProfissionalModal({ open, onClose, onSave, profissional }: Props) {
  const [form, setForm] = useState<Profissional>(empty);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!profissional?.id;

  useEffect(() => {
    if (profissional) {
      setForm(profissional);
      setPhotoPreview(profissional.foto || null);
    } else {
      setForm(empty);
      setPhotoPreview(null);
    }
  }, [profissional, open]);

  const set = (field: keyof Profissional, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setForm((prev) => ({ ...prev, foto: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!form.nome.trim() || !form.crm.trim()) return;
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[100dvh] sm:max-h-[90vh] overflow-hidden flex flex-col fixed inset-0 sm:inset-auto sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] rounded-none sm:rounded-lg w-full sm:w-auto">
        <DialogHeader className="shrink-0">
          <DialogTitle>{isEdit ? "Editar Profissional" : "Novo Profissional"}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2 -mx-6 px-6">
          {/* Photo upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="relative group cursor-pointer">
              <Avatar className="h-16 w-16">
                {photoPreview ? (
                  <AvatarImage src={photoPreview} alt="Foto" />
                ) : (
                  <AvatarFallback className="bg-accent text-accent-foreground text-lg">
                    {form.nome ? form.nome.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="h-5 w-5 text-white" />
              </div>
            </button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" /> Foto
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Nome completo" className="w-full" />
          </div>
          <div className="space-y-1.5">
            <Label>CRM</Label>
            <Input value={form.crm} onChange={(e) => set("crm", e.target.value)} placeholder="CRM/UF 000000" className="w-full" />
          </div>
          <div className="space-y-1.5">
            <Label>Telefone</Label>
            <PhoneMaskInput value={form.telefone} onChange={(v) => set("telefone", v)} />
          </div>
          <div className="space-y-1.5">
            <Label>Especialidade</Label>
            <Select value={form.especialidade} onValueChange={(v) => set("especialidade", v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {specialties.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
