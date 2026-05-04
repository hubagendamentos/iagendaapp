import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FichaAtendimentoHeader } from "@/components/FichaAtendimentoHeader";
import { PainelAtendimento } from "@/components/PainelAtendimento";
import { TimelineCompacta } from "@/components/TimelineCompacta";
import { PainelEvolucao } from "@/components/PainelEvolucao";
import { useUser } from "@/contexts/UserContext";
import { useTimeline } from "@/contexts/TimelineContext";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { mockPacientes } from "@/components/FichaPacienteNormal";
import { compartilharOuBaixar } from "@/utils/gerarPDF";
import { applyCpfCnpjMask } from "@/components/CpfCnpjMaskInput";
import { applyPhoneMask } from "@/components/PhoneMaskInput";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

const FichaAtendimentoPage = () => {
  const { patientId, appointmentId } = useParams<{ patientId: string; appointmentId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, hasPermission } = useUser();
  const { getTimelineByPatient, addTimelineItem } = useTimeline();
  const { appointments, updateAppointmentStatus, clearActiveAppointment, startAppointment } = useAppointments();

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

  const calcIdade = (n?: string) => {
    if (!n) return null;
    const b = new Date(n);
    if (isNaN(b.getTime())) return null;
    const t = new Date();
    let a = t.getFullYear() - b.getFullYear();
    const m = t.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
    return a;
  };

  const handleCompartilhar = () => {
    compartilharOuBaixar({
      clinicaNome: "Clínica Saúde Total",
      pacienteNome: paciente.nome,
      pacienteCpf: paciente.cpf ? applyCpfCnpjMask(paciente.cpf) : undefined,
      pacienteIdade: calcIdade(paciente.nascimento),
      pacienteTelefone: paciente.celular ? applyPhoneMask(paciente.celular.replace(/\D/g, "")) : undefined,
      profissional: user?.name || "N/A",
      data: format(new Date(), "dd/MM/yyyy"),
      tipo: appointment?.type,
      servico: appointment?.serviceName,
      timeline: timelineItems,
    });
  };

  const handleImprimir = () => window.print();

  return (
    <div className="flex p-4 sm:p-6 min-h-[calc(100vh-4rem)] gap-4">
      {/* Painel lateral - sticky no topo, alinhado com header */}
      {!isMobile && (
        <div className="sticky top-4 self-start">
          <PainelAtendimento
            appointmentId={appointmentId}
            status={status}
            duration={appointment?.duration}
            onIniciar={handleIniciar}
            onFinalizar={handleFinalizar}
          />
        </div>
      )}

      {/* Área direita: header + ações + timeline + evolução */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <FichaAtendimentoHeader
          paciente={paciente}
          profissionalNome={user?.name || ""}
          status={status}
        />

        <div className="flex gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handleCompartilhar}>
            <Share2 className="h-3.5 w-3.5 mr-1.5" /> Compartilhar
          </Button>
          <Button variant="outline" size="sm" onClick={handleImprimir}>
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Imprimir
          </Button>
        </div>

        {/* Mobile: painel como barra horizontal */}
        {isMobile && (
          <div className="flex items-center gap-3 p-3 border rounded-xl bg-card print:hidden">
            <PainelAtendimento
              appointmentId={appointmentId}
              status={status}
              duration={appointment?.duration}
              onIniciar={handleIniciar}
              onFinalizar={handleFinalizar}
            />
          </div>
        )}

        <TimelineCompacta items={timelineItems} currentAppointmentId={appointmentId} />
        <PainelEvolucao onSave={handleSaveEvolucao} />
      </div>
    </div>
  );
};

export default FichaAtendimentoPage;