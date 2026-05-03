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
  PlayCircle,
  XCircle,
  UserX,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import { Appointment, AppointmentStatus } from "@/components/AppointmentModal";
import { EncerrarAtendimentoModal } from "@/components/EncerrarAtendimentoModal";
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

const Atendimentos = () => {
  const { hasPermission, clinic, professionalId: userProfId, user } = useUser();
  const { getAppointmentsByDate, updateAppointmentStatus, updateAppointment, activeAppointment, startAppointment } = useAppointments();
  const { addTimelineItem } = useTimeline();
  const { addLancamento, addPagamentos, getTotalPagoByAtendimentoId } = useCaixa();
  const navigate = useNavigate();
  const isClinic = clinic?.type === "clinic";

  const [dateStr, setDateStr] = useState(format(new Date(), "yyyy-MM-dd"));
  const [profFilter, setProfFilter] = useState<string>("all");
  const [encerrarApt, setEncerrarApt] = useState<Appointment | null>(null);

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

  // 🔵 Em atendimento
  const inProgress = filtered.filter((a) => a.status === "in_progress");

  // ⚪ Fila com prioridade
  const queue = filtered
    .filter((a) => a.status === "scheduled" || a.status === "confirmed")
    .sort((a, b) => {
      const aLate = a.time < currentTimeStr ? 1 : 0;
      const bLate = b.time < currentTimeStr ? 1 : 0;

      if (aLate !== bLate) return bLate - aLate;
      return a.time.localeCompare(b.time);
    });

  // ✅ Finalizados
  const completed = filtered.filter((a) => a.status === "completed");

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    updateAppointmentStatus(id, status);
  };

  const handleEncerrar = (apt: Appointment, data: { pagamentos: Array<{ valor: number; formaPagamento: any; planoContasId: string }> }) => {
    const profName = professionals.find((p) => p.id === apt.professionalId)?.name || "Profissional";

    const now = new Date().toISOString();

    // Create payment records
    addPagamentos(data.pagamentos.map((p) => ({
      atendimentoId: apt.id,
      valor: p.valor,
      formaPagamento: p.formaPagamento,
      planoContas: p.planoContasId,
      dataHora: now,
      usuario: user?.name || "Sistema",
      origem: "atendimento",
    })));

    // Create cash register entries (one per payment)
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
    const valorTotal = apt.price ?? 0;
    const statusPagamento = totalPago >= valorTotal ? "pago" : totalPago > 0 ? "parcial" : "pendente";

    updateAppointment(apt.id, {
      valor_pago: totalPago,
      status_pagamento: statusPagamento,
      financeiro_encerrado: statusPagamento === "pago",
    });

    toast({ title: "Pagamento registrado", description: statusPagamento === "pago" ? "Atendimento totalmente pago." : "Pagamento parcial registrado." });
    setEncerrarApt(null);
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
                      if (activeAppointment && activeAppointment.id !== apt.id) {
                        alert("Finalize o atendimento atual antes de iniciar outro.");
                        return;
                      }

                      handleStatusChange(apt.id, "in_progress");

                      startAppointment({
                        id: apt.id,
                        patientId: apt.patientId || "1",
                        professionalId: apt.professionalId,
                        patientName: apt.patientName,
                        startedAt: new Date().toISOString()
                      });

                      addTimelineItem({
                        patientId: apt.patientId || "1",
                        appointmentId: apt.id,
                        type: "status",
                        content: "Atendimento iniciado.",
                        createdBy: user?.name || "Sistema",
                      });

                      navigate(`/dashboard/ficha-paciente/${apt.patientId || "1"}?mode=atendimento&appointmentId=${apt.id}`);
                    }}
                  >
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

            {apt.status === "in_progress" && hasPermission("podeFinalizar") && (
              <Button
                size="sm"
                className="bg-blue-700 hover:bg-blue-800 text-white"
                onClick={() => handleStatusChange(apt.id, "completed")}
              >
                Finalizar
              </Button>
            )}

            {apt.status === "completed" &&
              apt.status_pagamento !== "pago" &&
              hasPermission("encerrarAtendimentoFinanceiro") && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => setEncerrarApt(apt)}
                >
                  <DollarSign className="w-3.5 h-3.5 mr-1" />
                  Encerrar
                </Button>
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
      <div className="flex gap-3 mb-6">
        <div className="relative">
          <Input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="pl-9"
          />
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
        </div>

        {isClinic && (
          <Select value={profFilter} onValueChange={setProfFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {professionals.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Section title="🔵 Em atendimento" list={inProgress} />
      <Section title="⚪ Fila de atendimento" list={queue} />
      <Section title="✅ Finalizados" list={completed} />

      {encerrarApt && (
        <EncerrarAtendimentoModal
          open={!!encerrarApt}
          onOpenChange={(open) => { if (!open) setEncerrarApt(null); }}
          appointment={encerrarApt}
          profissionalNome={professionals.find((p) => p.id === encerrarApt.professionalId)?.name || "Profissional"}
          onConfirm={(data) => handleEncerrar(encerrarApt, data)}
        />
      )}
    </div>
  );
};

export default Atendimentos;