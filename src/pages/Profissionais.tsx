import { useState } from "react";
import { Plus, Edit2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ProfissionalModal, type Profissional } from "@/components/ProfissionalModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { applyPhoneMask } from "@/components/PhoneMaskInput";

const initialProfissionais: Profissional[] = [
  { id: "1", nome: "Dr. João Silva", crm: "CRM/SP 123456", telefone: "11988887777", especialidade: "Clínico Geral", ativo: true },
  { id: "2", nome: "Dra. Ana Costa", crm: "CRM/SP 654321", telefone: "11977776666", especialidade: "Dermatologia", ativo: true },
  { id: "3", nome: "Dr. Carlos Lima", crm: "CRM/SP 111222", telefone: "11966665555", especialidade: "Ortopedia", ativo: false },
];

const Profissionais = () => {
  const [profissionais, setProfissionais] = useState<Profissional[]>(initialProfissionais);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Profissional | null>(null);
  const [busca, setBusca] = useState("");

  const filtered = profissionais.filter((p) => {
    const q = busca.toLowerCase();
    return p.nome.toLowerCase().includes(q) ||
      p.crm.toLowerCase().includes(q) ||
      p.especialidade.toLowerCase().includes(q);
  });

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

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar profissional..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profissional</TableHead>
              <TableHead className="hidden sm:table-cell">CRM</TableHead>
              <TableHead className="hidden sm:table-cell">Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      {p.foto ? (
                        <AvatarImage src={p.foto} alt={p.nome} />
                      ) : (
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                          {p.nome.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{p.nome}</p>
                      <p className="text-xs text-muted-foreground">{p.especialidade}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{p.crm}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{applyPhoneMask(p.telefone)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={p.ativo} onCheckedChange={() => toggleAtivo(p.id!)} />
                    <Badge variant={p.ativo ? "default" : "secondary"} className="hidden sm:inline-flex">
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
