import { Calendar, Users, UserCog, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "Consultas Hoje", value: "12", icon: Calendar },
  { label: "Pacientes", value: "248", icon: Users },
  { label: "Profissionais", value: "8", icon: UserCog },
  { label: "Próxima Consulta", value: "14:30", icon: Clock },
];

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Bem-vindo de volta!</h2>
        <p className="text-muted-foreground mt-1">Aqui está o resumo de hoje.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="h-11 w-11 rounded-lg bg-accent flex items-center justify-center">
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
