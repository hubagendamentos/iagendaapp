import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { CalendarOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Appt {
  id: string;
  patientName: string;
  time: string;
  professionalId: string;
  status: string;
}

const statusDot: Record<string, string> = {
  confirmed: "bg-success",
  scheduled: "bg-muted-foreground/50",
  cancelled: "bg-destructive",
  missed: "bg-orange-500",
};

const statusLabel: Record<string, string> = {
  confirmed: "Confirmado",
  scheduled: "Pendente",
  cancelled: "Cancelado",
  missed: "Faltou",
};

export function UpcomingAppointmentsSidebar({ appointments }: { appointments: Appt[] }) {
  const navigate = useNavigate();

  return (
    <Card className="rounded-xl border-border/50 shadow-none flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Próximos atendimentos</h3>
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
        <ul className="py-1">
          {appointments.length === 0 && (
            <li className="p-6 text-center text-xs text-muted-foreground">
              <CalendarOff className="h-6 w-6 mx-auto mb-2 opacity-50" />
              Sem atendimentos
            </li>
          )}
          {appointments.map((a) => (
            <li key={a.id}>
              <button
                onClick={() => navigate("/dashboard/agenda")}
                className="w-full text-left px-4 py-2.5 hover:bg-muted/40 transition-colors flex items-center gap-3"
              >
                <span className="text-xs font-semibold text-foreground tabular-nums w-10 shrink-0">
                  {a.time}
                </span>
                <span className="text-sm text-foreground truncate flex-1">{a.patientName}</span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground shrink-0">
                  <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[a.status])} />
                  {statusLabel[a.status] ?? a.status}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </Card>
  );
}
