import { Card } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
    <Card className={`rounded-2xl border-border/60 shadow-sm p-4 animate-fade-in ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
      </div>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children as any}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

const tooltipStyle = {
  contentStyle: {
    background: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
    fontSize: 12,
  },
};

interface Props {
  dailySeries: { date: string; agendados: number; confirmados: number; faltas: number; cancelados: number }[];
  statusPie: { name: string; value: number }[];
  byProfessional: { name: string; atendimentos: number }[];
  byHour: { hora: string; total: number }[];
  revenueSeries: { mes: string; valor: number }[];
  avgTimeSeries: { date: string; minutos: number }[];
}

export function DashboardCharts({
  dailySeries,
  statusPie,
  byProfessional,
  byHour,
  revenueSeries,
  avgTimeSeries,
}: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
      <ChartCard title="Agendamentos por dia" description="Últimos 7 dias" className="xl:col-span-2">
        <LineChart data={dailySeries}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="agendados" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="confirmados" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ChartCard>

      <ChartCard title="Status dos atendimentos" description="Hoje">
        <PieChart>
          <Pie data={statusPie} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={3}>
            {statusPie.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ChartCard>

      <ChartCard title="Comparecimento × Faltas" description="Últimos 7 dias">
        <BarChart data={dailySeries}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="confirmados" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} />
          <Bar dataKey="faltas" fill="hsl(30 85% 55%)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="cancelados" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Atendimentos por profissional" description="Hoje">
        <BarChart data={byProfessional} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} stroke="hsl(var(--muted-foreground))" />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="atendimentos" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Horários mais movimentados" description="Volume por horário">
        <BarChart data={byHour}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="hora" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Faturamento" description="Evolução mensal" className="xl:col-span-2">
        <AreaChart data={revenueSeries}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip {...tooltipStyle} formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
          <Area type="monotone" dataKey="valor" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revGrad)" />
        </AreaChart>
      </ChartCard>

      <ChartCard title="Tempo médio de atendimento" description="Em minutos">
        <LineChart data={avgTimeSeries}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip {...tooltipStyle} />
          <Line type="monotone" dataKey="minutos" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ChartCard>
    </div>
  );
}
