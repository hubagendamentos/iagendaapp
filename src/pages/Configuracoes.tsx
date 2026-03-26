import { useState, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneMaskInput } from "@/components/PhoneMaskInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, User, Clock, CreditCard, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

const weekDays = [
  { key: "mon", label: "Segunda" },
  { key: "tue", label: "Terça" },
  { key: "wed", label: "Quarta" },
  { key: "thu", label: "Quinta" },
  { key: "fri", label: "Sexta" },
  { key: "sat", label: "Sábado" },
  { key: "sun", label: "Domingo" },
];

const specialties = [
  "Clínico Geral", "Cardiologia", "Dermatologia", "Ortopedia", "Pediatria",
  "Neurologia", "Ginecologia", "Oftalmologia", "Psiquiatria", "Endocrinologia",
];

interface InsurancePlan {
  id: string;
  name: string;
  active: boolean;
}

const Configuracoes = () => {
  const { userType } = useUser();
  const isClinic = userType === "clinic";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Clinic data
  const [clinicName, setClinicName] = useState("Clínica Saúde Total");
  const [cnpj, setCnpj] = useState("12.345.678/0001-90");
  const [clinicPhone, setClinicPhone] = useState("11999998888");
  const [clinicEmail, setClinicEmail] = useState("contato@saudetotal.com");
  const [clinicAddress, setClinicAddress] = useState("Rua das Flores, 123 - São Paulo/SP");

  // Professional data
  const [profName, setProfName] = useState("Dr. João Silva");
  const [profCrm, setProfCrm] = useState("CRM/SP 123456");
  const [profPhone, setProfPhone] = useState("11988887777");
  const [profSpecialty, setProfSpecialty] = useState("Cardiologia");

  // Hours
  const [activeDays, setActiveDays] = useState<Record<string, boolean>>({
    mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false,
  });
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");
  const [interval, setInterval] = useState("30");

  // Insurance
  const [plans, setPlans] = useState<InsurancePlan[]>([
    { id: "1", name: "Unimed", active: true },
    { id: "2", name: "Bradesco Saúde", active: true },
    { id: "3", name: "SulAmérica", active: false },
  ]);
  const [newPlan, setNewPlan] = useState("");

  const toggleDay = (key: string) => setActiveDays((prev) => ({ ...prev, [key]: !prev[key] }));

  const addPlan = () => {
    if (!newPlan.trim()) return;
    setPlans((prev) => [...prev, { id: Date.now().toString(), name: newPlan.trim(), active: true }]);
    setNewPlan("");
    toast.success("Convênio adicionado");
  };

  const togglePlan = (id: string) =>
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));

  const removePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    toast.success("Convênio removido");
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
      toast.success("Foto atualizada");
    }
  };

  const handleSave = () => toast.success("Configurações salvas com sucesso!");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Configurações</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {isClinic ? "Gerencie os dados da sua clínica" : "Gerencie seus dados profissionais"}
        </p>
      </div>

      {/* === CLINIC / PROFESSIONAL DATA === */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            {isClinic ? <Building2 className="h-5 w-5 text-primary" /> : <User className="h-5 w-5 text-primary" />}
            {isClinic ? "Dados da Clínica" : "Dados do Profissional"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Photo upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <div className="flex items-center gap-4">
            <button type="button" onClick={handlePhotoClick} className="relative group cursor-pointer">
              <Avatar className="h-16 w-16">
                {photoPreview ? (
                  <AvatarImage src={photoPreview} alt="Foto" />
                ) : (
                  <AvatarFallback className="bg-accent text-accent-foreground text-lg">
                    {isClinic ? "CS" : "JS"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="h-5 w-5 text-white" />
              </div>
            </button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handlePhotoClick}>
              <Upload className="h-4 w-4" /> Alterar foto
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isClinic ? (
              <>
                <div className="space-y-2">
                  <Label>Nome da Clínica</Label>
                  <Input value={clinicName} onChange={(e) => setClinicName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <PhoneMaskInput value={clinicPhone} onChange={setClinicPhone} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={clinicEmail} onChange={(e) => setClinicEmail(e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Endereço</Label>
                  <Input value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={profName} onChange={(e) => setProfName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>CRM</Label>
                  <Input value={profCrm} onChange={(e) => setProfCrm(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <PhoneMaskInput value={profPhone} onChange={setProfPhone} />
                </div>
                <div className="space-y-2">
                  <Label>Especialidade</Label>
                  <Select value={profSpecialty} onValueChange={setProfSpecialty}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {specialties.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* === HOURS === */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-primary" />
            Horário de Atendimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {weekDays.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => toggleDay(d.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeDays[d.key]
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Hora Início</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hora Fim</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Intervalo (min)</Label>
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["15", "20", "30", "45", "60"].map((v) => (
                    <SelectItem key={v} value={v}>{v} min</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === INSURANCE PLANS === */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-5 w-5 text-primary" />
            Convênios / Planos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nome do convênio"
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPlan()}
              className="w-full"
            />
            <Button onClick={addPlan} size="sm" className="gap-1 shrink-0">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </div>
          <div className="space-y-2">
            {plans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <div className="flex items-center gap-3">
                  <Switch checked={plan.active} onCheckedChange={() => togglePlan(plan.id)} />
                  <span className={`text-sm ${plan.active ? "text-foreground" : "text-muted-foreground line-through"}`}>
                    {plan.name}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removePlan(plan.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pb-6">
        <Button onClick={handleSave} className="px-8">Salvar Configurações</Button>
      </div>
    </div>
  );
};

export default Configuracoes;
