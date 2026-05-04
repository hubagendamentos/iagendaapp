import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Mail, Pencil, MessageCircle, FileText, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PacienteModal, type Paciente } from "@/components/PacienteModal";
import { applyPhoneMask } from "@/components/PhoneMaskInput";
import { applyCpfCnpjMask } from "@/components/CpfCnpjMaskInput";
import { PageHeader } from "@/components/ui/page-header";

function calcIdade(nascimento: string): number | null {
  if (!nascimento) return null;
  const today = new Date();
  const birth = new Date(nascimento);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

const initialPacientes: Paciente[] = [
  { id: "1", nome: "Claudinei balboena", celular: "(55) 99188-4330", nascimento: "1993-06-01", observacoes: "", ultimaConsulta: "20/03/2026", cpf: "12345678901", email: "balboena47@gmail.com", genero: "Masculino", ativo: true },
  { id: "1", nome: "Maria Silva", celular: "(11) 99999-0001", nascimento: "1985-03-15", observacoes: "", ultimaConsulta: "20/03/2026", cpf: "12345678901", email: "maria@email.com", genero: "Feminino", ativo: true },
  { id: "2", nome: "João Santos", celular: "(11) 99999-0002", nascimento: "1990-07-22", observacoes: "Alérgico a dipirona", ultimaConsulta: "18/03/2026", cpf: "98765432100", genero: "Masculino", ativo: true },
  { id: "3", nome: "Ana Oliveira", celular: "(11) 99999-0003", nascimento: "1978-11-10", observacoes: "", ultimaConsulta: "15/03/2026", genero: "Feminino", ativo: false },
];

type StatusFilter = "todos" | "ativos" | "inativos";

const Pacientes = () => {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<Paciente[]>(initialPacientes);
  const [busca, setBusca] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Paciente | null>(null);

  const filtered = pacientes.filter((p) => {
    const buscaDigitos = busca.replace(/\D/g, "");
    const buscaTexto = busca.toLowerCase();

    const matchNome = buscaTexto !== "" ? p.nome.toLowerCase().includes(buscaTexto) : false;
    const matchCelular = buscaDigitos.length > 0 ? p.celular.replace(/\D/g, "").includes(buscaDigitos) : false;
    const matchCpf = buscaDigitos.length > 0 ? (p.cpf || "").replace(/\D/g, "").includes(buscaDigitos) : false;

    const matchBusca = busca === "" || matchNome || matchCelular || matchCpf;
    const matchStatus =
      statusFilter === "todos" ||
      (statusFilter === "ativos" && p.ativo !== false) ||
      (statusFilter === "inativos" && p.ativo === false);
    return matchBusca && matchStatus;
  });

  const handleSave = (data: Paciente) => {
    if (data.id) {
      setPacientes((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    } else {
      setPacientes((prev) => [...prev, { ...data, id: crypto.randomUUID(), ultimaConsulta: "—" }]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const toggleAtivo = (paciente: Paciente) => {
    setPacientes((prev) =>
      prev.map((p) => (p.id === paciente.id ? { ...p, ativo: !p.ativo } : p))
    );
  };

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: Paciente) => { setEditing(p); setModalOpen(true); };

  const statusFilters: { label: string; value: StatusFilter }[] = [
    { label: "Todos", value: "todos" },
    { label: "Ativos", value: "ativos" },
    { label: "Inativos", value: "inativos" },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        title="Pacientes"
        subtitle="Cadastre e gerencie as informações dos pacientes."
        actions={
          <Button onClick={openNew} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Novo Paciente
          </Button>
        }
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {statusFilters.map((f) => (
            <Button
              key={f.value}
              variant={statusFilter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {/* Column headers - desktop only */}
        <div className="hidden md:grid md:grid-cols-[2fr_1.5fr_1fr_160px] gap-6 px-5 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b">
          <span>Paciente</span>
          <span>Contato</span>
          <span>Perfil</span>
          <span className="text-center">Ações</span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            Nenhum paciente encontrado.
          </div>
        ) : (
          filtered.map((p) => {
            const idade = calcIdade(p.nascimento);
            const phoneDigits = p.celular.replace(/\D/g, "");
            const whatsappLink = `https://wa.me/55${phoneDigits}`;

            return (
              <div
                key={p.id}
                className="rounded-lg border bg-card p-4 md:px-5 md:py-3.5 hover:shadow-md transition-shadow"
              >
                {/* Desktop: 4 columns - matching header grid */}
                <div className="hidden md:grid md:grid-cols-[2fr_1.5fr_1fr_160px] gap-6 items-center">
                  {/* Col 1 - Paciente */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {getInitials(p.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{p.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.cpf ? applyCpfCnpjMask(p.cpf) : "CPF não informado"}
                      </p>
                      <Badge variant={p.ativo !== false ? "default" : "secondary"} className="mt-1 text-[10px] px-1.5 py-0">
                        {p.ativo !== false ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>

                  {/* Col 2 - Contato */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{applyPhoneMask(phoneDigits)}</span>
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    {p.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{p.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Col 3 - Perfil */}
                  <div className="space-y-0.5 text-sm text-muted-foreground">
                    {idade !== null && <p>{idade} anos</p>}
                    {p.genero && <p>{p.genero}</p>}
                    {idade === null && !p.genero && <p>—</p>}
                  </div>

                  {/* Col 4 - Ações */}
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full shrink-0"
                      onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/paciente/${p.id}`); }}
                      title="Ver ficha"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full shrink-0"
                      onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                      title="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Switch
                      checked={p.ativo !== false}
                      onCheckedChange={() => toggleAtivo(p)}
                      onClick={(e) => e.stopPropagation()}
                      className="scale-75"
                    />
                  </div>
                </div>

                {/* Mobile: stacked blocks */}
                <div className="md:hidden space-y-3">
                  {/* Row 1: Avatar + Name + Status */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {getInitials(p.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground truncate">{p.nome}</p>
                        <Badge variant={p.ativo !== false ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 shrink-0">
                          {p.ativo !== false ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      {p.cpf && (
                        <p className="text-xs text-muted-foreground">{applyCpfCnpjMask(p.cpf)}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Contact */}
                  <div className="space-y-1.5 pl-[52px]">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{applyPhoneMask(phoneDigits)}</span>
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    {p.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{p.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Row 3: Profile + Actions */}
                  <div className="flex items-center justify-between pl-[52px]">
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {idade !== null && <span>{idade} anos</span>}
                      {p.genero && <span>{p.genero}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full shrink-0"
                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/paciente/${p.id}`); }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full shrink-0"
                        onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Switch
                        checked={p.ativo !== false}
                        onCheckedChange={() => toggleAtivo(p)}
                        onClick={(e) => e.stopPropagation()}
                        className="scale-75"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <PacienteModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        paciente={editing}
      />
    </div>
  );
};

export default Pacientes;
