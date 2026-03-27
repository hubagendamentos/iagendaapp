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

const initialPacientes: Paciente[] = [
  { id: "1", nome: "Maria Silva", celular: "(11) 99999-0001", nascimento: "1985-03-15", observacoes: "", ultimaConsulta: "20/03/2026" },
  { id: "2", nome: "João Santos", celular: "(11) 99999-0002", nascimento: "1990-07-22", observacoes: "Alérgico a dipirona", ultimaConsulta: "18/03/2026" },
  { id: "3", nome: "Ana Oliveira", celular: "(11) 99999-0003", nascimento: "1978-11-10", observacoes: "", ultimaConsulta: "15/03/2026" },
];

const Pacientes = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>(initialPacientes);
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Paciente | null>(null);

  const filtered = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.celular.includes(busca)
  );

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Pacientes</h2>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Novo Paciente
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar paciente..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Celular</TableHead>
              <TableHead>Última Consulta</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Nenhum paciente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id} className="cursor-pointer" onClick={() => openEdit(p)}>
                  <TableCell className="font-medium">{p.nome}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3 w-3" /> {applyPhoneMask(p.celular.replace(/\D/g, ""))}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{p.ultimaConsulta}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(p); }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
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
