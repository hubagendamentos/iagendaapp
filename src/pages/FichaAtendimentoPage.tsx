import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Share2 } from "lucide-react";
import { ClipboardList } from "lucide-react";
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
import { applyCpfCnpjMask } from "@/components/CpfCnpjMaskInput";
import { applyPhoneMask } from "@/components/PhoneMaskInput";
import { useState } from "react";
import { format, isToday } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";
import { CompartilharProntuarioModal, PrintPreferences } from "@/components/CompartilharProntuarioModal";
import { ReceitaModal } from "@/components/ReceitaModal";
import { ReceitaPreviewModal } from "@/components/ReceitaPreviewModal";

const FichaAtendimentoPage = () => {
  const { patientId, appointmentId } = useParams<{ patientId: string; appointmentId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useUser();
  const { getTimelineByPatient, addTimelineItem } = useTimeline();
  const { appointments, updateAppointmentStatus, clearActiveAppointment, startAppointment, activeAppointment } = useAppointments();

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"share" | "print">("share");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTimelineIds, setSelectedTimelineIds] = useState<string[]>([]);
  const [pendingPrefs, setPendingPrefs] = useState<PrintPreferences | null>(null);
  const [receitaModalOpen, setReceitaModalOpen] = useState(false);
  const [previewReceitaId, setPreviewReceitaId] = useState<string | null>(null);

  if (!patientId || !appointmentId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground">Dados do atendimento inválidos.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/atendimentos")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const paciente = mockPacientes.find((p) => p.id === patientId);
  const appointment = appointments.find((a) => a.id === appointmentId);

  if (!paciente) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground">Paciente não encontrado.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/atendimentos")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const status = appointment?.status || "scheduled";
  const timelineItems = getTimelineByPatient(paciente.id) || [];

  const handleIniciar = () => {
    updateAppointmentStatus(appointmentId, "in_progress" as any);
    startAppointment({
      id: appointmentId,
      patientId: paciente.id,
      professionalId: user?.professionalId || "p1",
      clinicId: user?.clinicId,
      startedAt: new Date().toISOString(),
      patientName: paciente.nome,
    });
    addTimelineItem({
      patientId: paciente.id,
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
      patientId: paciente.id,
      appointmentId,
      type: "status",
      content: "Atendimento finalizado.",
      createdBy: user?.name || "Sistema",
    });
    navigate("/dashboard/atendimentos");
  };

  const handleSaveEvolucao = (content: string) => {
    addTimelineItem({
      patientId: paciente.id,
      appointmentId,
      type: "note",
      content,
      createdBy: user?.name || "Sistema",
    });
  };

  const handleCompartilhar = () => {
    setModalMode("share");
    setShareModalOpen(true);
  };

  const handleImprimir = () => {
    setModalMode("print");
    const saved = localStorage.getItem(`print_preferences_${user?.professionalId || "default"}`);
    if (saved) {
      const parsed = JSON.parse(saved) as PrintPreferences;
      if (parsed.timelineScope === "manual") {
        setShareModalOpen(true);
      } else {
        handleGeneratePrint({ ...parsed, format: "pdf", destination: "print" });
      }
    } else {
      setShareModalOpen(true);
    }
  };

  const handleManualSelectionRequest = (prefs: PrintPreferences) => {
    setPendingPrefs(prefs);
    setShareModalOpen(false);
    setSelectedTimelineIds([]);
    setSelectionMode(true);
  };

  const handleGeneratePrint = async (prefs: PrintPreferences) => {
    let filteredItems = [...timelineItems];
    if (prefs.timelineScope === "last") {
      filteredItems = filteredItems.slice(0, 1);
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
      clinicaNome: prefs.includeHeader ? user?.clinicId || "Clínica Saúde Total" : "Clínica Saúde Total",
      pacienteNome: paciente.nome,
      pacienteCpf: prefs.patientData ? paciente.cpf : undefined,
      pacienteIdade: prefs.patientData ? paciente.idade : undefined,
      pacienteTelefone: prefs.patientData ? paciente.telefone : undefined,
      profissional: user?.name || "N/A",
      data: format(new Date(), "dd/MM/yyyy"),
      timeline: filteredItems,
    };

    if (prefs.format === "image") {
      const element = document.querySelector('.timeline-container-print') as HTMLElement;
      if (element) {
        toast.loading("Gerando imagem...");
        try {
          const canvas = await html2canvas(element, { scale: 2 });
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
          toast.success("Imagem gerada com sucesso!");
        } catch (e) {
          toast.dismiss();
          toast.error("Erro ao gerar imagem");
        }
      }
    } else if (prefs.format === "text") {
      compartilharOuBaixar(pdfData);
    } else {
      // Formato PDF (HTML formatado)
      const htmlContent = gerarConteudoImpressao(pdfData);
      
      if (prefs.destination === "print") {
        const janela = window.open('', '_blank');
        if (janela) {
          janela.document.write(htmlContent);
          janela.document.close();
          janela.onafterprint = () => {
            janela.close();
          };
          // Aguarda um instante para o navegador renderizar o HTML antes de chamar o print
          setTimeout(() => {
            janela.print();
            // Fallback caso onafterprint falhe em alguns navegadores
            setTimeout(() => {
              if (!janela.closed) janela.close();
            }, 1000);
          }, 300);
        }
      } else {
        // Download / Compartilhar como PDF via html2pdf
        const filename = `prontuario_${paciente.nome.toLowerCase().replace(/\s/g, '_')}_${format(new Date(), 'dd-MM-yyyy')}.pdf`;
        toast.loading("Gerando PDF...");
        
        const opt = {
          margin: [10, 10, 10, 10],
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        const wrapper = document.createElement("div");
        wrapper.innerHTML = htmlContent;
        
        if (prefs.destination === "share" && navigator.share) {
          // Utiliza promise nativa do html2pdf se disponível, ou fallback para save
          try {
            html2pdf().set(opt).from(wrapper).output('blob').then(async (blob: any) => {
              toast.dismiss();
              const file = new File([blob], filename, { type: 'application/pdf' });
              try {
                await navigator.share({
                  title: `Prontuário - ${paciente.nome}`,
                  text: 'Prontuário de atendimento',
                  files: [file]
                });
              } catch (e) {
                const url = URL.createObjectURL(blob);
                downloadFile(url, filename);
              }
            });
          } catch(e) {
             toast.dismiss();
             html2pdf().set(opt).from(wrapper).save();
          }
        } else {
          html2pdf().set(opt).from(wrapper).save().then(() => toast.dismiss());
        }
      }
    }
    
    if (shareModalOpen) setShareModalOpen(false);
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 py-4 min-h-[calc(100vh-4rem)] flex flex-col md:flex-row md:h-[calc(100vh-4rem)] md:overflow-hidden gap-3 relative timeline-container-print">
      
      <CompartilharProntuarioModal 
        open={shareModalOpen} 
        onOpenChange={setShareModalOpen} 
        userId={user?.professionalId || "default"}
        mode={modalMode}
        onGenerate={handleGeneratePrint}
        onManualSelectionRequest={handleManualSelectionRequest}
      />

      {selectionMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
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
        <div className="flex-shrink-0 transition-all duration-300">
          <div className="sticky top-0">
            <PainelAtendimento
              appointmentId={appointmentId}
              status={status}
              duration={appointment?.duration}
              onIniciar={handleIniciar}
              onFinalizar={handleFinalizar}
            />
          </div>
        </div>
      )}

      {/* CONTEÚDO */}
      <div className="flex-1 flex flex-col md:overflow-hidden min-w-0">

        {/* HEADER PACIENTE (SEM BOTÕES) */}
        <div className="border-b pb-3 mb-3">
          <FichaAtendimentoHeader
            paciente={paciente}
            profissionalNome={user?.name || ""}
            status={status}
          />
        </div>

        {/* HEADER DA TIMELINE */}
        <div className="flex items-center justify-between mb-2">

          {/* ESQUERDA (filtros ficam dentro do componente se já tiver) */}
          <div className="flex-1">
            {/* espaço reservado caso queira mover o search pra cá futuramente */}
          </div>

          {/* DIREITA (BOTÕES AGORA NO LUGAR CERTO) */}
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={() => setReceitaModalOpen(true)}>
              <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
              Receita
            </Button>
            <Button variant="outline" size="sm" onClick={handleCompartilhar}>
              <Share2 className="h-3.5 w-3.5 mr-1.5" />
              Compartilhar
            </Button>
            <Button variant="outline" size="sm" onClick={handleImprimir}>
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              Imprimir
            </Button>
          </div>
        </div>

        {/* MOBILE: PAINEL ATENDIMENTO ACIMA DA TIMELINE */}
        {isMobile && (
          <div className="mb-3">
            <PainelAtendimento
              appointmentId={appointmentId}
              status={status}
              duration={appointment?.duration}
              onIniciar={handleIniciar}
              onFinalizar={handleFinalizar}
            />
          </div>
        )}

        {/* CONTEÚDO PRINCIPAL */}
        <div className="flex flex-col md:flex-row flex-1 md:overflow-hidden">

          {/* TIMELINE */}
          <div className="flex-1 flex flex-col min-h-0 md:pr-3">
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
              onReceitaClick={(receitaId) => setPreviewReceitaId(receitaId)}
            />
          </div>

          {/* EVOLUÇÃO */}
          {!isMobile && (
            <div className="w-[400px] border-l pl-3 flex flex-col">
              <PainelEvolucao onSave={handleSaveEvolucao} />
            </div>
          )}

        </div>

        {/* MOBILE: EVOLUÇÃO ABAIXO DA TIMELINE */}
        {isMobile && (
          <div className="mt-3 flex flex-col">
            <PainelEvolucao onSave={handleSaveEvolucao} />
          </div>
        )}
      </div>

      <ReceitaModal
        open={receitaModalOpen}
        onClose={() => setReceitaModalOpen(false)}
        patientId={patientId}
        appointmentId={appointmentId}
        patientName={paciente.nome}
        onSaved={(receitaId, templateNome) => {
          addTimelineItem({
            patientId: paciente.id,
            appointmentId,
            type: "receita",
            content: `Receita: ${templateNome}`,
            createdBy: user?.name || "Sistema",
            receitaId,
          });
          setPreviewReceitaId(receitaId);
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