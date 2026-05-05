import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { type TemplateClinico, type CampoTemplate, type CampoTipo } from "@/contexts/ReceitasContext";

const tiposCampo: { value: CampoTipo; label: string }[] = [
  { value: "text", label: "Texto curto" },
  { value: "textarea", label: "Texto longo" },
  { value: "number", label: "Número" },
  { value: "date", label: "Data" },
  { value: "select", label: "Seleção" },
  { value: "multi-select", label: "Múltipla escolha" },
  { value: "boolean", label: "Sim/Não" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (t: Omit<TemplateClinico, "id" | "createdAt"> & { id?: string }) => void;
  template: TemplateClinico | null;
}

export function ModeloClinicoModal({ open, onClose, onSave, template }: Props) {
  const [nome, setNome] = useState("");
  const [especialidade, setEspecialidade] = useState("geral");
  const [campos, setCampos] = useState<CampoTemplate[]>([]);

  useEffect(() => {
    if (open) {
      if (template) {
        setNome(template.nome);
        setEspecialidade(template.especialidade);
        setCampos([...template.campos]);
      } else {
        setNome("");
        setEspecialidade("geral");
        setCampos([]);
      }
    }
  }, [open, template]);

  const addCampo = () => {
    setCampos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), tipo: "text", label: "", obrigatorio: false },
    ]);
  };

  const updateCampo = (idx: number, updates: Partial<CampoTemplate>) => {
    setCampos((prev) => prev.map((c, i) => (i === idx ? { ...c, ...updates } : c)));
  };

  const removeCampo = (idx: number) => {
    setCampos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    onSave({
      id: template?.id,
      nome: nome.trim(),
      tipo: "receita",
      especialidade,
      campos,
      clinicId: "c1",
    });
    onClose();
  };

  const canSave = nome.trim() && campos.length > 0 && campos.every((c) => c.label.trim());

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl !inset-0 !translate-x-0 !translate-y-0 !top-0 !left-0 sm:!inset-auto sm:!left-[50%] sm:!top-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] rounded-none sm:rounded-lg w-full sm:w-auto max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? "Editar Modelo Clínico" : "Novo Modelo Clínico"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do modelo</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Receita Simples" />
            </div>
            <div className="space-y-2">
              <Label>Especialidade</Label>
              <Input value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} placeholder="Ex: geral, oftalmologia" />
            </div>
          </div>

          {/* Campos builder */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Campos do formulário</Label>
              <Button variant="outline" size="sm" onClick={addCampo} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Adicionar campo
              </Button>
            </div>

            {campos.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg bg-muted/30">
                Nenhum campo adicionado. Clique em "Adicionar campo" para começar.
              </p>
            )}

            <div className="space-y-3 max-h-[40vh] overflow-y-auto">
              {campos.map((campo, idx) => (
                <div key={campo.id} className="flex items-start gap-2 p-3 border rounded-lg bg-muted/20">
                  <GripVertical className="h-4 w-4 text-muted-foreground mt-2.5 shrink-0" />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      placeholder="Nome do campo"
                      value={campo.label}
                      onChange={(e) => updateCampo(idx, { label: e.target.value })}
                      className="text-sm"
                    />
                    <Select value={campo.tipo} onValueChange={(v) => updateCampo(idx, { tipo: v as CampoTipo })}>
                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {tiposCampo.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={campo.obrigatorio}
                        onCheckedChange={(v) => updateCampo(idx, { obrigatorio: v })}
                      />
                      <span className="text-xs text-muted-foreground">Obrigatório</span>
                    </div>
                    {(campo.tipo === "select" || campo.tipo === "multi-select") && (
                      <div className="sm:col-span-3">
                        <Input
                          placeholder="Opções separadas por vírgula"
                          value={campo.opcoes?.join(", ") || ""}
                          onChange={(e) =>
                            updateCampo(idx, {
                              opcoes: e.target.value.split(",").map((o) => o.trim()).filter(Boolean),
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => removeCampo(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button disabled={!canSave} onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}