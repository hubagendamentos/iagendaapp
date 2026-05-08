import { Calendar as CalendarIcon, Filter, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DashboardFilters as Filters, DashboardPeriod } from "@/hooks/useDashboardMetrics";
import { useProfessionals } from "@/hooks/useDashboardMetrics";

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  showProfessional?: boolean;
}

const periods: { value: DashboardPeriod; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
  { value: "custom", label: "Personalizado" },
];

export function DashboardFilters({ filters, onChange, showProfessional = true }: Props) {
  const professionals = useProfessionals();

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-card p-2 shadow-sm">
      <div className="flex items-center gap-1 px-2 text-xs text-muted-foreground">
        <Filter className="h-3.5 w-3.5" />
        Filtros
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {periods.map((p) => (
          <Button
            key={p.value}
            size="sm"
            variant={filters.period === p.value ? "default" : "ghost"}
            className="h-8 rounded-xl text-xs"
            onClick={() => onChange({ ...filters, period: p.value })}
          >
            <CalendarIcon className="h-3.5 w-3.5 mr-1" />
            {p.label}
          </Button>
        ))}
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        {showProfessional && (
          <Select
            value={filters.professionalId ?? "all"}
            onValueChange={(v) => onChange({ ...filters, professionalId: v })}
          >
            <SelectTrigger className="h-8 w-[180px] rounded-xl text-xs">
              <Users className="h-3.5 w-3.5 mr-1" />
              <SelectValue placeholder="Profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos profissionais</SelectItem>
              {professionals.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={filters.status ?? "all"}
          onValueChange={(v) => onChange({ ...filters, status: v })}
        >
          <SelectTrigger className="h-8 w-[150px] rounded-xl text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="confirmed">Confirmados</SelectItem>
            <SelectItem value="scheduled">Agendados</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
            <SelectItem value="missed">Faltas</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
