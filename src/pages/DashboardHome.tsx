import { Calendar, Users, UserCog, Clock, Plus, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";

const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700 border-green-200",
  scheduled: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  missed: "bg-orange-100 text-orange-700 border-orange-200",
};

const statusLabels: Record<string, string> = {
  confirmed: "Confirmado",
  scheduled: "Agendado",
  cancelled: "Cancelado",
  missed: "Faltou",
};

const upcomingAppointments = [
  { id: "1", patientName: "Ana Oliveira", time: "09:00", professional: "Dr. João Silva", status: "confirmed", type: "Consulta" },
  { id: "2", patientName: "Carlos Mendes", time: "10:00", professional: "Dr. João Silva", status: "scheduled", type: "Retorno" },
  { id: "3", patientName: "Roberto Alves", time: "11:00", professional: "Dra. Maria Santos", status: "confirmed", type: "Exame" },
  { id: "4", patientName: "Fernanda Lima", time: "14:00", professional: "Dr. Pedro Lima", status: "scheduled", type: "Consulta" },
  { id: "5", patientName: "Patrícia Souza", time: "15:30", professional: "Dr. Pedro Lima", status: "scheduled", type: "Procedimento" },
];

const DashboardHome = () => {
  const { userType } = useUser();
  const navigate = useNavigate();

  const stats = [
    { label: "Agendamentos Hoje", value: "12", icon: Calendar, show: true },
    { label: "Pacientes Cadastrados", value: "248", icon: Users, show: true },
    { label: "Profissionais", value: "8", icon: UserCog, show: userType === "clinic" },
    { label: "Próxima Consulta", value: "09:00", icon: Clock, show: true },
  ].filter((s) => s.show);

  const visibleAppointments = userType === "professional"
    ? upcomingAppointments.filter((a) => a.professional === "Dr. João Silva")
    : upcomingAppointments;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Bem-vindo de volta!</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {userType === "clinic" ? "Aqui está o resumo da sua clínica." : "Aqui está o resumo do seu dia."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate("/dashboard/agenda")} variant="outline" className="gap-1.5">
            <Calendar className="h-4 w-4" />
            Ver Agenda
          </Button>
          <Button size="sm" onClick={() => navigate("/dashboard/agenda")} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${userType === "clinic" ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4`}>
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="h-11 w-11 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <stat.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Próximos Atendimentos</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/agenda")} className="gap-1 text-xs text-muted-foreground">
            Ver todos <ArrowRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {visibleAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between gap-3 px-6 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-accent-foreground">
                      {apt.patientName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{apt.patientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {apt.time} · {apt.type}
                      {userType === "clinic" && ` · ${apt.professional}`}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={`shrink-0 text-[10px] ${statusColors[apt.status]}`}>
                  {statusLabels[apt.status]}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
