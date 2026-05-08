import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CalendarOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useProfessionals } from "@/hooks/useDashboardMetrics";

interface Appt {
  id: string;
  patientName: string;
  time: string;
  professionalId: string;
  status: string;
}

const statusStyle: Record<string, string> = {
  confirmed: "bg-success/10 text-success border-success/20",
  scheduled: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  missed: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

const statusLabel: Record<string, string> = {
  confirmed: "Confirmado",
  scheduled: "Pendente",
  cancelled: "Cancelado",
  missed: "Faltou",
};

export function UpcomingAppointmentsSidebar({ appointments }: { appointments: Appt[] }) {
  const navigate = useNavigate();
  const pros = useProfessionals();
  const proName = (id: string) => pros.find((p) => p.id === id)?.name ?? "—";

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Próximos Atendimentos</h3>
          <p className="text-[11px] text-muted-foreground">{appointments.length} hoje</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/agenda")}
          className="text-[11px] text-primary hover:underline"
        >
          Ver agenda
        </button>
      </div>
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border/60">
          {appointments.length === 0 && (
            <div className="p-6 text-center text-xs text-muted-foreground">
              <CalendarOff className="h-6 w-6 mx-auto mb-2 opacity-50" />
              Sem atendimentos
            </div>
          )}
          {appointments.map((a) => (
            <button
              key={a.id}
              onClick={() => navigate("/dashboard/agenda")}
              className="w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center w-12 shrink-0 rounded-lg bg-muted/50 py-1.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground tabular-nums">{a.time}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {a.patientName}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{proName(a.professionalId)}</p>
                </div>
              </div>
              <Badge variant="outline" className={cn("mt-2 text-[10px] font-normal", statusStyle[a.status])}>
                {statusLabel[a.status] ?? a.status}
              </Badge>
            </button>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
