import { Card } from "@/components/ui/card";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PIE_COLORS = ["hsl(var(--success))", "hsl(var(--primary))", "hsl(var(--destructive))", "hsl(30 85% 55%)"];

const tooltipStyle = {
  contentStyle: {
    background: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
    fontSize: 12,
  },
};

function ChartCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`rounded-xl border-border/50 shadow-none p-4 animate-fade-in ${className}`}>
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
      </div>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children as any}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

interface Props {
  dailySeries: { date: string; agendados: number; confirmados: number; faltas: number; cancelados: number }[];
  statusPie: { name: string; value: number }[];
  byProfessional?: unknown;
  byHour?: unknown;
  revenueSeries?: unknown;
  avgTimeSeries?: unknown;
}

export function DashboardCharts({ dailySeries, statusPie }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <ChartCard title="Agendamentos da semana" description="Últimos 7 dias" className="lg:col-span-2">
        <LineChart data={dailySeries}>
          <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="agendados" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="confirmados" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartCard>

      <ChartCard title="Status dos atendimentos" description="Hoje">
        <PieChart>
          <Pie data={statusPie} dataKey="value" nameKey="name" innerRadius={52} outerRadius={84} paddingAngle={2} stroke="none">
            {statusPie.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ChartCard>
    </div>
  );
}