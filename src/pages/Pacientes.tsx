import { useState } from "react";
import { Search, Plus, Phone, Mail, Edit2, MessageCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PacienteModal, type Paciente } from "@/components/PacienteModal";
import { applyPhoneMask } from "@/components/PhoneMaskInput";
import { applyCpfCnpjMask } from "@/components/CpfCnpjMaskInput";

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
  { id: "1", nome: "Maria Silva", celular: "(11) 99999-0001", nascimento: "1985-03-15", observacoes: "", ultimaConsulta: "20/03/2026", cpf: "12345678901", email: "maria@email.com", genero: "Feminino", ativo: true },
  { id: "2", nome: "João Santos", celular: "(11) 99999-0002", nascimento: "1990-07-22", observacoes: "Alérgico a dipirona", ultimaConsulta: "18/03/2026", cpf: "98765432100", genero: "Masculino", ativo: true },
  { id: "3", nome: "Ana Oliveira", celular: "(11) 99999-0003", nascimento: "1978-11-10", observacoes: "", ultimaConsulta: "15/03/2026", genero: "Feminino", ativo: false },
];

type StatusFilter = "todos" | "ativos" | "inativos";

const Pacientes = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>(initialPacientes);
  const [busca, setBusca] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Paciente | null>(null);

  const filtered = pacientes.filter((p) => {
    const buscaLower = busca.toLowerCase().replace(/\D/g, "");
    const buscaTexto = busca.toLowerCase();
    const matchNome = p.nome.toLowerCase().includes(buscaTexto);
    const matchCelular = p.celular.includes(busca);
    const cpfDigits = (p.cpf || "").replace(/\D/g, "");
    const matchCpf = buscaLower.length > 0 ? cpfDigits.includes(buscaLower) : false;
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Pacientes</h2>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Novo Paciente
        </Button>
      </div>

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

      <div className="space-y-0">
        {/* Column headers - desktop only */}
        <div className="hidden md:grid md:grid-cols-[1fr_1fr_1fr_auto] gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Paciente</span>
          <span>Contato</span>
          <span>Perfil</span>
          <span>Ações</span>
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
                className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer mb-2"
                onClick={() => openEdit(p)}
              >
                {/* Desktop: 4 columns */}
                <div className="hidden md:grid md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-center">
                  {/* Col 1 - Paciente */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {getInitials(p.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
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
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{applyPhoneMask(phoneDigits)}</span>
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-green-600 hover:text-green-700"
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

                  {/* Col 3 - Perfil */}
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {idade !== null && <p>{idade} anos</p>}
                    {p.genero && <p>{p.genero}</p>}
                    {idade === null && !p.genero && <p>—</p>}
                  </div>

                  {/* Col 4 - Ações */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={p.ativo !== false}
                      onCheckedChange={() => toggleAtivo(p)}
                      onClick={(e) => e.stopPropagation()}
                      className="scale-75"
                    />
                  </div>
                </div>

                {/* Mobile: stacked */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
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

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      {applyPhoneMask(phoneDigits)}
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-green-600"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    </span>
                    {p.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[180px]">{p.email}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {idade !== null && <span>{idade} anos</span>}
                      {p.genero && <span>{p.genero}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openEdit(p); }}>
                        <Edit2 className="h-4 w-4" />
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
