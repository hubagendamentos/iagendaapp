import { useState, useEffect, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, X } from "lucide-react";
import {
  type TemplateClinico,
  type CampoTemplate,
  type CampoTipo,
  type PrintConfig,
  defaultPrintConfig,
} from "@/contexts/ReceitasContext";
import { gerarHtmlReceita } from "@/components/ReceitaModal";

const tiposCampo: { value: CampoTipo; label: string }[] = [
  { value: "text", label: "Texto curto" },
  { value: "textarea", label: "Texto longo" },
  { value: "number", label: "Número" },
  { value: "date", label: "Data" },
  { value: "select", label: "Seleção" },
  { value: "multi-select", label: "Múltipla escolha" },
  { value: "boolean", label: "Sim/Não" },
];

const paperSizes: { value: string; label: string; w: number; h: number }[] = [
  { value: "A4", label: "A4 (210×297mm)", w: 210, h: 297 },
  { value: "A5", label: "A5 (148×210mm)", w: 148, h: 210 },
  { value: "letter", label: "Carta (216×279mm)", w: 216, h: 279 },
  { value: "custom", label: "Personalizado", w: 210, h: 297 },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (t: Omit<TemplateClinico, "id" | "createdAt"> & { id?: string }) => void;
  template: TemplateClinico | null;
}

