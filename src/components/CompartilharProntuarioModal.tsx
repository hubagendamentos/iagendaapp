import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Printer, Download } from "lucide-react";

export type PrintPreferences = {
  // Dados do paciente
  patientData: boolean;
  patientAddress: boolean;
  patientInsurance: boolean;
  
  // Timeline
  timelineScope: "all" | "last" | "today" | "manual";
  
  // Tipos de Conteudo
  includeNotes: boolean;
  includePrescriptions: boolean;
  includeAttachments: boolean;
  includeStatus: boolean;
  
  // Cabeçalho
  includeHeader: boolean;
  
  // Saida
  format: "pdf" | "image" | "text";
  destination: "share" | "print" | "download";
};

const defaultPreferences: PrintPreferences = {
  patientData: true,
  patientAddress: false,
  patientInsurance: false,
  timelineScope: "all",
  includeNotes: true,
  includePrescriptions: true,
  includeAttachments: true,
  includeStatus: false,
  includeHeader: false,
  format: "pdf",
  destination: "share",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  mode: "share" | "print";
  onGenerate: (prefs: PrintPreferences) => void;
  onManualSelectionRequest: (prefs: PrintPreferences) => void;
}

export function CompartilharProntuarioModal({ open, onOpenChange, userId, mode, onGenerate, onManualSelectionRequest }: Props) {
  const [prefs, setPrefs] = useState<PrintPreferences>(defaultPreferences);

  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem(`print_preferences_${userId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Ocultar modo manual se a última vez foi imagem
          if (parsed.format === "image" && parsed.timelineScope === "manual") {
            parsed.timelineScope = "all";
          }
          setPrefs({ ...defaultPreferences, ...parsed });
        } catch (e) {
          // fallback to defaults
        }
      }
    }
  }, [open, userId]);

  const saveAndProceed = () => {
    let finalPrefs = { ...prefs };
    if (mode === "print") {
      finalPrefs.format = "pdf";
      finalPrefs.destination = "print";
    }
    
    localStorage.setItem(`print_preferences_${userId}`, JSON.stringify(finalPrefs));
    if (finalPrefs.timelineScope === "manual") {
      onManualSelectionRequest(finalPrefs);
    } else {
      onGenerate(finalPrefs);
    }
  };

  const handleFormatChange = (val: "pdf" | "image" | "text") => {
    let nextScope = prefs.timelineScope;
    if (val === "image" && nextScope === "manual") {
      nextScope = "all";
    }
    setPrefs(p => ({ ...p, format: val, timelineScope: nextScope }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "print" ? (
              <><Printer className="w-5 h-5" /> Imprimir Prontuário</>
            ) : (
              <><Share2 className="w-5 h-5" /> Compartilhar Prontuário</>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-sm text-muted-foreground">Selecione o que incluir no relatório:</p>

          {/* Dados do Paciente */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Dados do paciente</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={prefs.patientData} onCheckedChange={(c) => setPrefs(p => ({ ...p, patientData: !!c }))} />
                Nome, CPF, idade, telefone
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={prefs.patientAddress} onCheckedChange={(c) => setPrefs(p => ({ ...p, patientAddress: !!c }))} />
                Mostrar endereço
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={prefs.patientInsurance} onCheckedChange={(c) => setPrefs(p => ({ ...p, patientInsurance: !!c }))} />
                Mostrar convênio/plano
              </label>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Timeline */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Timeline (Evoluções)</h4>
            <RadioGroup value={prefs.timelineScope} onValueChange={(v: any) => setPrefs(p => ({ ...p, timelineScope: v }))}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="scope-all" />
                <Label htmlFor="scope-all" className="font-normal">Todas as evoluções</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="last" id="scope-last" />
                <Label htmlFor="scope-last" className="font-normal">Apenas a última evolução</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="today" id="scope-today" />
                <Label htmlFor="scope-today" className="font-normal">Apenas evoluções de hoje</Label>
              </div>
              {prefs.format !== "image" && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="scope-manual" />
                  <Label htmlFor="scope-manual" className="font-normal">Selecionar manualmente</Label>
                </div>
              )}
            </RadioGroup>
          </div>

          {/* Tipos de Conteúdo */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Tipos de conteúdo</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={prefs.includeNotes} onCheckedChange={(c) => setPrefs(p => ({ ...p, includeNotes: !!c }))} />
                Evoluções clínicas
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={prefs.includePrescriptions} onCheckedChange={(c) => setPrefs(p => ({ ...p, includePrescriptions: !!c }))} />
                Receitas/Prescrições
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={prefs.includeAttachments} onCheckedChange={(c) => setPrefs(p => ({ ...p, includeAttachments: !!c }))} />
                Anexos e imagens
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={prefs.includeStatus} onCheckedChange={(c) => setPrefs(p => ({ ...p, includeStatus: !!c }))} />
                Dados do atendimento (status, horários)
              </label>
            </div>
          </div>

          {/* Cabeçalho */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Cabeçalho</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={prefs.includeHeader} onCheckedChange={(c) => setPrefs(p => ({ ...p, includeHeader: !!c }))} />
                Incluir nome e logo da clínica
              </label>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Opções de Saída */}
          {mode === "share" && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Opções de Saída</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Formato</Label>
                  <Select value={prefs.format} onValueChange={handleFormatChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF (Padrão)</SelectItem>
                      <SelectItem value="image">Imagem</SelectItem>
                      <SelectItem value="text">Texto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Destino</Label>
                  <Select value={prefs.destination} onValueChange={(v: any) => setPrefs(p => ({ ...p, destination: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="share"><span className="flex items-center gap-2"><Share2 className="w-4 h-4"/> Compartilhar</span></SelectItem>
                      <SelectItem value="download"><span className="flex items-center gap-2"><Download className="w-4 h-4"/> Baixar</span></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={saveAndProceed}>Gerar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
