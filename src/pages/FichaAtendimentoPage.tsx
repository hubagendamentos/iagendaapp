// ============================================================
// FichaAtendimentoPage.tsx (CORRIGIDO - Compartilhar e Imprimir)
// ============================================================
import { useParams, useNavigate } from "react-router-dom";
import { Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FichaAtendimentoHeader } from "@/components/FichaAtendimentoHeader";
import { PainelAtendimento } from "@/components/PainelAtendimento";
import { TimelineCompacta } from "@/components/TimelineCompacta";
import { PainelEvolucao } from "@/components/PainelEvolucao";
import { useUser } from "@/contexts/UserContext";
import { useTimeline } from "@/contexts/TimelineContext";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { mockPacientes } from "@/components/FichaPacienteNormal";
import { compartilharOuBaixar, gerarConteudoImpressao, downloadFile } from "@/utils/gerarPDF";
import { useState } from "react";
import { format, isToday } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";
import { ReceitaModal } from "@/components/ReceitaModal";
import { ReceitaPreviewModal } from "@/components/ReceitaPreviewModal";
import { CompartilharProntuarioModal, type PrintPreferences } from "@/components/CompartilharProntuarioModal";

function calcIdade(nascimento?: string): number | null {
  if (!nascimento) return null;
  const birth = new Date(nascimento);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const FichaAtendimentoPage = () => {
  const { patientId, appointmentId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { user, clinic } = useUser();
  const { getTimelineByPatient, addTimelineItem } = useTimeline();
  const { appointments, updateAppointmentStatus, startAppointment, clearActiveAppointment } = useAppointments();

  const [receitaOpen, setReceitaOpen] = useState(false);
  const [previewReceitaId, setPreviewReceitaId] = useState<string | null>(null);

  // Estados do modal de compartilhamento/impressão
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"share" | "print">("share");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTimelineIds, setSelectedTimelineIds] = useState<string[]>([]);
  const [pendingPrefs, setPendingPrefs] = useState<PrintPreferences | null>(null);

  if (!patientId || !appointmentId) return <div className="p-6">Dados inválidos</div>;

  const paciente = mockPacientes.find(p => p.id === patientId);
  const appointment = appointments.find(a => a.id === appointmentId);

  if (!paciente) return <div className="p-6">Paciente não encontrado</div>;

  const timelineItems = getTimelineByPatient(paciente.id) || [];
  const status = appointment?.status || "scheduled";

  const handleIniciar = () => {
    updateAppointmentStatus(appointmentId, "in_progress");
    startAppointment({
      id: appointmentId,
      patientId,
      professionalId: user?.professionalId || "p1",
      startedAt: new Date().toISOString(),
      patientName: paciente.nome
    });
    addTimelineItem({
      patientId,
      appointmentId,
      type: "status",
      content: "Atendimento iniciado.",
      createdBy: user?.name || "Sistema",
    });
  };

  const handleFinalizar = () => {
    updateAppointmentStatus(appointmentId, "completed");
    clearActiveAppointment();
    addTimelineItem({
      patientId,
      appointmentId,
      type: "status",
      content: "Atendimento finalizado.",
      createdBy: user?.name || "Sistema",
    });
    navigate("/dashboard/atendimentos");
  };

  const handleSave = (content: string) => {
    addTimelineItem({
      patientId,
      appointmentId,
      type: "note",
      content,
      createdBy: user?.name || "Sistema"
    });
  };

  // ============================================================
  // COMPARTILHAR
  // ============================================================
  const handleCompartilhar = () => {
    setModalMode("share");
    setShareModalOpen(true);
  };

  // ============================================================
  // IMPRIMIR
  // ============================================================
  const handleImprimir = () => {
    setModalMode("print");
    setShareModalOpen(true);
  };

  const handleManualSelectionRequest = (prefs: PrintPreferences) => {
    setPendingPrefs(prefs);
    setShareModalOpen(false);
    setSelectedTimelineIds([]);
    setSelectionMode(true);
  };

  // ============================================================
  // GERAR PDF / IMPRIMIR / COMPARTILHAR
  // ============================================================
  const handleGeneratePrint = async (prefs: PrintPreferences) => {
    let filteredItems = [...timelineItems];

    if (prefs.timelineScope === "last") {
      filteredItems = [filteredItems[filteredItems.length - 1]].filter(Boolean);
    } else if (prefs.timelineScope === "today") {
      filteredItems = filteredItems.filter(i => isToday(new Date(i.createdAt)));
    } else if (prefs.timelineScope === "manual") {
      filteredItems = filteredItems.filter(i => selectedTimelineIds.includes(i.id));
    }

    filteredItems = filteredItems.filter(i => {
      if (i.type === "note" && !prefs.includeNotes) return false;
      if (i.type === "prescription" && !prefs.includePrescriptions) return false;
      if (i.type === "attachment" && !prefs.includeAttachments) return false;
      if (i.type === "status" && !prefs.includeStatus) return false;
      return true;
    });

    const pdfData = {
      clinicaNome: prefs.includeHeader ? (clinic?.name || "Clínica Saúde Total") : "Clínica Saúde Total",
      pacienteNome: paciente.nome,
      pacienteCpf: prefs.patientData ? paciente.cpf : undefined,
      pacienteIdade: prefs.patientData ? calcIdade(paciente.nascimento)?.toString() : undefined,
      pacienteTelefone: prefs.patientData ? paciente.celular : undefined,
      profissional: user?.name || "N/A",
      data: format(new Date(), "dd/MM/yyyy"),
      timeline: filteredItems,
    };

    if (prefs.format === "image") {
      const element = document.querySelector('.timeline-container-print') as HTMLElement;
      if (element) {
        toast.loading("Gerando imagem...");
        try {
          const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
          const imgData = canvas.toDataURL('image/png');

          if (prefs.destination === "share" && navigator.share) {
            const blob = await (await fetch(imgData)).blob();
            const file = new File([blob], "prontuario.png", { type: "image/png" });
            navigator.share({ title: "Prontuário", files: [file] }).catch(() => {
              const a = document.createElement("a"); a.href = imgData; a.download = "prontuario.png"; a.click();
            });
          } else {
            const a = document.createElement("a");
            a.href = imgData;
            a.download = "prontuario.png";
            a.click();
          }
          toast.dismiss();
          toast.success("Imagem gerada!");
        } catch (e) {
          toast.dismiss();
          toast.error("Erro ao gerar imagem");
        }
      }
    } else if (prefs.format === "text") {
      compartilharOuBaixar(pdfData as any);
    } else {
      // PDF
      const htmlContent = gerarConteudoImpressao(pdfData as any);

      if (prefs.destination === "print") {
        // IMPRIMIR (iframe invisível)
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
          doc.write(htmlContent);
          doc.close();
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          iframe.contentWindow!.onafterprint = () => document.body.removeChild(iframe);
          setTimeout(() => {
            if (document.body.contains(iframe)) document.body.removeChild(iframe);
          }, 60000);
        }
      } else {
        // COMPARTILHAR / BAIXAR PDF
        const filename = `prontuario_${paciente.nome.toLowerCase().replace(/\s/g, '_')}_${format(new Date(), 'dd-MM-yyyy')}.pdf`;
        toast.loading("Gerando PDF...");

        const opt = {
          margin: [10, 10, 10, 10],
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };

        const wrapper = document.createElement("div");
        wrapper.innerHTML = htmlContent;

        if (prefs.destination === "share" && navigator.share) {
          try {
            const blob = await html2pdf().set(opt).from(wrapper).output('blob');
            toast.dismiss();
            const file = new File([blob], filename, { type: 'application/pdf' });
            try {
              await navigator.share({
                title: `Prontuário - ${paciente.nome}`,
                files: [file]
              });
            } catch {
              const url = URL.createObjectURL(blob);
              downloadFile(url, filename);
            }
          } catch {
            toast.dismiss();
            html2pdf().set(opt).from(wrapper).save();
          }
        } else {
          html2pdf().set(opt).from(wrapper).save();
          toast.dismiss();
        }
      }
    }

    if (shareModalOpen) setShareModalOpen(false);
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 py-4 flex flex-col md:flex-row gap-4 h-[calc(100vh-4rem)] timeline-container-print">

      {/* MODAL COMPARTILHAR/IMPRIMIR */}
      <CompartilharProntuarioModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        userId={user?.professionalId || "default"}
        mode={modalMode}
        onGenerate={handleGeneratePrint}
        onManualSelectionRequest={handleManualSelectionRequest}
      />

      {/* BARRA DE SELEÇÃO MANUAL */}
      {selectionMode && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-xl flex items-center gap-4">
          <span className="font-medium text-sm">{selectedTimelineIds.length} itens selecionados</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="h-7 text-xs" onClick={() => {
              setSelectionMode(false);
              setShareModalOpen(true);
            }}>Cancelar</Button>
            <Button variant="default" className="bg-white text-primary hover:bg-white/90 h-7 text-xs" onClick={() => {
              setSelectionMode(false);
              if (pendingPrefs) {
                setShareModalOpen(true);
              }
            }}>Concluir</Button>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      {!isMobile && (
        <div className="flex-shrink-0">
          <PainelAtendimento
            appointmentId={appointmentId}
            status={status}
            duration={appointment?.duration}
            onIniciar={handleIniciar}
            onFinalizar={handleFinalizar}
          />
        </div>
      )}

      {/* CONTEÚDO */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* HEADER PACIENTE */}
        <FichaAtendimentoHeader
          paciente={paciente}
          profissionalNome={user?.name || ""}
          status={status}
        />

        {/* AÇÕES */}
        <div className="flex justify-end gap-2 mt-3 print:hidden">
          <Button size="sm" variant="outline" onClick={handleCompartilhar}>
            <Share2 className="h-4 w-4 mr-1" />
            Compartilhar
          </Button>
          <Button size="sm" variant="outline" onClick={handleImprimir}>
            <Printer className="h-4 w-4 mr-1" />
            Imprimir
          </Button>
        </div>

        {/* MOBILE */}
        {isMobile && (
          <div className="mt-3">
            <PainelAtendimento
              appointmentId={appointmentId}
              status={status}
              duration={appointment?.duration}
              onIniciar={handleIniciar}
              onFinalizar={handleFinalizar}
            />
          </div>
        )}

        {/* MAIN */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 gap-4 mt-4">

          {/* TIMELINE */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1">
              <TimelineCompacta
                items={timelineItems}
                currentAppointmentId={appointmentId}
                selectionMode={selectionMode}
                selectedIds={selectedTimelineIds}
                onToggleSelect={(id) => {
                  setSelectedTimelineIds(prev =>
                    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                  );
                }}
                onReceitaClick={(id) => setPreviewReceitaId(id)}
              />
            </div>
          </div>

          {/* EVOLUÇÃO */}
          {!isMobile && (
            <div className="w-[400px] flex-shrink-0 flex flex-col">
              <PainelEvolucao
                onSave={handleSave}
                onReceitaClick={() => setReceitaOpen(true)}
              />
            </div>
          )}
        </div>

        {/* MOBILE EVOLUÇÃO */}
        {isMobile && (
          <div className="mt-4">
            <PainelEvolucao
              onSave={handleSave}
              onReceitaClick={() => setReceitaOpen(true)}
            />
          </div>
        )}
      </div>

      {/* MODAIS */}
      <ReceitaModal
        open={receitaOpen}
        onClose={() => setReceitaOpen(false)}
        patientId={patientId}
        appointmentId={appointmentId}
        patientName={paciente.nome}
        filterTipo="receita"
        paciente={{
          nome: paciente.nome,
          cpf: paciente.cpf,
          nascimento: paciente.nascimento,
          idade: calcIdade(paciente.nascimento) || undefined,
          celular: paciente.celular,
          email: (paciente as any).email,
          genero: (paciente as any).genero,
          endereco: (paciente as any).endereco,
        }}
        onSaved={(id, nome) => {
          addTimelineItem({
            patientId,
            appointmentId,
            type: "receita",
            content: `Receita: ${nome}`,
            createdBy: user?.name || "Sistema",
            receitaId: id
          });
          setPreviewReceitaId(id);
        }}
      />

      <ReceitaPreviewModal
        open={!!previewReceitaId}
        onClose={() => setPreviewReceitaId(null)}
        receitaId={previewReceitaId}
      />
    </div>
  );
};

export default FichaAtendimentoPage;