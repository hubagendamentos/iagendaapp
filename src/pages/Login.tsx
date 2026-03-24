import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useUser, type UserType } from "@/contexts/UserContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedType, setSelectedType] = useState<UserType>("clinic");
  const navigate = useNavigate();
  const { setUserType } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserType(selectedType);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Calendar className="h-8 w-8" />
            <span className="text-2xl font-bold tracking-tight">ClinicaHub</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Sistema de agendamento para clínicas e profissionais
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="flex rounded-lg bg-muted p-1 mb-6">
            <button
              type="button"
              onClick={() => setSelectedType("clinic")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                selectedType === "clinic"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sou Clínica
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("professional")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                selectedType === "professional"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sou Profissional
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">Entrar</Button>
            <div className="text-center">
              <button type="button" className="text-sm text-primary hover:underline">Esqueci minha senha</button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
