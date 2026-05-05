import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { useReceitas, type TemplateClinico, type CampoTemplate } from "@/contexts/ReceitasContext";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  patientId: string;
  appointmentId: string;
  patientName: string;
  onSaved: (receitaId: string, templateNome: string) => void;
}

export function ReceitaModal({ open, onClose, patientId, appointmentId, patientName, onSaved }: Props) {
  const { templates, addReceita } = useReceitas();
  const { user } = useUser();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateClinico | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSelectTemplate = (tpl: TemplateClinico) => {
    setSelectedTemplate(tpl);
    const initial: Record<string, any> = {};
    tpl.campos.forEach((c) => {
      if (c.tipo === "boolean") initial[c.id] = false;
      else if (c.tipo === "multi-select") initial[c.id] = [];
      else initial[c.id] = "";
    });
    setFormData(initial);
  };

  const handleBack = () => {
    setSelectedTemplate(null);
    setFormData({});
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setFormData({});
    onClose();
  };

  const handleSave = () => {
    if (!selectedTemplate) return;

    const html = gerarHtmlReceita(selectedTemplate, formData, patientName, user?.name || "");

    const receita = addReceita({
      patientId,
      appointmentId,
      templateId: selectedTemplate.id,
      templateNome: selectedTemplate.nome,
      profissionalId: user?.professionalId || "",
      clinicId: user?.clinicId || "c1",
      data: formData,
      html,
    });

    toast.success("Receita salva com sucesso!");
    onSaved(receita.id, selectedTemplate.nome);
    handleClose();
  };

  const canSave = selectedTemplate?.campos.every((c) => {
    if (!c.obrigatorio) return true;
    const val = formData[c.id];
    if (c.tipo === "multi-select") return Array.isArray(val) && val.length > 0;
    if (c.tipo === "boolean") return true;
    return val !== "" && val !== undefined && val !== null;
  });

  const renderCampo = (campo: CampoTemplate) => {
    const value = formData[campo.id];
    switch (campo.tipo) {
      case "text":
        return <Input value={value || ""} onChange={(e) => setFormData((p) => ({ ...p, [campo.id]: e.target.value }))} />;
      case "textarea":
        return <Textarea value={value || ""} onChange={(e) => setFormData((p) => ({ ...p, [campo.id]: e.target.value }))} rows={3} />;
      case "number":
        return <Input type="number" value={value || ""} onChange={(e) => setFormData((p) => ({ ...p, [campo.id]: e.target.value }))} />;
      case "date":
        return <Input type="date" value={value || ""} onChange={(e) => setFormData((p) => ({ ...p, [campo.id]: e.target.value }))} />;
      case "select":
        return (
          <Select value={value || ""} onValueChange={(v) => setFormData((p) => ({ ...p, [campo.id]: v }))}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {(campo.opcoes || []).map((op) => (
                <SelectItem key={op} value={op}>{op}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "multi-select":
        return (
          <div className="flex flex-wrap gap-2">
            {(campo.opcoes || []).map((op) => (
              <label key={op} className="flex items-center gap-1.5 text-sm">
                <Checkbox
                  checked={(value || []).includes(op)}
                  onCheckedChange={(checked) => {
                    setFormData((p) => {
                      const arr = [...(p[campo.id] || [])];
                      if (checked) arr.push(op);
                      else {
                        const idx = arr.indexOf(op);
                        if (idx >= 0) arr.splice(idx, 1);
                      }
                      return { ...p, [campo.id]: arr };
                    });
                  }}
                />
                {op}
              </label>
            ))}
          </div>
        );
      case "boolean":
        return (
          <div className="flex items-center gap-2">
            <Switch checked={!!value} onCheckedChange={(v) => setFormData((p) => ({ ...p, [campo.id]: v }))} />
            <span className="text-sm">{value ? "Sim" : "Não"}</span>
          </div>
        );
      default:
        return <Input value={value || ""} onChange={(e) => setFormData((p) => ({ ...p, [campo.id]: e.target.value }))} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl !inset-0 !translate-x-0 !translate-y-0 !top-0 !left-0 sm:!inset-auto sm:!left-[50%] sm:!top-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] rounded-none sm:rounded-lg w-full sm:w-auto max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedTemplate ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                {selectedTemplate.nome}
              </div>
            ) : (
              "Nova Receita"
            )}
          </DialogTitle>
        </DialogHeader>

        {!selectedTemplate ? (
          <div className="space-y-2 pt-2">
            <p className="text-sm text-muted-foreground">Selecione um modelo de receita:</p>
            {templates.length === 0 && (
              <p className="text-sm text-center py-6 text-muted-foreground">Nenhum modelo cadastrado. Acesse Cadastros → Modelos Clínicos.</p>
            )}
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className="w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <p className="font-medium text-sm">{tpl.nome}</p>
                <p className="text-xs text-muted-foreground">{tpl.campos.length} campos • {tpl.especialidade}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {selectedTemplate.campos.map((campo) => (
              <div key={campo.id} className="space-y-1.5">
                <Label className="text-sm">
                  {campo.label}
                  {campo.obrigatorio && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderCampo(campo)}
              </div>
            ))}
            <div className="flex gap-2 justify-end pt-2 border-t">
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button disabled={!canSave} onClick={handleSave}>Salvar Receita</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function gerarHtmlReceita(
  template: TemplateClinico,
  data: Record<string, any>,
  pacienteNome: string,
  profissionalNome: string
): string {
  const now = new Date();
  const dataStr = now.toLocaleDateString("pt-BR");
  const camposHtml = template.campos
    .map((c) => {
      let val = data[c.id];
      if (Array.isArray(val)) val = val.join(", ");
      if (typeof val === "boolean") val = val ? "Sim" : "Não";
      return `<tr><td style="padding:6px 12px;font-weight:600;vertical-align:top;white-space:nowrap">${c.label}:</td><td style="padding:6px 12px">${val || "—"}</td></tr>`;
    })
    .join("");

  return `<!DOCTYPE html><html><head><title>Receita</title>
<style>body{font-family:Arial,sans-serif;padding:40px;color:#333;line-height:1.5}
.header{border-bottom:2px solid #0066cc;padding-bottom:10px;margin-bottom:20px}
.header h1{color:#0066cc;margin:0;font-size:22px}
.header p{color:#666;margin:4px 0;font-size:13px}
table{width:100%;border-collapse:collapse}
.footer{margin-top:60px;border-top:1px solid #ddd;padding-top:10px;font-size:11px;color:#999;text-align:center}
@media print{body{padding:20px}.header h1{color:#333}}</style></head>
<body>
<div class="header"><h1>Receita Médica</h1><p>${template.nome}</p><p>Data: ${dataStr}</p></div>
<p><strong>Paciente:</strong> ${pacienteNome}</p>
<p><strong>Profissional:</strong> ${profissionalNome}</p>
<hr style="margin:16px 0;border:none;border-top:1px solid #eee"/>
<table>${camposHtml}</table>
<div class="footer"><p>Documento gerado eletronicamente</p></div>
</body></html>`;
}