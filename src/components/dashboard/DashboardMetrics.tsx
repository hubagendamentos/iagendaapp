import { LucideIcon, CalendarClock, AlertTriangle, Timer, TrendingUp, CheckCircle2, DollarSign, CalendarCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCard {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  hint?: string;
}

const toneClasses: Record<string, { bg: string; fg: string; ring: string }> = {
  default: { bg: "bg-muted/60", fg: "text-muted-foreground", ring: "" },
  success: { bg: "bg-success/10", fg: "text-success", ring: "" },
  warning: { bg: "bg-orange-500/10", fg: "text-orange-500", ring: "" },
  danger: { bg: "bg-destructive/10", fg: "text-destructive", ring: "" },
  info: { bg: "bg-primary/10", fg: "text-primary", ring: "" },
};

function MetricCard({ label, value, icon: Icon, trend, tone = "default", hint }: KpiCard) {
  const t = toneClasses[tone];
  return (
    <Card className="group relative rounded-xl border-border/50 p-3.5 shadow-none hover:border-border transition-colors animate-fade-in">
      <div className="flex items-center gap-3">
        <div className={cn("h-9 w-9 shrink-0 rounded-lg flex items-center justify-center", t.bg)}>
          <Icon className={cn("h-4 w-4", t.fg)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted-foreground truncate">{label}</p>
          <p className="text-lg font-semibold text-foreground tabular-nums leading-tight">{value}</p>
        </div>
        {typeof trend === "number" && (
          <span
            className={cn(
              "text-[10px] font-medium tabular-nums",
              trend >= 0 ? "text-success" : "text-destructive",
            )}
          >
            {trend >= 0 ? "+" : ""}
            {trend.toFixed(1)}%
          </span>
        )}
      </div>
      {hint && <p className="text-[10px] text-muted-foreground mt-1.5 truncate">{hint}</p>}
    </Card>
  );
}

interface Props {
  kpis: {
    total: number;
    confirmed: number;
    scheduled: number;
    cancelled: number;
    missed: number;
    attendanceRate: number;
    confirmationRate: number;
    avgDuration: number;
    faturamentoDia: number;
    faturamentoMes: number;
  };
  totalPatients?: number;
  totalProfessionals?: number;
  showProfessionals?: boolean;
}

const fmtMoney = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function DashboardMetrics({ kpis, totalPatients = 248, totalProfessionals = 8, showProfessionals = true }: Props) {
  void totalPatients;
  void totalProfessionals;
  void showProfessionals;
  const cards: KpiCard[] = [
    { label: "Agendados hoje", value: kpis.total, icon: CalendarClock, tone: "info" },
    { label: "Confirmados", value: kpis.confirmed, icon: CheckCircle2, trend: 8.4, tone: "success" },
    { label: "Aguardando confirmação", value: kpis.scheduled, icon: CalendarCheck, tone: "warning" },
    { label: "Faltas do dia", value: kpis.missed, icon: AlertTriangle, trend: -1.6, tone: "warning" },
    { label: "Tempo médio", value: `${kpis.avgDuration}min`, icon: Timer, tone: "default" },
    { label: "Faturamento do dia", value: fmtMoney(kpis.faturamentoDia), icon: DollarSign, trend: 6.8, tone: "success" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((c) => (
        <MetricCard key={c.label} {...c} />
      ))}
    </div>
  );
}

// keep TrendingUp import referenced (used previously) – noop guard
void TrendingUp;
