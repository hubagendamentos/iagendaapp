import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, XCircle, CalendarClock } from "lucide-react";

interface Props {
  total: number;
  confirmed: number;
  scheduled: number;
  cancelled: number;
  missed: number;
}

export function DashboardAttendanceStats({ total, confirmed, scheduled, cancelled, missed }: Props) {
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  const items = [
    { label: "Confirmados", value: confirmed, color: "bg-success", icon: CheckCircle2, fg: "text-success" },
    { label: "Pendentes", value: scheduled, color: "bg-primary", icon: CalendarClock, fg: "text-primary" },
    { label: "Faltas", value: missed, color: "bg-orange-500", icon: AlertTriangle, fg: "text-orange-500" },
    { label: "Cancelados", value: cancelled, color: "bg-destructive", icon: XCircle, fg: "text-destructive" },
  ];

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Resumo de comparecimento</h3>
        <span className="text-xs text-muted-foreground">{total} hoje</span>
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted mb-4">
        {items.map((i) => (
          <div key={i.label} className={i.color} style={{ width: `${pct(i.value)}%` }} title={i.label} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((i) => (
          <div key={i.label} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-lg bg-muted flex items-center justify-center ${i.fg}`}>
              <i.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground truncate">{i.label}</p>
              <p className="text-sm font-semibold tabular-nums">
                {i.value} <span className="text-[11px] text-muted-foreground font-normal">({pct(i.value).toFixed(0)}%)</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
