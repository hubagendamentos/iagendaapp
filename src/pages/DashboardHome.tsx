import { Calendar, Users, UserCog, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";

const DashboardHome = () => {
  const { userType } = useUser();

  const stats = [
    { label: "Consultas Hoje", value: "12", icon: Calendar, show: true },
    { label: "Pacientes", value: "248", icon: Users, show: true },
    { label: "Profissionais", value: "8", icon: UserCog, show: userType === "clinic" },
    { label: "Próxima Consulta", value: "14:30", icon: Clock, show: true },
  ].filter((s) => s.show);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Bem-vindo de volta!</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {userType === "clinic" ? "Aqui está o resumo da sua clínica." : "Aqui está o resumo do seu dia."}
        </p>
      </div>

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
    </div>
  );
};

export default DashboardHome;
