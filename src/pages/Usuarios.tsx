import { useState } from "react";
import { Plus, Edit2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, type User, type UserRole } from "@/contexts/UserContext";
import { PermissoesUsuario } from "@/components/PermissoesUsuario";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  staff: "Recepcionista / Staff",
  professional: "Profissional"
};

export default function Usuarios() {
  const { usersList, addUser, updateUser, clinic } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<User> | null>(null);

  if (clinic?.type === "solo") {
    return <div className="p-6">Esta clínica não suporta múltiplos usuários.</div>;
  }

const getDefaultPermissions = (role: UserRole): Partial<UserPermissions> => {
  if (role === "admin") return {}; // Admin has all by default
  if (role === "staff") {
    return {
      agenda: true, atendimentos: true, pacientes: true,
      podeConfirmar: true, podeCancelar: true, podeMarcarFalta: true, podeIniciar: true
    };
  }
  if (role === "professional") {
    return {
      agenda: true, atendimentos: true,
      podeIniciar: true, podeFinalizar: true, podeEditarFicha: true
    };
  }
  return {};
};

  const openNew = () => {
    setEditing({ name: "", email: "", role: "staff", permissions: getDefaultPermissions("staff") });
    setModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditing({ ...u, permissions: u.permissions || {} });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!editing?.name || !editing?.email) return;

    if (editing.id) {
      updateUser(editing as User);
    } else {
      addUser({ ...editing, id: crypto.randomUUID(), clinicId: clinic!.id } as User);
    }
    setModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">Gerencie o acesso da sua equipe ao sistema.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> Novo Usuário
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Nível de Acesso</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersList.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                    {roleLabels[u.role]}
                  </Badge>
                  {u.permissions && Object.keys(u.permissions).length > 0 && (
                    <Badge variant="outline" className="ml-2">Customizado</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="dados" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dados">Dados Básicos</TabsTrigger>
              <TabsTrigger value="permissoes">
                <Shield className="w-4 h-4 mr-2" /> Permissões
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dados" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input 
                  value={editing?.name || ""} 
                  onChange={e => setEditing(prev => ({ ...prev, name: e.target.value }))} 
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email" 
                  value={editing?.email || ""} 
                  onChange={e => setEditing(prev => ({ ...prev, email: e.target.value }))} 
                />
              </div>
              <div className="space-y-2">
                <Label>Nível de Acesso (Role)</Label>
                <Select 
                  value={editing?.role || "staff"} 
                  onValueChange={(val: UserRole) => setEditing(prev => ({ 
                    ...prev, 
                    role: val,
                    permissions: getDefaultPermissions(val) 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador (Acesso Total)</SelectItem>
                    <SelectItem value="staff">Staff (Recepção / Apoio)</SelectItem>
                    <SelectItem value="professional">Profissional (Médico / Dentista)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  O papel define as permissões padrão, que podem ser customizadas na aba Permissões.
                </p>
              </div>

              {editing?.role === "professional" && (
                <div className="space-y-2">
                  <Label>ID do Profissional Vinculado</Label>
                  <Input 
                    value={editing?.professionalId || ""} 
                    onChange={e => setEditing(prev => ({ ...prev, professionalId: e.target.value }))} 
                    placeholder="Ex: p1"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="permissoes" className="pt-4">
              <PermissoesUsuario 
                permissions={editing?.permissions || {}} 
                onChange={perms => setEditing(prev => ({ ...prev, permissions: perms }))}
                disabled={editing?.role === "admin"}
              />
              {editing?.role === "admin" && (
                <p className="text-sm text-amber-600 mt-4 bg-amber-50 p-3 rounded-md">
                  Administradores possuem acesso total ao sistema. Para restringir permissões, altere o papel do usuário.
                </p>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
