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
import { gerarConteudoImpressao } from "@/utils/gerarPDF";
import { useState } from "react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReceitaModal } from "@/components/ReceitaModal";
import { ReceitaPreviewModal } from "@/components/ReceitaPreviewModal";

const FichaAtendimentoPage = () => {
  const { patientId, appointmentId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { user } = useUser();
  const { getTimelineByPatient, addTimelineItem } = useTimeline();
  const { appointments, updateAppointmentStatus, startAppointment, clearActiveAppointment } = useAppointments();

  const [receitaOpen, setReceitaOpen] = useState(false);
  const [previewReceitaId, setPreviewReceitaId] = useState<string | null>(null);

  if (!patientId || !appointmentId) return <div>Dados inválidos</div>;

  const paciente = mockPacientes.find(p => p.id === patientId);
  const appointment = appointments.find(a => a.id === appointmentId);

  if (!paciente) return <div>Paciente não encontrado</div>;

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
  };

  const handleFinalizar = () => {
    updateAppointmentStatus(appointmentId, "completed");
    clearActiveAppointment();
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

  const handlePrint = () => {
    const html = gerarConteudoImpressao({
      pacienteNome: paciente.nome,
      profissional: user?.name,
      data: format(new Date(), "dd/MM/yyyy"),
      timeline: timelineItems
    });

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => {
        win.print();
        setTimeout(() => win.close(), 500);
      }, 300);
    }
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 py-4 flex flex-col md:flex-row gap-4 h-[calc(100vh-4rem)]">

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

        {/* AÇÕES (SEM RECEITA) */}
        <div className="flex justify-end gap-2 mt-3">
          <Button size="sm" variant="outline">
            <Share2 className="h-4 w-4 mr-1" />
            Compartilhar
          </Button>
          <Button size="sm" variant="outline" onClick={handlePrint}>
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