export function TemplateEditorModal({ open, onClose, onSave, template }: Props) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TemplateClinico["tipo"]>("receita");
  const [especialidade, setEspecialidade] = useState("geral");
  const [campos, setCampos] = useState<CampoTemplate[]>([]);
  const [printConfig, setPrintConfig] = useState<PrintConfig>({ ...defaultPrintConfig });
  const [editorTab, setEditorTab] = useState("campos");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (open) {
      if (template) {
        setNome(template.nome);
        setTipo(template.tipo);
        setEspecialidade(template.especialidade);
        setCampos([...template.campos]);
        setPrintConfig({ ...template.printConfig });
      } else {
        setNome("");
        setTipo("receita");
        setEspecialidade("geral");
        setCampos([]);
        setPrintConfig({ ...defaultPrintConfig });
      }
      setEditorTab("campos");
    }
  }, [open, template]);

  // Sample data for preview
  const sampleData = useMemo(() => {
    const data: Record<string, any> = {};
    campos.forEach((c) => {
      if (c.tipo === "boolean") data[c.id] = true;
      else if (c.tipo === "multi-select") data[c.id] = c.opcoes?.slice(0, 2) || [];
      else if (c.tipo === "select") data[c.id] = c.opcoes?.[0] || "Exemplo";
      else if (c.tipo === "number") data[c.id] = "10";
      else if (c.tipo === "date") data[c.id] = new Date().toISOString().split("T")[0];
      else if (c.tipo === "textarea") data[c.id] = `Exemplo de ${c.label || "campo"}`;
      else data[c.id] = c.label || "Exemplo";
    });
    return data;
  }, [campos]);

  // Build preview HTML
  const previewHtml = useMemo(() => {
    const fakeTemplate: TemplateClinico = {
      id: "preview",
      nome: nome || "Modelo",
      tipo,
      especialidade,
      campos,
      clinicId: "c1",
      createdAt: new Date(),
      printConfig,
    };
    return gerarHtmlReceita(fakeTemplate, sampleData, "Lucas Barbosa", "Dr. João Silva");
  }, [nome, tipo, especialidade, campos, printConfig, sampleData]);

  // Paper dimensions for scaled preview
  const paperDims = useMemo(() => {
    const ps = paperSizes.find((p) => p.value === printConfig.paperSize);
    let w = ps?.w || 148;
    let h = ps?.h || 210;
    if (printConfig.paperSize === "custom") {
      w = printConfig.customWidth || 210;
      h = printConfig.customHeight || 297;
    }
    if (printConfig.orientation === "landscape") [w, h] = [h, w];
    return { w, h };
  }, [printConfig]);

  const addCampo = () => {
    setCampos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), tipo: "text", label: "", obrigatorio: false },
    ]);
  };

  const updateCampo = (idx: number, updates: Partial<CampoTemplate>) => {
    setCampos((prev) => prev.map((c, i) => (i === idx ? { ...c, ...updates } : c)));
  };

  const removeCampo = (idx: number) => setCampos((prev) => prev.filter((_, i) => i !== idx));

  const moveCampo = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= campos.length) return;
    setCampos((prev) => {
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  const updatePrint = (updates: Partial<PrintConfig>) => {
    setPrintConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    onSave({
      id: template?.id,
      nome: nome.trim(),
      tipo,
      especialidade,
      campos,
      clinicId: "c1",
      printConfig,
      isDefault: template?.isDefault,
    });
    onClose();
  };

  const canSave = nome.trim() && campos.length > 0 && campos.every((c) => c.label.trim());

  return (
    <>
      <Dialog open={open} onOpenChange={() => onClose()}>
        <DialogContent className="!inset-0 !translate-x-0 !translate-y-0 !top-0 !left-0 sm:!inset-auto sm:!left-[50%] sm:!top-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] rounded-none sm:rounded-lg w-full sm:w-auto sm:max-w-[700px] max-h-[100dvh] sm:max-h-[92vh] overflow-hidden p-0">
          <div className="flex flex-col h-[100dvh] sm:h-[92vh]">
            {/* Header */}
            <div className="px-5 py-4 border-b shrink-0">
              <DialogHeader>
                <DialogTitle>{template ? "Editar Modelo Clínico" : "Novo Modelo Clínico"}</DialogTitle>
              </DialogHeader>
            </div>

            {/* Body: single column */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5 sm:col-span-1">
                  <Label className="text-xs font-medium">Nome</Label>
                  <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Receita Simples" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Tipo</Label>
                  <Select value={tipo} onValueChange={(v) => setTipo(v as TemplateClinico["tipo"])}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="atestado">Atestado</SelectItem>
                      <SelectItem value="solicitacao">Solicitação</SelectItem>
                      <SelectItem value="declaracao">Declaração</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Especialidade</Label>
                  <Input value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} placeholder="geral" className="h-9 text-sm" />
                </div>
              </div>

              {/* Tabs: Campos / Impressão */}
              <Tabs value={editorTab} onValueChange={setEditorTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="campos">Campos</TabsTrigger>
                  <TabsTrigger value="impressao">Impressão</TabsTrigger>
                </TabsList>

                {/* -- CAMPOS TAB -- */}
                <TabsContent value="campos" className="mt-3 space-y-3">
                  {campos.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6 border rounded-lg bg-muted/30">
                      Nenhum campo adicionado.
                    </p>
                  )}

                  {campos.map((campo, idx) => (
                    <div key={campo.id} className="flex items-start gap-2 p-3 border rounded-lg bg-muted/20">
                      <div className="flex flex-col gap-0.5 shrink-0 mt-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0} onClick={() => moveCampo(idx, -1)}>
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === campos.length - 1} onClick={() => moveCampo(idx, 1)}>
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Input
                          placeholder="Nome do campo"
                          value={campo.label}
                          onChange={(e) => updateCampo(idx, { label: e.target.value })}
                          className="text-sm h-9"
                        />
                        <Select value={campo.tipo} onValueChange={(v) => updateCampo(idx, { tipo: v as CampoTipo })}>
                          <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {tiposCampo.map((t) => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={campo.obrigatorio}
                            onCheckedChange={(v) => updateCampo(idx, { obrigatorio: !!v })}
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
                              className="text-sm h-9"
                            />
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => removeCampo(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button variant="outline" size="sm" onClick={addCampo} className="gap-1.5 w-full">
                    <Plus className="h-3.5 w-3.5" /> Adicionar campo
                  </Button>
                </TabsContent>

                {/* -- IMPRESSÃO TAB -- */}
                <TabsContent value="impressao" className="mt-3 space-y-4">
                  {/* Paper size */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Tamanho</Label>
                      <Select value={printConfig.paperSize} onValueChange={(v) => updatePrint({ paperSize: v as PrintConfig["paperSize"] })}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {paperSizes.map((ps) => (
                            <SelectItem key={ps.value} value={ps.value}>{ps.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Orientação</Label>
                      <Select value={printConfig.orientation} onValueChange={(v) => updatePrint({ orientation: v as "portrait" | "landscape" })}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portrait">Retrato</SelectItem>
                          <SelectItem value="landscape">Paisagem</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Custom dims */}
                  {printConfig.paperSize === "custom" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Largura (mm)</Label>
                        <Input type="number" value={printConfig.customWidth || ""} onChange={(e) => updatePrint({ customWidth: Number(e.target.value) })} className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Altura (mm)</Label>
                        <Input type="number" value={printConfig.customHeight || ""} onChange={(e) => updatePrint({ customHeight: Number(e.target.value) })} className="h-9 text-sm" />
                      </div>
                    </div>
                  )}

                  {/* Margins */}
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Margens (mm)</Label>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">Topo</span>
                        <Input type="number" value={printConfig.marginTop} onChange={(e) => updatePrint({ marginTop: Number(e.target.value) })} className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">Direita</span>
                        <Input type="number" value={printConfig.marginRight} onChange={(e) => updatePrint({ marginRight: Number(e.target.value) })} className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">Baixo</span>
                        <Input type="number" value={printConfig.marginBottom} onChange={(e) => updatePrint({ marginBottom: Number(e.target.value) })} className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">Esquerda</span>
                        <Input type="number" value={printConfig.marginLeft} onChange={(e) => updatePrint({ marginLeft: Number(e.target.value) })} className="h-8 text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Switch checked={printConfig.showHeader} onCheckedChange={(v) => updatePrint({ showHeader: v })} />
                      <Label className="text-xs">Exibir Cabeçalho</Label>
                    </div>
                    {printConfig.showHeader && (
                      <Input value={printConfig.headerText || ""} onChange={(e) => updatePrint({ headerText: e.target.value })} placeholder="Texto do cabeçalho" className="h-9 text-sm" />
                    )}
                  </div>

                  {/* Footer */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Switch checked={printConfig.showFooter} onCheckedChange={(v) => updatePrint({ showFooter: v })} />
                      <Label className="text-xs">Exibir Rodapé</Label>
                    </div>
                    {printConfig.showFooter && (
                      <Input value={printConfig.footerText || ""} onChange={(e) => updatePrint({ footerText: e.target.value })} placeholder="Texto do rodapé" className="h-9 text-sm" />
                    )}
                  </div>

                  {/* Font & spacing */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Fonte</Label>
                      <Select value={String(printConfig.fontSize)} onValueChange={(v) => updatePrint({ fontSize: Number(v) })}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10px</SelectItem>
                          <SelectItem value="12">12px</SelectItem>
                          <SelectItem value="14">14px</SelectItem>
                          <SelectItem value="16">16px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Espaçamento</Label>
                      <Select value={String(printConfig.lineSpacing)} onValueChange={(v) => updatePrint({ lineSpacing: Number(v) })}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1.0</SelectItem>
                          <SelectItem value="1.25">1.25</SelectItem>
                          <SelectItem value="1.5">1.5</SelectItem>
                          <SelectItem value="2">2.0</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t flex gap-2 justify-between shrink-0">
              <Button variant="outline" onClick={() => setShowPreview(true)} className="gap-1.5">
                <Eye className="h-4 w-4" /> Visualizar Impressão
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>Cancelar</Button>
                <Button disabled={!canSave} onClick={handleSave}>Salvar</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Preview Modal */}
      <Dialog open={showPreview} onOpenChange={() => setShowPreview(false)}>
        <DialogContent className="!inset-0 !translate-x-0 !translate-y-0 !top-0 !left-0 rounded-none w-full h-[100dvh] max-w-none p-0">
          <div className="flex flex-col h-full">
            <div className="px-5 py-3 border-b flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>Preview — {printConfig.paperSize.toUpperCase()} • {printConfig.orientation === "portrait" ? "Retrato" : "Paisagem"} • {paperDims.w}×{paperDims.h}mm</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto bg-muted/40 flex justify-center p-6">
              <div
                className="bg-white shadow-lg border rounded"
                style={{ width: paperDims.w * 3.78, minHeight: paperDims.h * 3.78 }}
              >
                <iframe
                  srcDoc={previewHtml}
                  className="border-0 w-full h-full"
                  title="Preview do modelo"
                  style={{ minHeight: paperDims.h * 3.78 }}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}