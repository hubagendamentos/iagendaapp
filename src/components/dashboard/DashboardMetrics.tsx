import { LucideIcon, Users, UserCog, CalendarCheck, CalendarClock, AlertTriangle, XCircle, Timer, TrendingUp, CheckCircle2, DollarSign, Wallet } from "lucide-react";
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
  default: { bg: "bg-muted", fg: "text-foreground", ring: "ring-border" },
  success: { bg: "bg-success/10", fg: "text-success", ring: "ring-success/20" },
  warning: { bg: "bg-orange-500/10", fg: "text-orange-500", ring: "ring-orange-500/20" },
  danger: { bg: "bg-destructive/10", fg: "text-destructive", ring: "ring-destructive/20" },
  info: { bg: "bg-primary/10", fg: "text-primary", ring: "ring-primary/20" },
};

function MetricCard({ label, value, icon: Icon, trend, tone = "default", hint }: KpiCard) {
  const t = toneClasses[tone];
  return (
    <Card className="group relative overflow-hidden rounded-2xl border-border/60 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground truncate">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground tabular-nums">{value}</p>
          {hint && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{hint}</p>}
        </div>
        <div className={cn("h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ring-1", t.bg, t.ring)}>
          <Icon className={cn("h-5 w-5", t.fg)} />
        </div>
      </div>
      {typeof trend === "number" && (
        <div className="mt-3 flex items-center gap-1 text-[11px]">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
              trend >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            <TrendingUp className={cn("h-3 w-3", trend < 0 && "rotate-180")} />
            {trend >= 0 ? "+" : ""}
            {trend.toFixed(1)}%
          </span>
          <span className="text-muted-foreground">vs período anterior</span>
        </div>
      )}
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
  const cards: KpiCard[] = [
    { label: "Pacientes cadastrados", value: totalPatients, icon: Users, trend: 4.2, tone: "info" },
    ...(showProfessionals
      ? [{ label: "Profissionais", value: totalProfessionals, icon: UserCog, tone: "default" as const }]
      : []),
    { label: "Agendados hoje", value: kpis.total, icon: CalendarClock, trend: 2.1, tone: "info" },
    { label: "Confirmados", value: kpis.confirmed, icon: CheckCircle2, trend: 8.4, tone: "success" },
    { label: "Aguardando confirmação", value: kpis.scheduled, icon: CalendarCheck, tone: "warning" },
    { label: "Faltas do dia", value: kpis.missed, icon: AlertTriangle, trend: -1.6, tone: "warning" },
    { label: "Cancelamentos", value: kpis.cancelled, icon: XCircle, trend: -3.2, tone: "danger" },
    { label: "Tempo médio", value: `${kpis.avgDuration}min`, icon: Timer, tone: "default" },
    { label: "Taxa de comparecimento", value: `${kpis.attendanceRate.toFixed(0)}%`, icon: TrendingUp, trend: 1.4, tone: "success" },
    { label: "Taxa de confirmação", value: `${kpis.confirmationRate.toFixed(0)}%`, icon: CheckCircle2, trend: 0.9, tone: "info" },
    { label: "Faturamento do dia", value: fmtMoney(kpis.faturamentoDia), icon: DollarSign, tone: "success" },
    { label: "Faturamento do mês", value: fmtMoney(kpis.faturamentoMes), icon: Wallet, trend: 6.8, tone: "success" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {cards.map((c) => (
        <MetricCard key={c.label} {...c} />
      ))}
    </div>
  );
}
