import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, FileText } from "lucide-react";
import { useReceitas } from "@/contexts/ReceitasContext";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";

interface Props {
  open: boolean;
  onClose: () => void;
  receitaId: string | null;
}

export function ReceitaPreviewModal({ open, onClose, receitaId }: Props) {
  const { getReceitaById } = useReceitas();
  const receita = receitaId ? getReceitaById(receitaId) : null;

  if (!receita) return null;

  // =============================
  // 🔥 PRINT (mantém seu padrão)
  // =============================
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

    // Criar iframe invisível (sem abrir janela)
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlWithPageStyle);
      doc.close();

      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      iframe.contentWindow!.onafterprint = () => {
        document.body.removeChild(iframe);
      };

      // Fallback: remover após 60s se onafterprint não disparar
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 60000);
    }
  };

  // =============================
  // 📥 DOWNLOAD HTML (original)
  // =============================
  const handleDownloadHTML = () => {
    const blob = new Blob([receita.html], {
      type: "text/html;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `receita_${receita.templateNome.replace(/\s/g, "_")}.html`;
    a.click();

    URL.revokeObjectURL(url);

    toast.success("Receita HTML baixada!");
  };

  // =============================
  // 🆕 DOWNLOAD PDF
  // =============================
  const handleDownloadPDF = async () => {
    try {
      toast.loading("Gerando PDF...");

      const element = document.createElement("div");
      element.innerHTML = receita.html;

      const opt = {
        margin: [5, 5, 5, 5],
        filename: `receita_${receita.templateNome.replace(/\s/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: {
          unit: "mm",
          format: "a5", // 🔥 melhor para receitas médicas
          orientation: "portrait",
        },
      };

      await html2pdf().set(opt).from(element).save();

      toast.dismiss();
      toast.success("PDF gerado com sucesso!");
    } catch (e) {
      toast.dismiss();
      toast.error("Erro ao gerar PDF");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          w-[98vw] max-w-[1100px]
          h-[92vh]
          p-4
          flex flex-col
        "
      >
        {/* HEADER */}
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate">{receita.templateNome}</span>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-3.5 w-3.5 mr-1.5" />
                Imprimir
              </Button>

              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                PDF
              </Button>


            </div>
          </DialogTitle>
        </DialogHeader>

        {/* PREVIEW GRANDE */}
        <div className="flex-1 border rounded-lg overflow-hidden mt-2 bg-white">
          <iframe
            srcDoc={receita.html}
            className="w-full h-full border-0"
            title="Preview da receita"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}