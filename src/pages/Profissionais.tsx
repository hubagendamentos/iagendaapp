import { useState } from "react";
import { Plus, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ProfissionalModal, type Profissional } from "@/components/ProfissionalModal";

const initialProfissionais: Profissional[] = [
  { id: "1", nome: "Dr. João Silva", especialidade: "Clínico Geral", ativo: true },
  { id: "2", nome: "Dra. Ana Costa", especialidade: "Dermatologia", ativo: true },
  { id: "3", nome: "Dr. Carlos Lima", especialidade: "Ortopedia", ativo: false },
];

const Profissionais = () => {
  const [profissionais, setProfissionais] = useState<Profissional[]>(initialProfissionais);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Profissional | null>(null);

  const toggleAtivo = (id: string) => {
    setProfissionais((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p))
    );
  };

  const handleSave = (data: Profissional) => {
    if (data.id) {
      setProfissionais((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    } else {
      setProfissionais((prev) => [...prev, { ...data, id: crypto.randomUUID() }]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: Profissional) => { setEditing(p); setModalOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Profissionais</h2>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Novo Profissional
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profissionais.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.nome}</TableCell>
                <TableCell>{p.especialidade}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={p.ativo} onCheckedChange={() => toggleAtivo(p.id!)} />
                    <Badge variant={p.ativo ? "default" : "secondary"}>
                      {p.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ProfissionalModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        profissional={editing}
      />
    </div>
  );
};

export default Profissionais;
