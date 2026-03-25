import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";
import { useUser, type UserType } from "@/contexts/UserContext";

const Login = () => {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedType, setSelectedType] = useState<UserType>("clinic");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regType, setRegType] = useState<UserType>("clinic");

  const navigate = useNavigate();
  const { setUserType } = useUser();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setUserType(selectedType);
    navigate("/dashboard");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setUserType(regType);
    navigate("/dashboard");
  };

  const TypeSelector = ({ value, onChange }: { value: UserType; onChange: (v: UserType) => void }) => (
    <div className="flex rounded-lg bg-muted p-1">
      <button
        type="button"
        onClick={() => onChange("clinic")}
        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
          value === "clinic"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Sou Clínica
      </button>
      <button
        type="button"
        onClick={() => onChange("professional")}
        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
          value === "professional"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Sou Profissional
      </button>
    </div>
  );

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
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="login" className="flex-1">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="flex-1">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-0">
              <form onSubmit={handleLogin} className="space-y-4">
                <TypeSelector value={selectedType} onChange={setSelectedType} />
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input id="login-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full">Entrar</Button>
                <div className="text-center space-y-2">
                  <button type="button" className="text-sm text-primary hover:underline">Esqueci minha senha</button>
                  <p className="text-sm text-muted-foreground">
                    Não tenho uma conta{" "}
                    <button type="button" onClick={() => setTab("register")} className="text-primary font-medium hover:underline">
                      Criar agora
                    </button>
                  </p>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-0">
              <form onSubmit={handleRegister} className="space-y-4">
                <TypeSelector value={regType} onChange={setRegType} />
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Nome</Label>
                  <Input id="reg-name" placeholder="Seu nome completo" value={regName} onChange={(e) => setRegName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" type="email" placeholder="seu@email.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Telefone</Label>
                  <Input id="reg-phone" type="tel" placeholder="(11) 99999-9999" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Senha</Label>
                  <Input id="reg-password" type="password" placeholder="••••••••" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm">Confirmar Senha</Label>
                  <Input id="reg-confirm" type="password" placeholder="••••••••" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full">Criar Conta</Button>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Já tenho uma conta{" "}
                    <button type="button" onClick={() => setTab("login")} className="text-primary font-medium hover:underline">
                      Fazer login
                    </button>
                  </p>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
