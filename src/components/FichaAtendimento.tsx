import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft, CheckCircle2, User, Phone,
  FileText, Pill, Paperclip, Clock, PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { applyCpfCnpjMask } from "@/components/CpfCnpjMaskInput";
import { applyPhoneMask } from "@/components/PhoneMaskInput";
import { useUser } from "@/contexts/UserContext";
import { useTimeline } from "@/contexts/TimelineContext";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { mockPacientes } from "./FichaPacienteNormal";

function getInitials(name: string = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0])
    .join("")
    .toUpperCase();
}

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

export const FichaAtendimento = () => {
  const { patientId, appointmentId } = useParams<{ patientId: string; appointmentId: string }>();
  const navigate = useNavigate();

  const { user, hasPermission } = useUser();
  const { getTimelineByPatient, addTimelineItem } = useTimeline();
  const { updateAppointmentStatus, clearActiveAppointment } = useAppointments();

  const [noteContent, setNoteContent] = useState("");

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

  const paciente = mockPacientes.find(p => p.id === patientId);

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

  const timelineItems = getTimelineByPatient(paciente.id) || [];

  const currentAttendanceItems = timelineItems.filter(
    t => t?.appointmentId === appointmentId
  );

  const previousHistoryItems = timelineItems.filter(
    t => t?.appointmentId !== appointmentId
  );

  const idade = calcIdade(paciente.nascimento);
  const phoneDigits = (paciente.celular || "").replace(/\D/g, "");

  const handleFinishAttendance = () => {
    if (appointmentId) {
      updateAppointmentStatus(appointmentId, "completed");
      clearActiveAppointment();

      addTimelineItem({
        patientId: paciente.id,
        appointmentId,
        type: "status",
        content: "Atendimento finalizado.",
        createdBy: user?.name || "Sistema",
      });
    }

    navigate(`/dashboard/atendimentos`);
  };

  const handleVerFicha = () => {
    navigate(`/dashboard/paciente/${patientId}`);
  };

  const handleAddNote = () => {
    if (!noteContent.trim() || !appointmentId) return;

    addTimelineItem({
      patientId: paciente.id,
      appointmentId,
      type: "note",
      content: noteContent.trim(),
      createdBy: user?.name || "Sistema",
    });

    setNoteContent("");
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col px-4 sm:px-0">

      {/* HEADER */}
      <div className="flex flex-col gap-3 p-4 mb-6 rounded-xl border bg-card shadow-sm sticky top-0 z-20">

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {getInitials(paciente.nome)}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{paciente.nome}</h2>
                <Badge className="bg-blue-500 animate-pulse">Em atendimento</Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> {user?.name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {format(new Date(), "HH:mm")}
                </span>
              </div>
            </div>
          </div>

          {hasPermission("podeFinalizar") && (
            <Button onClick={handleFinishAttendance}>
              <CheckCircle2 className="h-4 w-4 mr-2" /> Finalizar Atendimento
            </Button>
          )}
          <Button variant="outline" onClick={handleVerFicha}>
            <FileText className="h-4 w-4 mr-2" /> Ver Ficha
          </Button>
        </div>

        {/* DADOS */}
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground border-t pt-3">
          <span>
            <strong>{idade ?? "N/A"} anos</strong> • {paciente.genero || "N/A"}
          </span>

          <span>
            CPF:{" "}
            <strong>
              {paciente.cpf ? applyCpfCnpjMask(paciente.cpf) : "Não informado"}
            </strong>
          </span>

          <span className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" />
            <strong>
              {phoneDigits ? applyPhoneMask(phoneDigits) : "Não informado"}
            </strong>
          </span>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1">

        {/* TIMELINE */}
        <div className="rounded-xl border bg-card flex flex-col min-h-[500px]">
          <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" /> Histórico Clínico
            </h3>
          </div>

          <div className="p-5 flex-1 overflow-y-auto space-y-6">

            {/* ATUAL */}
            <div>
              <Badge className="mb-3 bg-blue-100 text-blue-700">
                Atendimento Atual
              </Badge>

              <div className="space-y-4 pl-3 border-l-2 border-blue-300">
                {currentAttendanceItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    Nenhum registro ainda.
                  </p>
                ) : (
                  currentAttendanceItems.map(item =>
                    item ? (
                      <TimelineCard key={item.id} item={item} isCurrent />
                    ) : null
                  )
                )}
              </div>
            </div>

            {/* HISTÓRICO */}
            {previousHistoryItems.length > 0 && (
              <div>
                <Badge variant="outline" className="mb-3">
                  Histórico Anterior
                </Badge>

                <div className="space-y-4 pl-3 border-l-2">
                  {previousHistoryItems.map(item =>
                    item ? (
                      <TimelineCard key={item.id} item={item} />
                    ) : null
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* EVOLUÇÃO */}
        <div className="lg:sticky lg:top-[120px]">
          <div className="rounded-xl border bg-card">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Evolução Clínica</h3>
            </div>

            {hasPermission("podeEditarFicha") ? (
              <div className="p-4 space-y-4">

                <Textarea
                  placeholder="Digite a evolução do paciente (SOAP, evolução livre...)"
                  className="min-h-[220px]"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />

                <Button onClick={handleAddNote} disabled={!noteContent.trim()}>
                  <FileText className="h-4 w-4 mr-2" /> Salvar Evolução
                </Button>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                  <Button variant="outline" className="h-12 flex flex-col gap-1 text-xs">
                    <Pill className="h-4 w-4" />
                    Receita
                  </Button>

                  <Button variant="outline" className="h-12 flex flex-col gap-1 text-xs">
                    <Paperclip className="h-4 w-4" />
                    Anexo
                  </Button>
                </div>

              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                Sem permissão.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

/* TIMELINE CARD MELHORADO */
function TimelineCard({ item, isCurrent = false }: { item: any; isCurrent?: boolean }) {

  const getStyles = () => {
    switch (item?.type) {
      case "note":
        return {
          icon: <FileText className="h-4 w-4 text-emerald-600" />,
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
          border: "border-emerald-200 dark:border-emerald-800",
          label: "Evolução Clínica"
        };
      case "prescription":
        return {
          icon: <Pill className="h-4 w-4 text-purple-600" />,
          bg: "bg-purple-50 dark:bg-purple-900/20",
          border: "border-purple-200 dark:border-purple-800",
          label: "Prescrição"
        };
      case "attachment":
        return {
          icon: <Paperclip className="h-4 w-4 text-amber-600" />,
          bg: "bg-amber-50 dark:bg-amber-900/20",
          border: "border-amber-200 dark:border-amber-800",
          label: "Anexo"
        };
      case "status":
        return {
          icon: <PlayCircle className="h-4 w-4 text-blue-600" />,
          bg: "bg-blue-50 dark:bg-blue-900/20",
          border: "border-blue-200 dark:border-blue-800",
          label: "Status"
        };
      default:
        return {
          icon: <FileText className="h-4 w-4 text-muted-foreground" />,
          bg: "bg-muted",
          border: "border-border",
          label: "Registro"
        };
    }
  };

  const style = getStyles();

  const date =
    item?.createdAt && !isNaN(new Date(item.createdAt).getTime())
      ? format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")
      : "--";

  return (
    <div className={`relative pl-6 ${isCurrent ? "" : "opacity-80 hover:opacity-100"}`}>

      <div className={`
        absolute -left-[6px] top-4 h-3 w-3 rounded-full
        ${isCurrent ? "bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30" : "bg-border"}
      `} />

      <div className={`rounded-xl border p-4 shadow-sm ${style.bg} ${style.border}`}>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">

            <div className="h-7 w-7 rounded-md bg-white/60 dark:bg-black/20 flex items-center justify-center">
              {style.icon}
            </div>

            <span className="text-xs font-semibold uppercase tracking-wide">
              {style.label}
            </span>
          </div>

          <span className="text-xs text-muted-foreground">
            {date}
          </span>
        </div>

        {item?.content && (
          <div className="text-sm leading-relaxed bg-white/50 dark:bg-black/20 p-3 rounded-md border">
            {item.content}
          </div>
        )}

        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
          <User className="h-3 w-3" />
          Registrado por <span className="font-medium">{item?.createdBy || "Sistema"}</span>
        </div>

      </div>
    </div>
  );
}