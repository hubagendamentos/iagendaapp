import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Phone, Mail, MessageCircle, Calendar, Clock, User, FileText, Plus, MapPin, Activity, CalendarX2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollableChips } from "@/components/ScrollableChips";
import { applyCpfCnpjMask } from "@/components/CpfCnpjMaskInput";
import { applyPhoneMask } from "@/components/PhoneMaskInput";
import { PacienteModal, type Paciente } from "@/components/PacienteModal";
import { useUser } from "@/contexts/UserContext";

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

function calcIdade(nascimento: string): number | null {
  if (!nascimento) return null;
  const today = new Date();
  const birth = new Date(nascimento);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

type AppointmentStatus = "scheduled" | "confirmed" | "cancelled" | "missed";

interface HistoryItem {
  id: string;
  date: string;
  time: string;
  type: string;
  professional: string;
  status: AppointmentStatus;
  notes?: string;
}

interface Observation {
  id: string;
  text: string;
  date: string;
}

const statusConfig: Record<AppointmentStatus, { label: string; dotClass: string; badgeBg: string; badgeText: string }> = {
  scheduled: { label: "Agendado", dotClass: "bg-status-scheduled", badgeBg: "bg-muted", badgeText: "text-muted-foreground" },
  confirmed: { label: "Confirmado", dotClass: "bg-status-confirmed", badgeBg: "bg-[hsl(var(--status-confirmed)/0.15)]", badgeText: "text-[hsl(var(--status-confirmed))]" },
  cancelled: { label: "Cancelado", dotClass: "bg-status-cancelled", badgeBg: "bg-[hsl(var(--status-cancelled)/0.15)]", badgeText: "text-[hsl(var(--status-cancelled))]" },
  missed: { label: "Faltou", dotClass: "bg-status-missed", badgeBg: "bg-[hsl(var(--status-missed)/0.15)]", badgeText: "text-[hsl(var(--status-missed))]" },
};

export const mockPacientes: Paciente[] = [
  { id: "1", nome: "Maria Silva", celular: "(11) 99999-0001", nascimento: "1985-03-15", observacoes: "", ultimaConsulta: "20/03/2026", cpf: "12345678901", email: "maria@email.com", genero: "Feminino", ativo: true },
  { id: "2", nome: "João Santos", celular: "(11) 99999-0002", nascimento: "1990-07-22", observacoes: "Alérgico a dipirona", ultimaConsulta: "18/03/2026", cpf: "98765432100", genero: "Masculino", ativo: true },
  { id: "3", nome: "Ana Oliveira", celular: "(11) 99999-0003", nascimento: "1978-11-10", observacoes: "", ultimaConsulta: "15/03/2026", genero: "Feminino", ativo: false },
];

export const mockHistory: HistoryItem[] = [
  { id: "h0", date: "2026-05-15", time: "14:00", type: "Consulta", professional: "Dr. João Silva", status: "scheduled" },
  { id: "h1", date: "2026-04-08", time: "09:00", type: "Consulta", professional: "Dr. João Silva", status: "confirmed", notes: "Paciente relatou dores de cabeça frequentes" },
  { id: "h2", date: "2026-03-20", time: "10:30", type: "Retorno", professional: "Dr. João Silva", status: "confirmed" },
  { id: "h3", date: "2026-03-05", time: "14:00", type: "Exame", professional: "Dra. Maria Santos", status: "confirmed", notes: "Hemograma completo - Resultados normais" },
  { id: "h4", date: "2026-02-15", time: "08:30", type: "Consulta", professional: "Dr. João Silva", status: "missed" },
  { id: "h5", date: "2026-01-20", time: "11:00", type: "Consulta", professional: "Dr. João Silva", status: "cancelled", notes: "Cancelado pelo paciente" },
];

export const FichaPacienteNormal = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userType } = useUser();
  const isClinic = userType === "clinic";

  const [paciente, setPaciente] = useState<Paciente | null>(
    mockPacientes.find(p => p.id === id) || null
  );
  const [activeTab, setActiveTab] = useState("dados");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [observations, setObservations] = useState<Observation[]>([
    { id: "o1", text: "Paciente com histórico de hipertensão na família.", date: "2026-03-20" },
    { id: "o2", text: "Preferência por horários matutinos.", date: "2026-02-10" },
  ]);
  const [newObservation, setNewObservation] = useState("");

  if (!paciente) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground">Paciente não encontrado.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/ficha-paciente")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const idade = calcIdade(paciente.nascimento);
  const phoneDigits = paciente.celular.replace(/\D/g, "");
  const whatsappLink = `https://wa.me/55${phoneDigits}`;

  const tabs = [
    { id: "dados", label: "Dados" },
    { id: "historico", label: "Histórico" },
    { id: "observacoes", label: "Observações" },
  ];

  const handleSaveEdit = (data: Paciente) => {
    setPaciente(data);
    setEditModalOpen(false);
  };

  const handleAddObservation = () => {
    if (!newObservation.trim()) return;
    const obs: Observation = {
      id: crypto.randomUUID(),
      text: newObservation.trim(),
      date: format(new Date(), "yyyy-MM-dd"),
    };
    setObservations(prev => [obs, ...prev]);
    setNewObservation("");
  };

  const patientHistory = mockHistory;

  const nextAppt = patientHistory.find(h => h.status === "scheduled");
  const lastAppt = patientHistory.find(h => h.status === "confirmed");
  const totalAppts = patientHistory.filter(h => h.status === "confirmed" || h.status === "missed").length;
  const missedAppts = patientHistory.filter(h => h.status === "missed").length;

  return (
    <div className="space-y-6 pb-6">
      {/* Header and Summary */}
      <div className="space-y-6">
        {/* Main Info */}
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard/ficha-paciente")} className="shrink-0 mt-2 hidden sm:flex">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 md:gap-4 mb-2">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/ficha-paciente")} className="shrink-0 -ml-2 sm:hidden">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 border-2 border-primary/10 shadow-sm">
                <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                  {getInitials(paciente.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate tracking-tight">{paciente.nome}</h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1 sm:mt-1.5 text-sm text-muted-foreground">
                  <Badge variant={paciente.ativo !== false ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 sm:mr-1">
                    {paciente.ativo !== false ? "Ativo" : "Inativo"}
                  </Badge>
                  <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {applyPhoneMask(phoneDigits)}</span>
                  <span className="hidden sm:inline text-muted-foreground/50">•</span>
                  <span>{idade !== null ? `${idade} anos` : "Idade N/A"}</span>
                  {paciente.genero && (
                    <>
                      <span className="hidden sm:inline text-muted-foreground/50">•</span>
                      <span>{paciente.genero}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="relative -mx-5 px-5 sm:mx-0 sm:px-0">
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory pt-1 px-1 -mx-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            {/* Card: Próximo Atendimento */}
            <div className="shrink-0 w-[240px] sm:w-auto sm:flex-1 p-4 rounded-xl border bg-card flex flex-col justify-between snap-start shadow-sm hover:shadow transition-shadow">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-400 shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <p className="text-[13px] font-bold text-muted-foreground whitespace-nowrap">Próximo atendimento</p>
                </div>
                {nextAppt ? (
                  <p className="text-xl sm:text-2xl font-bold text-foreground truncate">{format(new Date(nextAppt.date + "T12:00:00"), "dd/MM/yyyy")} às {nextAppt.time}</p>
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-foreground">—</p>
                )}
              </div>
              <div className="mt-2">
                {nextAppt ? (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[nextAppt.status].dotClass} shrink-0`} />
                    {statusConfig[nextAppt.status].label}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Nenhum agendado</p>
                )}
              </div>
            </div>

            {/* Card: Total de Atendimentos */}
            <div className="shrink-0 w-[240px] sm:w-auto sm:flex-1 p-4 rounded-xl border bg-card flex flex-col justify-between snap-start shadow-sm hover:shadow transition-shadow">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center dark:bg-emerald-900/30 dark:text-emerald-400 shrink-0">
                    <Activity className="h-4 w-4" />
                  </div>
                  <p className="text-[13px] font-bold text-muted-foreground whitespace-nowrap">Total de atendimentos</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground truncate">{totalAppts}</p>
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground truncate">Registros no histórico</p>
              </div>
            </div>

            {/* Card: Faltas */}
            <div className="shrink-0 w-[240px] sm:w-auto sm:flex-1 p-4 rounded-xl border bg-card flex flex-col justify-between snap-start shadow-sm hover:shadow transition-shadow">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center dark:bg-rose-900/30 dark:text-rose-400 shrink-0">
                     <CalendarX2 className="h-4 w-4" />
                  </div>
                  <p className="text-[13px] font-bold text-muted-foreground whitespace-nowrap">Faltas</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground truncate">{missedAppts}</p>
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground truncate">Ausências registradas</p>
              </div>
            </div>

            {/* Card: Último Atendimento */}
            <div className="shrink-0 w-[240px] sm:w-auto sm:flex-1 p-4 rounded-xl border bg-card flex flex-col justify-between snap-start shadow-sm hover:shadow transition-shadow">
               <div>
                 <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center dark:bg-indigo-900/30 dark:text-indigo-400 shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <p className="text-[13px] font-bold text-muted-foreground whitespace-nowrap">Último atendimento</p>
                </div>
                {lastAppt ? (
                  <p className="text-xl sm:text-2xl font-bold text-foreground truncate">{format(new Date(lastAppt.date + "T12:00:00"), "dd/MM/yyyy")}</p>
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-foreground">—</p>
                )}
              </div>
              <div className="mt-2">
                {lastAppt ? (
                  <p className="text-xs text-muted-foreground truncate">{lastAppt.type}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Sem histórico</p>
                )}
              </div>
            </div>

          </div>
          {/* Fade lateral (Mobile only) */}
          <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden" />
        </div>
      </div>

      {/* Tabs */}
      <ScrollableChips
        items={tabs}
        selectedId={activeTab}
        onSelect={setActiveTab}
      />

      {/* Tab Content */}
      {activeTab === "dados" && (
        <TabDados
          paciente={paciente}
          idade={idade}
          phoneDigits={phoneDigits}
          whatsappLink={whatsappLink}
          isClinic={isClinic}
          onEdit={() => setEditModalOpen(true)}
        />
      )}

      {activeTab === "historico" && (
        <TabHistorico history={patientHistory} isClinic={isClinic} />
      )}

      {activeTab === "observacoes" && (
        <TabObservacoes
          observations={observations}
          newObservation={newObservation}
          onNewObservationChange={setNewObservation}
          onAdd={handleAddObservation}
        />
      )}

      <PacienteModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveEdit}
        paciente={paciente}
      />
    </div>
  );
};

/* ─── Tab: Dados ─── */
function TabDados({
  paciente, idade, phoneDigits, whatsappLink, isClinic, onEdit,
}: {
  paciente: Paciente; idade: number | null; phoneDigits: string; whatsappLink: string; isClinic: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-1" /> Editar
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Personal Info */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Informações Pessoais
          </h3>
          <div className="space-y-2 text-sm">
            <InfoRow label="Nome" value={paciente.nome} />
            <InfoRow label="CPF" value={paciente.cpf ? applyCpfCnpjMask(paciente.cpf) : "Não informado"} />
            <InfoRow label="Gênero" value={paciente.genero || "Não informado"} />
            <InfoRow label="Idade" value={idade !== null ? `${idade} anos` : "Não informado"} />
            <InfoRow label="Nascimento" value={paciente.nascimento ? format(new Date(paciente.nascimento), "dd/MM/yyyy") : "Não informado"} />
          </div>
        </div>

        {/* Contact Info */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" /> Contato
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-muted-foreground">Telefone: </span>
                <span className="text-foreground">{applyPhoneMask(phoneDigits)}</span>
              </div>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </a>
            </div>
            <InfoRow label="Email" value={paciente.email || "Não informado"} />
          </div>
        </div>
      </div>

      {/* Address Info */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" /> Endereço
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
          <InfoRow label="Rua/Av" value={paciente.endereco ? `${paciente.endereco}${paciente.numero ? `, ${paciente.numero}` : ""}` : "Não informado"} />
          <InfoRow label="Bairro" value={paciente.bairro || "Não informado"} />
          <InfoRow label="Cidade/UF" value={paciente.cidade ? `${paciente.cidade}${paciente.uf ? ` - ${paciente.uf}` : ""}` : "Não informado"} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

/* ─── Tab: Histórico ─── */
function TabHistorico({ history, isClinic }: { history: HistoryItem[]; isClinic: boolean }) {
  if (history.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Nenhum atendimento registrado.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((item) => {
        const sc = statusConfig[item.status];
        const dateFormatted = format(new Date(item.date + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR });

        return (
          <div key={item.id} className="rounded-lg border bg-card p-4 border-l-4 border-l-transparent" style={{ borderLeftColor: `hsl(var(--status-${item.status}))` }}>
            {/* Line 1: Date + Status */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium text-foreground">{dateFormatted}</span>
                <span className="text-muted-foreground">•</span>
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{item.time}</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${sc.badgeBg} ${sc.badgeText}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dotClass}`} />
                {sc.label}
              </span>
            </div>

            {/* Line 2: Type + Professional */}
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="text-xs">{item.type}</Badge>
              {isClinic && <span className="text-muted-foreground text-xs">• {item.professional}</span>}
            </div>

            {/* Line 3: Notes */}
            {item.notes && (
              <p className="text-xs text-muted-foreground mt-2 pl-0.5">{item.notes}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Tab: Observações ─── */
function TabObservacoes({
  observations, newObservation, onNewObservationChange, onAdd,
}: {
  observations: Observation[]; newObservation: string; onNewObservationChange: (v: string) => void; onAdd: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Add new */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" /> Nova Observação
        </h3>
        <Textarea
          placeholder="Adicionar uma observação sobre o paciente..."
          value={newObservation}
          onChange={(e) => onNewObservationChange(e.target.value)}
          className="min-h-[80px]"
        />
        <Button size="sm" onClick={onAdd} disabled={!newObservation.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </div>

      {/* List */}
      {observations.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Nenhuma observação registrada.
        </div>
      ) : (
        <div className="space-y-2">
          {observations.map((obs) => (
            <div key={obs.id} className="rounded-lg border bg-card p-4">
              <p className="text-sm text-foreground">{obs.text}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {format(new Date(obs.date + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
