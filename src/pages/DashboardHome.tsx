import { useState } from "react";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useDashboardMetrics, type DashboardFilters as Filters } from "@/hooks/useDashboardMetrics";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { UpcomingAppointmentsSidebar } from "@/components/dashboard/UpcomingAppointmentsSidebar";
import { DashboardProfessionalRanking } from "@/components/dashboard/DashboardProfessionalRanking";

const DashboardHome = () => {
  const { userType, hasPermission } = useUser();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<Filters>({
    period: "today",
    professionalId: "all",
    status: "all",
  });

  const m = useDashboardMetrics(filters);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">
            Visão geral
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {userType === "clinic"
              ? "Indicadores e desempenho da sua clínica em tempo real."
              : "Acompanhe seus atendimentos e métricas do dia."}
          </p>
        </div>
        <div className="flex gap-2">
          {hasPermission("agenda") && (
            <Button size="sm" onClick={() => navigate("/dashboard/agenda")} variant="outline" className="gap-1.5 rounded-xl">
              <Calendar className="h-4 w-4" />
              Agenda
            </Button>
          )}
          {hasPermission("agenda") && (
            <Button size="sm" onClick={() => navigate("/dashboard/agenda")} className="gap-1.5 rounded-xl">
              <Plus className="h-4 w-4" />
              Novo
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <DashboardFilters filters={filters} onChange={setFilters} showProfessional={userType === "clinic"} />

      {/* KPIs principais */}
      <DashboardMetrics kpis={m.kpis} showProfessionals={userType === "clinic"} />

      {/* Operação + Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6 min-w-0">
          <DashboardCharts dailySeries={m.dailySeries} statusPie={m.statusPie} />
          <DashboardProfessionalRanking data={m.byProfessional} />
        </div>
        <div className="xl:max-h-[calc(100vh-260px)] xl:sticky xl:top-4">
          <UpcomingAppointmentsSidebar appointments={m.upcoming} />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;