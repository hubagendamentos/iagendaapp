import { useState } from "react";
import { Search, Plus, Phone, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
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

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">CPF</TableHead>
              <TableHead>Celular</TableHead>
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead className="hidden sm:table-cell">Idade</TableHead>
              <TableHead className="hidden lg:table-cell">Gênero</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Nenhum paciente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const idade = calcIdade(p.nascimento);
                return (
                  <TableRow key={p.id} className="cursor-pointer" onClick={() => openEdit(p)}>
                    <TableCell className="font-medium">{p.nome}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {p.cpf ? applyCpfCnpjMask(p.cpf) : "—"}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" /> {applyPhoneMask(p.celular.replace(/\D/g, ""))}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {p.email || "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {idade !== null ? `${idade} anos` : "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {p.genero || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.ativo !== false ? "default" : "secondary"}>
                        {p.ativo !== false ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(p); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
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
