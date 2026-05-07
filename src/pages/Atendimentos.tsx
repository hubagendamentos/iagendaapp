// ============================================================
// Atendimentos.tsx (COMPLETO - com botão Atestado)
// ============================================================
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, isToday, parse } from "date-fns";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { useTimeline } from "@/contexts/TimelineContext";
import { useUser } from "@/contexts/UserContext";
import { useCaixa } from "@/contexts/CaixaContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  FileText,
  Filter,
  User,
  PlayCircle,
} from "lucide-react";
import { Appointment, AppointmentStatus } from "@/components/AppointmentModal";
import { EncerrarAtendimentoModal } from "@/components/EncerrarAtendimentoModal";
import { ReceitaModal } from "@/components/ReceitaModal";
import { ReceitaPreviewModal } from "@/components/ReceitaPreviewModal";
import { mockPacientes } from "@/components/FichaPacienteNormal";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/page-header";

const professionals = [
  { id: "p1", name: "Dr. João Silva" },
  { id: "p2", name: "Dra. Maria Santos" },
  { id: "p3", name: "Dr. Pedro Lima" },
];

const statusConfig: Record<
  AppointmentStatus,
  { label: string; badgeClass: string }
> = {
  scheduled: { label: "Agendado", badgeClass: "bg-muted text-muted-foreground" },
  confirmed: {
    label: "Confirmado",
    badgeClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  in_progress: {
    label: "Em atendimento",
    badgeClass:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  completed: {
    label: "Finalizado",
    badgeClass: "bg-secondary text-secondary-foreground",
  },
  cancelled: {
    label: "Cancelado",
    badgeClass:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  missed: {
    label: "Faltou",
    badgeClass:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
};

type FilterView = "all" | "in_progress" | "queue" | "completed";

const Atendimentos = () => {
  const { hasPermission, clinic, professionalId: userProfId, user } = useUser();
  const { getAppointmentsByDate, updateAppointmentStatus, updateAppointment, appointments, clearActiveAppointment, activeAppointment, startAppointment } = useAppointments();
  const { addTimelineItem } = useTimeline();
  const { addLancamento, addPagamentos } = useCaixa();
  const navigate = useNavigate();
  const isClinic = clinic?.type === "clinic";

  const [dateStr, setDateStr] = useState(format(new Date(), "yyyy-MM-dd"));
  const [profFilter, setProfFilter] = useState<string>("all");
  const [viewFilter, setViewFilter] = useState<FilterView>("all");
  const [encerrarApt, setEncerrarApt] = useState<Appointment | null>(null);

  // Estados para o modal de documento (atestado/declaração)
  const [documentoModalOpen, setDocumentoModalOpen] = useState(false);
  const [documentoPaciente, setDocumentoPaciente] = useState<{ id: string; nome: string; cpf?: string; celular?: string; nascimento?: string } | null>(null);
  const [documentoTipo, setDocumentoTipo] = useState<"atestado" | "declaracao" | "solicitacao">("atestado");
  const [previewDocumentoId, setPreviewDocumentoId] = useState<string | null>(null);

  const selectedDate = parse(dateStr, "yyyy-MM-dd", new Date());
  const allAppointments = getAppointmentsByDate(selectedDate);

  const now = new Date();
  const currentTimeStr = format(now, "HH:mm");

  const filtered = useMemo(() => {
    let list = allAppointments;

    if (!isClinic) {
      list = list.filter((a) => a.professionalId === userProfId);
    } else if (profFilter !== "all") {
      list = list.filter((a) => a.professionalId === profFilter);
    }

    return list.sort((a, b) => a.time.localeCompare(b.time));
  }, [allAppointments, isClinic, userProfId, profFilter]);

  const inProgress = filtered.filter((a) => a.status === "in_progress");

  const queue = filtered
    .filter((a) => a.status === "scheduled" || a.status === "confirmed")
    .sort((a, b) => {
      const aLate = a.time < currentTimeStr ? 1 : 0;
      const bLate = b.time < currentTimeStr ? 1 : 0;
      if (aLate !== bLate) return bLate - aLate;
      return a.time.localeCompare(b.time);
    });

  const completed = filtered.filter((a) => a.status === "completed");

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    updateAppointmentStatus(id, status);
  };

  const handleEncerrar = (apt: Appointment, data: {
    pagamentos: Array<{ valor: number; formaPagamento: any; planoContasId: string }>;
    totalComDesconto?: number;
  }) => {
    const profName = professionals.find((p) => p.id === apt.professionalId)?.name || "Profissional";
    const now = new Date().toISOString();

    addPagamentos(data.pagamentos.map((p) => ({
      atendimentoId: apt.id,
      valor: p.valor,
      formaPagamento: p.formaPagamento,
      planoContas: p.planoContasId,
      dataHora: now,
      usuario: user?.name || "Sistema",
      origem: "atendimento",
    })));

    data.pagamentos.forEach((p) => {
      addLancamento({
        tipo: "entrada",
        origem: "Atendimento",
        atendimentoId: apt.id,
        paciente: apt.patientName,
        profissional: profName,
        profissionalId: apt.professionalId,
        valor: p.valor,
        formaPagamento: p.formaPagamento,
        planoContas: p.planoContasId,
        dataHora: now,
      });
    });

    const totalPago = (apt.valor_pago ?? 0) + data.pagamentos.reduce((s, p) => s + p.valor, 0);
    const valorReferencia = data.totalComDesconto !== undefined ? data.totalComDesconto : (apt.price ?? 0);
    const statusPagamento = totalPago >= valorReferencia ? "pago" : totalPago > 0 ? "parcial" : "pendente";

    updateAppointment(apt.id, {
      valor_pago: totalPago,
      status_pagamento: statusPagamento,
      financeiro_encerrado: statusPagamento === "pago",
    });

    toast({
      title: statusPagamento === "pago" ? "Pagamento concluído" : "Pagamento registrado",
      description: statusPagamento === "pago" ? "Atendimento totalmente pago." : "Pagamento registrado."
    });
    setEncerrarApt(null);
  };

  // Abrir modal de documento (atestado)
  const handleAbrirDocumento = (apt: Appointment, tipo: "atestado" | "declaracao" | "solicitacao") => {
    const pacienteMock = mockPacientes.find(p => p.id === apt.patientId);
    setDocumentoPaciente({
      id: apt.patientId || "",
      nome: apt.patientName,
      cpf: pacienteMock?.cpf,
      celular: pacienteMock?.celular,
      nascimento: pacienteMock?.nascimento,
    });
    setDocumentoTipo(tipo);
    setDocumentoModalOpen(true);
  };

  const renderCard = (apt: Appointment, isNext = false) => {
    const cfg = statusConfig[apt.status];

    const isLate =
      isToday(selectedDate) &&
      (apt.status === "scheduled" || apt.status === "confirmed") &&
      apt.time < currentTimeStr;

    const profName =
      professionals.find((p) => p.id === apt.professionalId)?.name ||
      "Profissional";

    return (
      <div
        key={apt.id}
        className={`bg-card border rounded-xl p-4 mb-3 shadow-sm hover:shadow-md transition ${apt.status === "in_progress"
          ? "border-blue-500 ring-1 ring-blue-500/30"
          : ""
          }`}
      >
        <div className="flex justify-between flex-col sm:flex-row gap-4">

          {/* ESQUERDA */}
          <div className="flex gap-4">
            <div className="min-w-[70px] text-center border-r pr-4">
              <div className="text-lg font-bold">{apt.time}</div>

              {isLate && (
                <div className="text-xs text-red-600 font-semibold mt-1">
                  ATRASADO
                </div>
              )}

              {isNext && (
                <div className="text-xs text-blue-600 font-semibold mt-1">
                  PRÓXIMO
                </div>
              )}
            </div>

            <div>
              <div className="flex gap-2 items-center flex-wrap">
                <span className="font-semibold">{apt.patientName}</span>

                <span className={`text-xs px-2 py-0.5 rounded ${cfg.badgeClass}`}>
                  {cfg.label}
                </span>
              </div>

              <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-2">
                <span className="flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1" />
                  {apt.type} {apt.serviceName ? `- ${apt.serviceName}` : ""}
                </span>

                {isClinic && (
                  <span className="flex items-center">
                    <ChevronRight className="w-3 h-3 mr-1" />
                    {profName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* AÇÕES */}
          <div className="flex gap-2 flex-wrap items-center">
            {apt.status === "scheduled" && (
              <>
                {hasPermission("podeConfirmar") && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleStatusChange(apt.id, "confirmed")}
                  >
                    Confirmar
                  </Button>
                )}

                {hasPermission("podeMarcarFalta") && (
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => handleStatusChange(apt.id, "missed")}
                  >
                    Faltou
                  </Button>
                )}

                {hasPermission("podeCancelar") && (
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleStatusChange(apt.id, "cancelled")}
                  >
                    Cancelar
                  </Button>
                )}
              </>
            )}

            {apt.status === "confirmed" && (
              <>
                {hasPermission("podeIniciar") && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      const appointmentCompleto = appointments.find(a => a.id === apt.id) || apt;

                      if (!appointmentCompleto.patientId) {
                        toast({
                          variant: "destructive",
                          title: "Erro",
                          description: "Paciente não vinculado ao agendamento."
                        });
                        return;
                      }

                      const profTemAberto = appointments.some(
                        (a) => a.status === "in_progress" && a.professionalId === apt.professionalId && a.id !== apt.id
                      );

                      if (profTemAberto) {
                        toast({
                          variant: "destructive",
                          title: "Atenção",
                          description: "Este profissional já possui um atendimento em andamento."
                        });
                        return;
                      }

                      navigate(`/dashboard/atendimento/${appointmentCompleto.patientId}/${appointmentCompleto.id}`);
                    }}
                  >
                    <PlayCircle className="w-3.5 h-3.5 mr-1" />
                    Iniciar
                  </Button>
                )}

                {hasPermission("podeMarcarFalta") && (
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => handleStatusChange(apt.id, "missed")}
                  >
                    Faltou
                  </Button>
                )}

                {hasPermission("podeCancelar") && (
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleStatusChange(apt.id, "cancelled")}
                  >
                    Cancelar
                  </Button>
                )}
              </>
            )}

            {apt.status === "in_progress" && (
              <>
                {hasPermission("podeVerProntuario") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-700 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950"
                    onClick={() => {
                      if (apt.patientId) {
                        navigate(`/dashboard/atendimento/${apt.patientId}/${apt.id}`);
                      }
                    }}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" />
                    Prontuário
                  </Button>
                )}

                {hasPermission("podeFinalizar") && (
                  <Button
                    size="sm"
                    className="bg-blue-700 hover:bg-blue-800 text-white"
                    onClick={() => {
                      handleStatusChange(apt.id, "completed");
                      clearActiveAppointment();
                      toast({
                        title: "Atendimento finalizado",
                        description: "Disponível para encerramento financeiro."
                      });
                    }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Finalizar
                  </Button>
                )}
              </>
            )}

            {apt.status === "completed" && (
              <>
                {apt.status_pagamento !== "pago" && hasPermission("encerrarAtendimentoFinanceiro") && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setEncerrarApt(apt)}
                  >
                    <DollarSign className="w-3.5 h-3.5 mr-1" />
                    Encerrar
                  </Button>
                )}

                {/* BOTÃO ATESTADO */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAbrirDocumento(apt, "atestado")}
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Atestado
                </Button>
              </>
            )}

            {apt.status_pagamento === "pago" && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 whitespace-nowrap">
                <DollarSign className="w-3 h-3" /> Pago
              </span>
            )}

            {apt.status_pagamento === "parcial" && (
              <span className="text-xs text-amber-600 font-medium flex items-center gap-1 whitespace-nowrap">
                <DollarSign className="w-3 h-3" /> Parcial
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Section = ({
    title,
    list,
  }: {
    title: string;
    list: Appointment[];
  }) => {
    if (list.length === 0) return null;

    return (
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-2">
          {title} ({list.length})
        </h2>

        {list.map((apt, index) =>
          renderCard(apt, title.includes("Fila") && index === 0)
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Atendimentos"
        subtitle="Acompanhe o fluxo dos atendimentos e gerencie cada etapa do atendimento clínico."
      />
      <div className="flex gap-3 mb-6 flex-wrap items-end">
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="pl-9 w-[160px]"
          />
        </div>

        {isClinic && (
          <Select value={profFilter} onValueChange={setProfFilter}>
            <SelectTrigger className="w-[220px]">
              <User className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Profissionais</SelectItem>
              {professionals.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={viewFilter} onValueChange={(value) => setViewFilter(value as FilterView)}>
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="in_progress">🔵 Em atendimento</SelectItem>
            <SelectItem value="queue">⚪ Fila de atendimento</SelectItem>
            <SelectItem value="completed">✅ Finalizados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {viewFilter === "all" && (
        <>
          <Section title="🔵 Em atendimento" list={inProgress} />
          <Section title="⚪ Fila de atendimento" list={queue} />
          <Section title="✅ Finalizados" list={completed} />
        </>
      )}

      {viewFilter === "in_progress" && (
        <Section title="🔵 Em atendimento" list={inProgress} />
      )}

      {viewFilter === "queue" && (
        <Section title="⚪ Fila de atendimento" list={queue} />
      )}

      {viewFilter === "completed" && (
        <Section title="✅ Finalizados" list={completed} />
      )}

      {/* MODAL ENCERRAMENTO FINANCEIRO */}
      {encerrarApt && (
        <EncerrarAtendimentoModal
          open={!!encerrarApt}
          onOpenChange={(open) => { if (!open) setEncerrarApt(null); }}
          appointment={encerrarApt}
          profissionalNome={professionals.find((p) => p.id === encerrarApt.professionalId)?.name || "Profissional"}
          onConfirm={(data) => handleEncerrar(encerrarApt, data)}
        />
      )}

      {/* MODAL DE DOCUMENTO (ATESTADO) */}
      {documentoPaciente && (
        <ReceitaModal
          open={documentoModalOpen}
          onClose={() => { setDocumentoModalOpen(false); setDocumentoPaciente(null); }}
          patientId={documentoPaciente.id}
          appointmentId=""
          patientName={documentoPaciente.nome}
          filterTipo={documentoTipo}
          paciente={{
            nome: documentoPaciente.nome,
            cpf: documentoPaciente.cpf,
            nascimento: documentoPaciente.nascimento,
            celular: documentoPaciente.celular,
          }}
          onSaved={(id, nome) => {
            setPreviewDocumentoId(id);
            toast({
              title: "Documento gerado",
              description: `${nome} salvo com sucesso.`
            });
          }}
        />
      )}

      {/* PREVIEW DO DOCUMENTO */}
      <ReceitaPreviewModal
        open={!!previewDocumentoId}
        onClose={() => setPreviewDocumentoId(null)}
        receitaId={previewDocumentoId}
      />
    </div>
  );
};

export default Atendimentos;