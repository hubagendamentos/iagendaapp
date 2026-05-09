// ============================================================
// DashboardHome.tsx (MELHORADO - Atendimentos horizontal, Duração, Fontes maiores)
// ============================================================
import { useState, useEffect } from "react";
import { Calendar, Plus, Users, Stethoscope, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useDashboardMetrics, type DashboardFilters as Filters } from "@/hooks/useDashboardMetrics";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { UpcomingAppointmentsSidebar } from "@/components/dashboard/UpcomingAppointmentsSidebar";

// ============================================================
// SKELETONS
// ============================================================
function MiniStatSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
      <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-12" />
      </div>
      <Skeleton className="h-2 w-20 hidden sm:block rounded-full" />
    </div>
  );
}

function DonutSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Skeleton className="h-20 w-20 rounded-full" />
      <Skeleton className="h-3 w-24" />
      <div className="space-y-2 w-full">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

function BarSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-2 flex-1 rounded-full" />
          <Skeleton className="h-3 w-6" />
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Barra horizontal animada
// ============================================================
function SimpleBar({ value, total, color = "bg-primary" }: { value: number; total: number; color?: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden flex-1">
      <div className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}

// ============================================================
// MiniStat
// ============================================================
function MiniStat({ icon: Icon, label, value, total, color, delay = 0 }: {
  icon: any; label: string; value: number; total?: number; color?: string; delay?: number;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border bg-card hover:shadow-sm transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${color ? color + "/10" : "bg-primary/10"}`}>
        <Icon className={`h-5 w-5 ${color ? color.replace("bg-", "text-") : "text-primary"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
      {total !== undefined && (
        <div className="w-24 hidden sm:block">
          <SimpleBar value={value} total={total} color={color} />
        </div>
      )}
    </div>
  );
}

// ============================================================
// Rosca GRANDE com legenda
// ============================================================
function DonutChart({ data, total, label }: { data: { value: number; color: string; label: string }[]; total: number; label: string }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
            {data.map((seg, i) => {
              const pct = animated ? (total > 0 ? (seg.value / total) * 100 : 0) : 0;
              const circumference = 2 * Math.PI * 15.5;
              const prevPct = data.slice(0, i).reduce((s, d) => s + (animated && total > 0 ? (d.value / total) * 100 : 0), 0);
              return (
                <circle key={seg.label} cx="18" cy="18" r="15.5" fill="none" stroke={seg.color}
                  strokeWidth="3.5" strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-circumference * (prevPct / 100)}
                  className="transition-all duration-1000 ease-out"
                />
              );
            })}
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">{total}</span>
        </div>
        <div className="flex-1 space-y-2">
          {data.map(seg => (
            <div key={seg.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-muted-foreground">{seg.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{seg.value}</span>
                <span className="text-xs text-muted-foreground">({total > 0 ? Math.round((seg.value / total) * 100) : 0}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center font-medium">{label}</p>
    </div>
  );
}

// ============================================================
// Barras horizontais finas para período
// ============================================================
function PeriodBars({ data }: { data: { day: string; qtd: number }[] }) {
  const max = Math.max(...data.map(d => d.qtd), 1);

  return (
    <div className="flex items-end gap-2 h-20">
      {data.map(d => {
        const height = (d.qtd / max) * 100;
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-foreground">{d.qtd}</span>
            <div className="w-full bg-muted rounded-t-md overflow-hidden" style={{ height: "80%" }}>
              <div
                className="w-full bg-primary rounded-t-md transition-all duration-1000 ease-out"
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// DADOS MOCKADOS
// ============================================================
const mockKpis = [
  { label: "Agendados", value: 17, icon: Calendar, color: "bg-blue-500" },
  { label: "Confirmados", value: 3, icon: Users, color: "bg-emerald-500" },
  { label: "Atendidos", value: 12, icon: Stethoscope, color: "bg-violet-500" },
  { label: "Faltas", value: 1, icon: Clock, color: "bg-amber-500" },
];

const mockProcedures = [
  { value: 8, color: "#3b82f6", label: "Consultas" },
  { value: 3, color: "#10b981", label: "Exames" },
  { value: 2, color: "#f59e0b", label: "Proced." },
  { value: 4, color: "#8b5cf6", label: "Retornos" },
];

const mockPatients = [
  { value: 8, color: "#3b82f6", label: "Recorrentes" },
  { value: 4, color: "#10b981", label: "Novos" },
];

const mockPaymentTypes = [
  { value: 9, color: "#3b82f6", label: "Particular" },
  { value: 5, color: "#10b981", label: "Convênio" },
];

const mockDuration = [
  { value: 40, color: "#3b82f6", label: "Até 15min" },
  { value: 35, color: "#10b981", label: "15-30min" },
  { value: 15, color: "#f59e0b", label: "30-45min" },
  { value: 10, color: "#ef4444", label: "45min+" },
];

const mockWeekDays = [
  { day: "Seg", qtd: 4 },
  { day: "Ter", qtd: 6 },
  { day: "Qua", qtd: 3 },
  { day: "Qui", qtd: 8 },
  { day: "Sex", qtd: 5 },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
const DashboardHome = () => {
  const { userType, hasPermission } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<Filters>({
    period: "today",
    professionalId: "all",
    status: "all",
  });

  const m = useDashboardMetrics(filters);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [filters]);

  const kpis = Array.isArray(m?.kpis) && m.kpis.length > 0 ? m.kpis : mockKpis;
  const totalProcedures = mockProcedures.reduce((s, d) => s + d.value, 0);
  const totalPatients = mockPatients.reduce((s, d) => s + d.value, 0);
  const totalPayment = mockPaymentTypes.reduce((s, d) => s + d.value, 0);
  const totalDuration = mockDuration.reduce((s, d) => s + d.value, 0);
  const totalAppointments = kpis[0]?.value || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Visão geral</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {userType === "clinic" ? "Indicadores e desempenho da sua clínica." : "Acompanhe seus atendimentos do dia."}
          </p>
        </div>
        <div className="flex gap-2">
          {hasPermission("agenda") && (
            <Button size="sm" onClick={() => navigate("/dashboard/agenda")} variant="outline" className="gap-1.5 rounded-xl">
              <Calendar className="h-4 w-4" /> Agenda
            </Button>
          )}
          {hasPermission("agenda") && (
            <Button size="sm" onClick={() => navigate("/dashboard/agenda")} className="gap-1.5 rounded-xl">
              <Plus className="h-4 w-4" /> Novo
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <DashboardFilters filters={filters} onChange={setFilters} showProfessional={userType === "clinic"} />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <MiniStatSkeleton key={i} />)
          : kpis.map((kpi: any, i: number) => (
            <MiniStat key={kpi.label} icon={kpi.icon} label={kpi.label} value={kpi.value} total={totalAppointments} color={kpi.color} delay={i * 100} />
          ))
        }
      </div>

      {/* Gráficos + Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6 min-w-0">

          {/* Linha 1: 3 gráficos (Pacientes, Procedimentos, Duração) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}><CardContent className="pt-5"><DonutSkeleton /></CardContent></Card>
              ))
            ) : (
              <>
                {/* Pacientes */}
                <Card>
                  <CardHeader className="pb-1 pt-3">
                    <CardTitle className="text-sm font-semibold">Pacientes</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <DonutChart data={mockPatients} total={totalPatients} label="Recorrentes vs Novos" />
                  </CardContent>
                </Card>

                {/* Procedimentos */}
                <Card>
                  <CardHeader className="pb-1 pt-3">
                    <CardTitle className="text-sm font-semibold">Procedimentos</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <DonutChart data={mockProcedures} total={totalProcedures} label="Tipos de procedimentos" />
                  </CardContent>
                </Card>

                {/* Duração */}
                <Card>
                  <CardHeader className="pb-1 pt-3">
                    <CardTitle className="text-sm font-semibold">Duração do atendimento</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <DonutChart data={mockDuration} total={totalDuration} label="Tempo médio por consulta" />
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Linha 2: Atendimentos no período (horizontal) + Convênio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading ? (
              <>
                <Card><CardHeader className="pb-1 pt-3"><Skeleton className="h-4 w-36" /></CardHeader><CardContent><BarSkeleton /></CardContent></Card>
                <Card><CardContent className="pt-5"><DonutSkeleton /></CardContent></Card>
              </>
            ) : (
              <>
                {/* Atendimentos no período - Gráfico de colunas */}
                <Card>
                  <CardHeader className="pb-1 pt-3">
                    <CardTitle className="text-sm font-semibold">Atendimentos no período</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PeriodBars data={mockWeekDays} />
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      Total: 26 atendimentos esta semana
                    </p>
                  </CardContent>
                </Card>

                {/* Tipo de Atendimento */}
                <Card>
                  <CardHeader className="pb-1 pt-3">
                    <CardTitle className="text-sm font-semibold">Tipo de atendimento</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <DonutChart data={mockPaymentTypes} total={totalPayment} label="Particular vs Convênio" />
                  </CardContent>
                </Card>
              </>
            )}
          </div>

        </div>

        {/* Sidebar */}
        <div className="xl:max-h-[calc(100vh-260px)] xl:sticky xl:top-4">
          <UpcomingAppointmentsSidebar appointments={m?.upcoming || []} />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;