import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, CheckCircle2, User, Phone, MapPin, 
  Calendar, FileText, Pill, Paperclip, Clock, PlayCircle
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
import { mockPacientes, mockHistory } from "./FichaPacienteNormal"; // Using the mock data for now

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

function calcIdade(nascimento: string): number | null {
  if (!nascimento) return null;
  const today = new Date();
  const birth = new Date(nascimento);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export const FichaAtendimento = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = searchParams.get("appointmentId");
  
  const { user, hasPermission } = useUser();
  const { getTimelineByPatient, addTimelineItem } = useTimeline();
  const { updateAppointmentStatus } = useAppointments();

  const [noteContent, setNoteContent] = useState("");

  const paciente = mockPacientes.find(p => p.id === id);

  if (!paciente) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground">Paciente não encontrado.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/ficha-paciente")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const timelineItems = getTimelineByPatient(paciente.id);
  const currentAttendanceItems = timelineItems.filter(t => t.appointmentId === appointmentId);
  const previousHistoryItems = timelineItems.filter(t => t.appointmentId !== appointmentId);

  const idade = calcIdade(paciente.nascimento);
  const phoneDigits = paciente.celular.replace(/\D/g, "");
  
  const nextAppt = mockHistory.find(h => h.status === "scheduled");

  const handleFinishAttendance = () => {
    if (appointmentId) {
      updateAppointmentStatus(appointmentId, "completed");
      addTimelineItem({
        patientId: paciente.id,
        appointmentId,
        type: "status",
        content: "Atendimento finalizado.",
        createdBy: user?.name || "Sistema",
      });
    }
    navigate(`/dashboard/ficha-paciente/${paciente.id}`);
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
    <div className="min-h-[calc(100vh-8rem)] flex flex-col -mx-6 px-6 sm:-mx-0 sm:px-0 bg-background sm:bg-transparent">
      
      {/* 1. Header Clínico */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 mb-6 rounded-xl border bg-card shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {getInitials(paciente.nome)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground leading-none">{paciente.nome}</h2>
              <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 animate-pulse">
                Em atendimento
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1.5">
              <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {user?.name}</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {format(new Date(), "HH:mm")}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {hasPermission("podeFinalizar") && (
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700" onClick={handleFinishAttendance}>
              <CheckCircle2 className="h-4 w-4 mr-2" /> Finalizar Atendimento
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6 items-start">
        
        {/* 2. Coluna Esquerda: Resumo */}
        <div className="space-y-4 lg:sticky lg:top-[120px]">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h3 className="font-semibold text-foreground border-b pb-2">Resumo do Paciente</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs mb-0.5">Idade / Gênero</span>
                <span className="font-medium text-foreground">{idade !== null ? `${idade} anos` : "N/A"} • {paciente.genero || "N/A"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs mb-0.5">CPF</span>
                <span className="font-medium text-foreground">{paciente.cpf ? applyCpfCnpjMask(paciente.cpf) : "Não informado"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs mb-0.5">Telefone</span>
                <span className="font-medium text-foreground flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" /> {applyPhoneMask(phoneDigits)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold text-foreground border-b pb-2 mb-3">Próximo Agendamento</h3>
            {nextAppt ? (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-secondary flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-muted-foreground uppercase leading-none">{format(new Date(nextAppt.date + "T12:00:00"), "MMM", { locale: ptBR })}</span>
                  <span className="text-sm font-bold text-foreground leading-none mt-1">{format(new Date(nextAppt.date + "T12:00:00"), "dd")}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{nextAppt.type}</p>
                  <p className="text-xs text-muted-foreground">{nextAppt.time}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum agendamento futuro.</p>
            )}
          </div>
        </div>

        {/* 3. Coluna Central: Timeline */}
        <div className="rounded-xl border bg-card overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Histórico Clínico
            </h3>
          </div>
          
          <div className="p-5 flex-1 overflow-y-auto space-y-6">
            
            {/* ATENDIMENTO ATUAL */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                  Atendimento Atual
                </Badge>
                <div className="h-px bg-border flex-1" />
              </div>

              <div className="space-y-4 pl-2 border-l-2 border-blue-200 dark:border-blue-800 ml-4">
                {currentAttendanceItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground pl-4 italic">Nenhum registro adicionado ainda.</p>
                ) : (
                  currentAttendanceItems.map(item => (
                    <TimelineCard key={item.id} item={item} isCurrent={true} />
                  ))
                )}
              </div>
            </div>

            {/* HISTÓRICO ANTERIOR */}
            {previousHistoryItems.length > 0 && (
              <div className="relative mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                    Histórico Anterior
                  </Badge>
                  <div className="h-px bg-border flex-1" />
                </div>

                <div className="space-y-4 pl-2 border-l-2 border-border ml-4">
                  {previousHistoryItems.map(item => (
                    <TimelineCard key={item.id} item={item} isCurrent={false} />
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 4. Coluna Direita: Ações Clínicas */}
        <div className="lg:sticky lg:top-[120px] order-first lg:order-last mb-6 lg:mb-0">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold text-foreground">Ações Clínicas</h3>
            </div>
            
            {hasPermission("podeEditarFicha") ? (
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Textarea 
                    placeholder="Digite a evolução do paciente..."
                    className="min-h-[150px] resize-none focus-visible:ring-primary/20 text-sm"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                  />
                  <Button className="w-full" onClick={handleAddNote} disabled={!noteContent.trim()}>
                    <FileText className="h-4 w-4 mr-2" /> Salvar Evolução
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" className="h-12 flex flex-col items-center justify-center gap-1 text-xs whitespace-normal text-center">
                    <Pill className="h-4 w-4" />
                    <span className="leading-none mt-1">Gerar Receita</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-12 flex flex-col items-center justify-center gap-1 text-xs whitespace-normal text-center">
                    <Paperclip className="h-4 w-4" />
                    <span className="leading-none mt-1">Anexar Arquivo</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground text-sm">
                Você não possui permissão para editar o prontuário deste paciente.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

/* Componente Auxiliar para Item da Timeline */
function TimelineCard({ item, isCurrent }: { item: any; isCurrent: boolean }) {
  const getIcon = () => {
    switch (item.type) {
      case "note": return <FileText className="h-4 w-4 text-emerald-600" />;
      case "prescription": return <Pill className="h-4 w-4 text-purple-600" />;
      case "attachment": return <Paperclip className="h-4 w-4 text-amber-600" />;
      case "status": return <PlayCircle className="h-4 w-4 text-blue-600" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLabel = () => {
    switch (item.type) {
      case "note": return "Evolução Clínica";
      case "prescription": return "Prescrição Médica";
      case "attachment": return "Anexo / Exame";
      case "status": return "Status do Atendimento";
      default: return "Registro";
    }
  };

  return (
    <div className={`relative pl-6 py-1 ${isCurrent ? "" : "opacity-80 hover:opacity-100 transition-opacity"}`}>
      {/* Marcador na linha */}
      <div className={`absolute -left-[5px] top-3 h-2 w-2 rounded-full ${isCurrent ? "bg-blue-500 ring-4 ring-blue-50 dark:ring-blue-900/30" : "bg-border ring-4 ring-background"}`} />
      
      <div className="rounded-lg border bg-card p-3 shadow-sm hover:shadow transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-muted flex items-center justify-center shrink-0">
              {getIcon()}
            </div>
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">{getLabel()}</span>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")}
          </span>
        </div>
        
        {item.content && (
          <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed bg-muted/30 p-2.5 rounded-md border border-border/50">
            {item.content}
          </div>
        )}

        <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
          <User className="h-3 w-3" /> Registrado por <span className="font-medium text-foreground">{item.createdBy}</span>
        </div>
      </div>
    </div>
  );
}
