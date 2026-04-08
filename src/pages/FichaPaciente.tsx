import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Phone, Mail, MessageCircle, Calendar, Clock, User, FileText, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollableChips } from "@/components/ScrollableChips";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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

// Mock data - would come from shared state/database
const mockPacientes: Paciente[] = [
  { id: "1", nome: "Maria Silva", celular: "(11) 99999-0001", nascimento: "1985-03-15", observacoes: "", ultimaConsulta: "20/03/2026", cpf: "12345678901", email: "maria@email.com", genero: "Feminino", ativo: true },
  { id: "2", nome: "João Santos", celular: "(11) 99999-0002", nascimento: "1990-07-22", observacoes: "Alérgico a dipirona", ultimaConsulta: "18/03/2026", cpf: "98765432100", genero: "Masculino", ativo: true },
  { id: "3", nome: "Ana Oliveira", celular: "(11) 99999-0003", nascimento: "1978-11-10", observacoes: "", ultimaConsulta: "15/03/2026", genero: "Feminino", ativo: false },
];

const mockHistory: HistoryItem[] = [
  { id: "h1", date: "2026-04-08", time: "09:00", type: "Consulta", professional: "Dr. João Silva", status: "confirmed", notes: "Paciente relatou dores de cabeça frequentes" },
  { id: "h2", date: "2026-03-20", time: "10:30", type: "Retorno", professional: "Dr. João Silva", status: "confirmed" },
  { id: "h3", date: "2026-03-05", time: "14:00", type: "Exame", professional: "Dra. Maria Santos", status: "confirmed", notes: "Hemograma completo - Resultados normais" },
  { id: "h4", date: "2026-02-15", time: "08:30", type: "Consulta", professional: "Dr. João Silva", status: "missed" },
  { id: "h5", date: "2026-01-20", time: "11:00", type: "Consulta", professional: "Dr. João Silva", status: "cancelled", notes: "Cancelado pelo paciente" },
];

const FichaPaciente = () => {
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
        <Button variant="outline" onClick={() => navigate("/dashboard/pacientes")}>
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

  // Filter history for this patient (in real app, filter by patient id)
  const patientHistory = mockHistory;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/pacientes")} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(paciente.nome)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate">{paciente.nome}</h2>
            <div className="flex items-center gap-2">
              <Badge variant={paciente.ativo !== false ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                {paciente.ativo !== false ? "Ativo" : "Inativo"}
              </Badge>
              {idade !== null && <span className="text-xs text-muted-foreground">{idade} anos</span>}
            </div>
          </div>
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
          onToggleStatus={() => setPaciente(prev => prev ? { ...prev, ativo: !prev.ativo } : prev)}
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
  paciente, idade, phoneDigits, whatsappLink, isClinic, onEdit, onToggleStatus,
}: {
  paciente: Paciente; idade: number | null; phoneDigits: string; whatsappLink: string; isClinic: boolean;
  onEdit: () => void; onToggleStatus: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-1" /> Editar
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{paciente.ativo !== false ? "Ativo" : "Inativo"}</span>
          <Switch checked={paciente.ativo !== false} onCheckedChange={onToggleStatus} className="scale-90" />
        </div>
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

export default FichaPaciente;
