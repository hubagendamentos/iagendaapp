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
        return <Textarea value={value || ""} onChange={(e) => setFormData((p) => ({ ...p, [campo.id]: e.target.value }))} rows={4} />;
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
          <div className="flex flex-wrap gap-3">
            {(campo.opcoes || []).map((op) => (
              <label key={op} className="flex items-center gap-2 text-sm cursor-pointer">
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
          <div className="flex items-center gap-3">
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
      <DialogContent className="sm:max-w-xl lg:max-w-2xl !inset-0 !translate-x-0 !translate-y-0 !top-0 !left-0 sm:!inset-auto sm:!left-[50%] sm:!top-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] rounded-none sm:rounded-lg w-full sm:w-auto max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {selectedTemplate ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="truncate">{selectedTemplate.nome}</span>
              </div>
            ) : (
              "Nova Receita"
            )}
          </DialogTitle>
        </DialogHeader>

        {!selectedTemplate ? (
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">Selecione um modelo de receita:</p>
            {templates.length === 0 && (
              <p className="text-sm text-center py-8 text-muted-foreground">
                Nenhum modelo cadastrado.<br />Acesse Cadastros → Modelos Clínicos.
              </p>
            )}
            <div className="space-y-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className="w-full text-left p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <p className="font-medium text-sm">{tpl.nome}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tpl.campos.length} campos • {tpl.especialidade || "Geral"}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            <div className="space-y-4">
              {selectedTemplate.campos.map((campo) => (
                <div key={campo.id} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {campo.label}
                    {campo.obrigatorio && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {renderCampo(campo)}
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t sticky bottom-0 bg-background py-3">
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button disabled={!canSave} onClick={handleSave} size="default">
                Salvar Receita
              </Button>
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
      if (!val || val === "") val = "—";
      return `<tr>
        <td style="padding:8px 12px;font-weight:600;vertical-align:top;white-space:nowrap;color:#555;width:140px">${c.label}:</td>
        <td style="padding:8px 12px;white-space:pre-wrap;word-break:break-word">${val}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receita - ${pacienteNome}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      padding: 40px;
      color: #333;
      line-height: 1.6;
    }
    .header {
      border-bottom: 2px solid #0066cc;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    .header h1 {
      color: #0066cc;
      margin: 0 0 4px 0;
      font-size: 24px;
    }
    .header p {
      color: #666;
      margin: 2px 0;
      font-size: 14px;
    }
    .info-line {
      margin-bottom: 6px;
      font-size: 14px;
    }
    .info-line strong {
      color: #555;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    table tr {
      border-bottom: 1px solid #f0f0f0;
    }
    .footer {
      margin-top: 60px;
      border-top: 1px solid #ddd;
      padding-top: 12px;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
    .signature {
      margin-top: 40px;
      text-align: center;
      font-size: 14px;
      color: #555;
    }
    .signature .line {
      width: 250px;
      border-top: 1px solid #333;
      margin: 0 auto 8px auto;
    }
    @media print {
      body { padding: 20px; }
      .header h1 { color: #333; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Receita Médica</h1>
    <p>${template.nome}</p>
    <p>Data: ${dataStr}</p>
  </div>
  
  <p class="info-line"><strong>Paciente:</strong> ${pacienteNome}</p>
  <p class="info-line"><strong>Profissional:</strong> ${profissionalNome}</p>
  
  <table>${camposHtml}</table>
  
  <div class="signature">
    <div class="line"></div>
    <p>Assinatura e Carimbo</p>
    <p style="font-size:12px;color:#999;margin-top:4px">${profissionalNome}</p>
  </div>
  
  <div class="footer">
    <p>Documento gerado eletronicamente por Hub Agendamentos</p>    
  </div>
</body>
</html>`;
}