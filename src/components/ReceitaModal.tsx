// ============================================================
// ReceitaModal.tsx (COMPLETO - 4 colunas, clean, com gerarHtmlReceita)
// ============================================================
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Pill, Stethoscope, Baby, FileText, ClipboardList, Shield } from "lucide-react";
import { useReceitas, type TemplateClinico, type CampoTemplate } from "@/contexts/ReceitasContext";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

interface PacienteData {
  nome: string;
  cpf?: string;
  nascimento?: string;
  idade?: number;
  peso?: number;
  celular?: string;
  email?: string;
  genero?: string;
  endereco?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  patientId: string;
  appointmentId: string;
  patientName: string;
  paciente?: PacienteData;
  onSaved: (receitaId: string, templateNome: string) => void;
  filterTipo?: "receita" | "atestado" | "solicitacao" | "declaracao";
}

export function ReceitaModal({ open, onClose, patientId, appointmentId, patientName, paciente, onSaved, filterTipo }: Props) {
  const { templates, addReceita } = useReceitas();
  const { user } = useUser();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateClinico | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const filteredTemplates = filterTipo
    ? templates.filter(t => t.tipo === filterTipo)
    : templates;

  const preencherCampoAutomatico = (campo: CampoTemplate, dadosPaciente?: PacienteData): string => {
    if (!dadosPaciente) return "";
    const label = campo.label.toLowerCase();

    if (
      label.includes("nome do paciente") ||
      label.includes("nome da criança") ||
      label.includes("nome do avaliado") ||
      label.includes("nome do acompanhante") ||
      (label.includes("nome") && !label.includes("medicamento") && !label.includes("modelo"))
    ) return dadosPaciente.nome || "";

    if (label.includes("cpf") || label.includes("documento") || label.includes("rg")) return dadosPaciente.cpf || "";
    if (label.includes("idade")) return dadosPaciente.idade?.toString() || "";
    if (label.includes("peso")) return dadosPaciente.peso?.toString() || "";
    if (label.includes("nascimento") || label.includes("data de nasc")) return dadosPaciente.nascimento || "";
    if (label.includes("telefone") || label.includes("celular") || label.includes("contato")) return dadosPaciente.celular || "";
    if (campo.tipo === "date" && label.includes("data")) return new Date().toISOString().split('T')[0];

    return "";
  };

  const handleSelectTemplate = (tpl: TemplateClinico) => {
    setSelectedTemplate(tpl);
    const initial: Record<string, any> = {};

    tpl.campos.forEach((c) => {
      const autoValue = preencherCampoAutomatico(c, paciente);
      if (autoValue) {
        initial[c.id] = autoValue;
      } else if (c.tipo === "boolean") {
        initial[c.id] = false;
      } else if (c.tipo === "multi-select") {
        initial[c.id] = [];
      } else {
        initial[c.id] = "";
      }
    });

    setFormData(initial);
  };

  const handleBack = () => { setSelectedTemplate(null); setFormData({}); };
  const handleClose = () => { setSelectedTemplate(null); setFormData({}); onClose(); };

  const handleSave = () => {
    if (!selectedTemplate) return;
    const html = gerarHtmlReceita(selectedTemplate, formData, patientName, user?.name || "");
    const receita = addReceita({
      patientId, appointmentId,
      templateId: selectedTemplate.id,
      templateNome: selectedTemplate.nome,
      profissionalId: user?.professionalId || "",
      clinicId: user?.clinicId || "c1",
      data: formData, html,
    });
    toast.success("Documento salvo!");
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
              {(campo.opcoes || []).map((op) => (<SelectItem key={op} value={op}>{op}</SelectItem>))}
            </SelectContent>
          </Select>
        );
      case "multi-select":
        return (
          <div className="flex flex-wrap gap-3">
            {(campo.opcoes || []).map((op) => (
              <label key={op} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={(value || []).includes(op)} onCheckedChange={(checked) => {
                  setFormData((p) => {
                    const arr = [...(p[campo.id] || [])];
                    if (checked) arr.push(op);
                    else { const idx = arr.indexOf(op); if (idx >= 0) arr.splice(idx, 1); }
                    return { ...p, [campo.id]: arr };
                  });
                }} />
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

  const tipoLabel: Record<string, string> = {
    receita: "Receita",
    atestado: "Atestado",
    solicitacao: "Solicitação de Exame",
    declaracao: "Declaração",
  };

  const getIcone = (especialidade: string) => {
    if (especialidade === "pediatria") return Baby;
    if (especialidade === "oftalmologia") return Stethoscope;
    if (especialidade === "odontologia") return Stethoscope;
    if (especialidade === "geral") return Pill;
    return FileText;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl !inset-0 !translate-x-0 !translate-y-0 !top-0 !left-0 sm:!inset-auto sm:!left-[50%] sm:!top-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] rounded-none sm:rounded-lg w-full sm:w-auto max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
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
              filterTipo ? `Nova ${tipoLabel[filterTipo]}` : "Novo Documento"
            )}
          </DialogTitle>
        </DialogHeader>

        {!selectedTemplate ? (
          <div className="space-y-4 pt-2">
            {filteredTemplates.length === 0 && (
              <p className="text-sm text-center py-8 text-muted-foreground">
                Nenhum modelo encontrado.
              </p>
            )}

            {/* GRID DE 4 COLUNAS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredTemplates.map((tpl) => {
                const Icone = getIcone(tpl.especialidade);
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className="text-left p-4 border rounded-lg hover:bg-muted/50 transition-colors group h-full"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icone className="h-5 w-5 text-primary" />
                      </div>
                      {tpl.isDefault && (
                        <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded shrink-0">
                          Padrão
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                      {tpl.nome}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {tpl.especialidade !== "geral" ? tpl.especialidade + " • " : ""}
                      {tpl.printConfig.paperSize}
                    </p>
                  </button>
                );
              })}
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
                Salvar {selectedTemplate.tipo === "receita" ? "Receita" : "Documento"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// FUNÇÃO gerarHtmlReceita
// ============================================================
function gerarHtmlReceita(
  template: TemplateClinico,
  data: Record<string, any>,
  pacienteNome: string,
  profissionalNome: string
): string {
  const cfg = template.printConfig;
  const now = new Date();
  const dataStr = now.toLocaleDateString("pt-BR");

  let pageSizeValue: string;
  if (cfg.paperSize === "custom") {
    pageSizeValue = `${cfg.customWidth || 210}mm ${cfg.customHeight || 297}mm`;
  } else {
    const sizes: Record<string, string> = {
      "A4": "210mm 297mm",
      "A5": "148mm 210mm",
      "letter": "215.9mm 279.4mm",
    };
    pageSizeValue = sizes[cfg.paperSize] || "148mm 210mm";
  }

  const pageCss = `
    @page { 
      size: ${pageSizeValue} ${cfg.orientation}; 
      margin: ${cfg.marginTop}mm ${cfg.marginRight}mm ${cfg.marginBottom}mm ${cfg.marginLeft}mm; 
    }
  `;

  const bodyCss = `
    font-size: ${cfg.fontSize}px;
    line-height: ${cfg.lineSpacing};
  `;

  const headerHtml = cfg.showHeader ? `
    <div class="print-header">
      ${cfg.headerLogo ? `<img src="${cfg.headerLogo}" class="header-logo" alt="Logo" />` : ''}
      <h1>${cfg.headerText || ''}</h1>
    </div>
  ` : '';

  const footerHtml = cfg.showFooter ? `
    <div class="print-footer">
      <p>${cfg.footerText || ''}</p>
      <p>Gerado em ${dataStr} às ${now.toLocaleTimeString("pt-BR")}</p>
    </div>
  ` : '';

  const camposHtml = template.campos
    .map((c) => {
      let val = data[c.id];
      if (Array.isArray(val)) val = val.join(", ");
      if (typeof val === "boolean") val = val ? "Sim" : "Não";
      if (!val || val === "") val = "—";
      return `
        <div class="field-row">
          <div class="field-label">${c.label}:</div>
          <div class="field-value">${String(val).replace(/\n/g, '<br>')}</div>
        </div>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${template.tipo === "receita" ? "Receita" : "Documento"} - ${pacienteNome}</title>
  <style>
    ${pageCss}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      ${bodyCss}
      color: #333;
      padding: 0;
    }
    .print-header {
      text-align: center;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid #ddd;
    }
    .print-header h1 {
      font-size: ${cfg.fontSize + 6}px;
      margin: 0;
      color: #222;
    }
    .print-header .header-logo {
      max-height: 50px;
      margin-bottom: 6px;
    }
    .info-section {
      margin-bottom: 16px;
    }
    .info-line {
      margin-bottom: 4px;
      font-size: ${cfg.fontSize}px;
    }
    .info-line strong {
      color: #555;
    }
    .fields-section {
      margin-top: 12px;
    }
    .field-row {
      display: flex;
      gap: 8px;
      padding: 6px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: ${cfg.fontSize}px;
      line-height: ${cfg.lineSpacing};
    }
    .field-label {
      font-weight: 600;
      color: #555;
      min-width: 130px;
      white-space: nowrap;
    }
    .field-value {
      flex: 1;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .signature-section {
      margin-top: 50px;
      text-align: center;
      font-size: ${cfg.fontSize}px;
    }
    .signature-line {
      width: 250px;
      border-top: 1px solid #333;
      margin: 0 auto 8px auto;
    }
    .signature-name {
      margin-top: 4px;
      font-size: ${cfg.fontSize - 2}px;
      color: #999;
    }
    .print-footer {
      margin-top: 30px;
      text-align: center;
      font-size: ${cfg.fontSize - 3}px;
      color: #bbb;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  ${headerHtml}

  <div class="info-section">
    <p class="info-line"><strong>Paciente:</strong> ${pacienteNome}</p>
    <p class="info-line"><strong>Profissional:</strong> ${profissionalNome}</p>
    <p class="info-line"><strong>Data:</strong> ${dataStr}</p>
  </div>

  <div class="fields-section">
    ${camposHtml}
  </div>

  <div class="signature-section">
    <div class="signature-line"></div>
    <p>Assinatura e Carimbo</p>
    <p class="signature-name">${profissionalNome}</p>
  </div>

  ${footerHtml}
</body>
</html>`;
}