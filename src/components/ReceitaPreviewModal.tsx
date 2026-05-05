import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { useReceitas } from "@/contexts/ReceitasContext";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  receitaId: string | null;
}

export function ReceitaPreviewModal({ open, onClose, receitaId }: Props) {
  const { getReceitaById } = useReceitas();
  const receita = receitaId ? getReceitaById(receitaId) : null;

  if (!receita) return null;

  const handlePrint = () => {
    const printConfig = localStorage.getItem("print_config");
    let pageSize = "A4";
    let orientation = "portrait";
    let margins = "10mm";

    if (printConfig) {
      const cfg = JSON.parse(printConfig);
      if (cfg.paperSize === "custom") {
        pageSize = `${cfg.width}mm ${cfg.height}mm`;
      } else {
        pageSize = cfg.paperSize || "A4";
      }
      orientation = cfg.orientation || "portrait";
      margins = `${cfg.marginTop || 10}mm ${cfg.marginRight || 10}mm ${cfg.marginBottom || 10}mm ${cfg.marginLeft || 10}mm`;
    }

    const htmlWithPageStyle = receita.html.replace(
      "</style>",
      `@page { size: ${pageSize} ${orientation}; margin: ${margins}; }</style>`
    );

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(htmlWithPageStyle);
      win.document.close();
      setTimeout(() => {
        win.print();
        setTimeout(() => { if (!win.closed) win.close(); }, 1000);
      }, 300);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([receita.html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receita_${receita.templateNome.replace(/\s/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Receita baixada!");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl !inset-0 !translate-x-0 !translate-y-0 !top-0 !left-0 sm:!inset-auto sm:!left-[50%] sm:!top-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] rounded-none sm:rounded-lg w-full sm:w-auto max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{receita.templateNome}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-3.5 w-3.5 mr-1.5" /> Imprimir
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Baixar
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="border rounded-lg overflow-hidden mt-2">
          <iframe
            srcDoc={receita.html}
            className="w-full h-[60vh] border-0"
            title="Preview da receita"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}