import { useState, useRef } from "react";
import { FileText, Pill, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

const soapButtons = [
  { key: "S", label: "Subjetivo", text: "**S (Subjetivo):** " },
  { key: "O", label: "Objetivo", text: "**O (Objetivo):** " },
  { key: "A", label: "Avaliação", text: "**A (Avaliação):** " },
  { key: "P", label: "Plano", text: "**P (Plano):** " },
];

interface Props {
  onSave: (content: string) => void;
}

export function PainelEvolucao({ onSave }: Props) {
  const { hasPermission } = useUser();
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSoap = (text: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const before = content.slice(0, start);
    const after = content.slice(el.selectionEnd);
    const newContent = before + (before.length > 0 && !before.endsWith("\n") ? "\n" : "") + text;
    setContent(newContent + after);
    setTimeout(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = newContent.length;
    }, 0);
  };

  const handleSave = () => {
    if (!content.trim()) return;
    onSave(content.trim());
    setContent("");
  };

  if (!hasPermission("podeEditarFicha")) {
    return (
      <div className="rounded-xl border bg-card p-4 text-center text-sm text-muted-foreground">
        Sem permissão para editar evolução.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card print:hidden">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold">Evolução Clínica</h3>
        <div className="flex gap-1">
          {soapButtons.map((s) => (
            <Button key={s.key} variant="outline" size="sm" className="h-6 text-xs px-2" onClick={() => insertSoap(s.text)}>
              {s.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="p-3 space-y-3">
        <Textarea
          ref={textareaRef}
          placeholder="Digite a evolução do paciente (SOAP, evolução livre...)"
          className="min-h-[180px] text-sm"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mt-3">
          <Button className="w-full md:w-auto" onClick={handleSave} disabled={!content.trim()} size="sm">
            <FileText className="h-3.5 w-3.5 mr-1.5" /> Salvar Evolução
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 md:flex-none" onClick={() => toast.info("Módulo de receitas em breve")}>
              <Pill className="h-3.5 w-3.5 mr-1.5" /> Receita
            </Button>
            <Button variant="outline" size="sm" className="flex-1 md:flex-none" onClick={() => toast.info("Módulo de anexos em breve")}>
              <Paperclip className="h-3.5 w-3.5 mr-1.5" /> Anexo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}