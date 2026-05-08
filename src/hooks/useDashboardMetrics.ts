import { useMemo } from "react";
import { format, subDays, eachDayOfInterval, startOfMonth } from "date-fns";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { useCaixa } from "@/contexts/CaixaContext";

export type DashboardPeriod = "today" | "week" | "month" | "custom";

export interface DashboardFilters {
  period: DashboardPeriod;
  professionalId?: string;
  status?: string;
  from?: Date;
  to?: Date;
}

const PROFESSIONALS = [
  { id: "p1", name: "Dr. João Silva" },
  { id: "p2", name: "Dra. Maria Santos" },
  { id: "p3", name: "Dr. Pedro Lima" },
];

export function useProfessionals() {
  return PROFESSIONALS;
}

export function useDashboardMetrics(filters: DashboardFilters) {
  const { appointments } = useAppointments();
  const { lancamentos } = useCaixa();

  return useMemo(() => {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");

    let filtered = appointments;
    if (filters.professionalId && filters.professionalId !== "all") {
      filtered = filtered.filter((a) => a.professionalId === filters.professionalId);
    }
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((a) => a.status === filters.status);
    }

    const todayAppts = filtered.filter((a) => a.date === todayStr);
    const confirmed = todayAppts.filter((a) => a.status === "confirmed").length;
    const scheduled = todayAppts.filter((a) => a.status === "scheduled").length;
    const cancelled = todayAppts.filter((a) => a.status === "cancelled").length;
    const missed = todayAppts.filter((a) => a.status === "missed").length;
    const total = todayAppts.length;

    const attended = confirmed; // simplificado
    const attendanceRate = total > 0 ? (attended / total) * 100 : 0;
    const confirmationRate = total > 0 ? ((confirmed + scheduled) / total) * 100 : 0;

    const faturamentoDia = lancamentos
      .filter((l) => l.tipo === "entrada" && l.dataHora.startsWith(todayStr))
      .reduce((s, l) => s + l.valor, 0);

    const monthStart = format(startOfMonth(today), "yyyy-MM");
    const faturamentoMes = lancamentos
      .filter((l) => l.tipo === "entrada" && l.dataHora.startsWith(monthStart))
      .reduce((s, l) => s + l.valor, 0);

    // Série últimos 7 dias
    const days = eachDayOfInterval({ start: subDays(today, 6), end: today });
    const dailySeries = days.map((d) => {
      const ds = format(d, "yyyy-MM-dd");
      const dayAppts = filtered.filter((a) => a.date === ds);
      return {
        date: format(d, "dd/MM"),
        agendados: dayAppts.length,
        confirmados: dayAppts.filter((a) => a.status === "confirmed").length,
        faltas: dayAppts.filter((a) => a.status === "missed").length,
        cancelados: dayAppts.filter((a) => a.status === "cancelled").length,
      };
    });

    const statusPie = [
      { name: "Confirmados", value: confirmed, key: "confirmed" },
      { name: "Agendados", value: scheduled, key: "scheduled" },
      { name: "Cancelados", value: cancelled, key: "cancelled" },
      { name: "Faltas", value: missed, key: "missed" },
    ];

    const byProfessional = PROFESSIONALS.map((p) => ({
      name: p.name.replace("Dra. ", "").replace("Dr. ", ""),
      atendimentos: todayAppts.filter((a) => a.professionalId === p.id).length,
    }));

    // Horários movimentados (mock baseado em dados)
    const hours = ["08h", "09h", "10h", "11h", "13h", "14h", "15h", "16h", "17h"];
    const byHour = hours.map((h) => {
      const hourPrefix = h.replace("h", ":");
      return {
        hora: h,
        total: filtered.filter((a) => a.time?.startsWith(hourPrefix.slice(0, 2))).length,
      };
    });

    // Faturamento mensal (últimos 6 meses) - mock
    const months = ["Dez", "Jan", "Fev", "Mar", "Abr", "Mai"];
    const revenueSeries = months.map((m, i) => ({
      mes: m,
      valor: 8000 + Math.round(Math.sin(i) * 2500 + i * 1200),
    }));

    // Tempo médio de atendimento (mock minutos por dia)
    const avgTimeSeries = days.map((d) => ({
      date: format(d, "dd/MM"),
      minutos: 25 + Math.round(Math.random() * 15),
    }));

    return {
      kpis: {
        total,
        confirmed,
        scheduled,
        cancelled,
        missed,
        attendanceRate,
        confirmationRate,
        avgDuration: 32,
        faturamentoDia,
        faturamentoMes,
      },
      dailySeries,
      statusPie,
      byProfessional,
      byHour,
      revenueSeries,
      avgTimeSeries,
      upcoming: appointments
        .filter((a) => a.date === todayStr && (a.status === "scheduled" || a.status === "confirmed"))
        .sort((a, b) => a.time.localeCompare(b.time)),
    };
  }, [appointments, lancamentos, filters]);
}
