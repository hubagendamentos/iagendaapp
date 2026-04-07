import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil } from "lucide-react";
import { toast } from "sonner";

// ---- Types ----
interface Plan {
  id: string;
  name: string;
  active: boolean;
}

interface Exam {
  id: string;
  name: string;
  description: string;
  preparationId: string | null;
  active: boolean;
}

interface Preparation {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface AppointmentType {
  id: string;
  name: string;
  active: boolean;
}

export interface Specialty {
  id: string;
  name: string;
  active: boolean;
}

// ---- Initial Data ----
const initialPlans: Plan[] = [
  { id: "1", name: "Unimed", active: true },
  { id: "2", name: "Bradesco Saúde", active: true },
  { id: "3", name: "SulAmérica", active: false },
];

const initialExams: Exam[] = [
  { id: "1", name: "Hemograma Completo", description: "Exame de sangue completo", preparationId: "1", active: true },
  { id: "2", name: "Raio-X Tórax", description: "", preparationId: null, active: true },
];

const initialPreparations: Preparation[] = [
  { id: "1", name: "Jejum 12h", description: "Jejum absoluto de 12 horas antes do exame", active: true },
  { id: "2", name: "Sem preparo", description: "Nenhum preparo necessário", active: true },
];

const initialAppointmentTypes: AppointmentType[] = [
  { id: "1", name: "Consulta", active: true },
  { id: "2", name: "Retorno", active: true },
  { id: "3", name: "Exame", active: true },
  { id: "4", name: "Procedimento", active: true },
  { id: "5", name: "Avaliação", active: true },
  { id: "6", name: "Urgência", active: true },
];

export const initialSpecialties: Specialty[] = [
  { id: "1", name: "Clínico Geral", active: true },
  { id: "2", name: "Cardiologia", active: true },
  { id: "3", name: "Dermatologia", active: true },
  { id: "4", name: "Ortopedia", active: true },
  { id: "5", name: "Pediatria", active: true },
  { id: "6", name: "Neurologia", active: true },
  { id: "7", name: "Ginecologia", active: true },
  { id: "8", name: "Oftalmologia", active: true },
  { id: "9", name: "Psiquiatria", active: true },
  { id: "10", name: "Endocrinologia", active: true },
];

// ============ Plan Modal ============
const PlanModal = ({ open, onClose, onSave, plan }: { open: boolean; onClose: () => void; onSave: (p: Omit<Plan, "id"> & { id?: string }) => void; plan: Plan | null }) => {
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (open) {
      if (plan) { setName(plan.name); setActive(plan.active); }
      else { setName(""); setActive(true); }
    }
  }, [open, plan]);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md !inset-0 !translate-x-0 !translate-y-0 !top-0 !left-0 sm:!inset-auto sm:!left-[50%] sm:!top-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] rounded-none sm:rounded-lg w-full sm:w-auto max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{plan ? "Editar Plano" : "Novo Plano"}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nome do plano</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Unimed" />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={active} onCheckedChange={setActive} />
            <Label>{active ? "Ativo" : "Inativo"}</Label>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button disabled={!name.trim()} onClick={() => { onSave({ id: plan?.id, name: name.trim(), active }); onClose(); }}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============ Preparation Modal ============
const PreparationModal = ({ open, onClose, onSave, preparation }: { open: boolean; onClose: () => void; onSave: (p: Omit<Preparation, "id"> & { id?: string }) => void; preparation: Preparation | null }) => {
  const [name, setName] = useState(preparation?.name || "");
  const [description, setDescription] = useState(preparation?.description || "");
  const [active, setActive] = useState(preparation?.active ?? true);

  useEffect(() => {
    if (open) {
      if (preparation) { setName(preparation.name); setDescription(preparation.description); setActive(preparation.active); }
      else { setName(""); setDescription(""); setActive(true); }
    }
  }, [open, preparation]);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md !inset-0 !translate-x-0 !translate-y-0 !top-0 !left-0 sm:!inset-auto sm:!left-[50%] sm:!top-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] rounded-none sm:rounded-lg w-full sm:w-auto max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{preparation ? "Editar Preparo" : "Novo Preparo"}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Jejum 12h" />
          </div>
          <div className="space-y-2">
            <Label>Descrição (opcional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o preparo..." rows={3} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={active} onCheckedChange={setActive} />
            <Label>{active ? "Ativo" : "Inativo"}</Label>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button disabled={!name.trim()} onClick={() => { onSave({ id: preparation?.id, name: name.trim(), description, active }); onClose(); }}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============ Exam Modal ============
const ExamModal = ({ open, onClose, onSave, exam, preparations }: { open: boolean; onClose: () => void; onSave: (e: Omit<Exam, "id"> & { id?: string }) => void; exam: Exam | null; preparations: Preparation[] }) => {
  const [name, setName] = useState(exam?.name || "");
  const [description, setDescription] = useState(exam?.description || "");
  const [preparationId, setPreparationId] = useState<string | null>(exam?.preparationId || null);
  const [active, setActive] = useState(exam?.active ?? true);

  useEffect(() => {
    if (open) {
      if (exam) { setName(exam.name); setDescription(exam.description); setPreparationId(exam.preparationId); setActive(exam.active); }
      else { setName(""); setDescription(""); setPreparationId(null); setActive(true); }
    }
  }, [open, exam]);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg !inset-0 !translate-x-0 !translate-y-0 !top-0 !left-0 sm:!inset-auto sm:!left-[50%] sm:!top-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] rounded-none sm:rounded-lg w-full sm:w-auto max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{exam ? "Editar Exame" : "Novo Exame"}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nome do exame</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Hemograma Completo" />
          </div>
          <div className="space-y-2">
            <Label>Descrição (opcional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o exame..." rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Tipo de preparo</Label>
            <Select value={preparationId || "__none__"} onValueChange={(v) => setPreparationId(v === "__none__" ? null : v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Nenhum" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Nenhum</SelectItem>
                {preparations.filter((p) => p.active).map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={active} onCheckedChange={setActive} />
            <Label>{active ? "Ativo" : "Inativo"}</Label>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button disabled={!name.trim()} onClick={() => { onSave({ id: exam?.id, name: name.trim(), description, preparationId, active }); onClose(); }}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============ Appointment Type Modal ============
const AppointmentTypeModal = ({ open, onClose, onSave, appointmentType }: { open: boolean; onClose: () => void; onSave: (t: Omit<AppointmentType, "id"> & { id?: string }) => void; appointmentType: AppointmentType | null }) => {
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (open) {
      if (appointmentType) { setName(appointmentType.name); setActive(appointmentType.active); }
      else { setName(""); setActive(true); }
    }
  }, [open, appointmentType]);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md !inset-0 !translate-x-0 !translate-y-0 !top-0 !left-0 sm:!inset-auto sm:!left-[50%] sm:!top-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] rounded-none sm:rounded-lg w-full sm:w-auto max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{appointmentType ? "Editar Tipo de Atendimento" : "Novo Tipo de Atendimento"}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nome do tipo</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Consulta" />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={active} onCheckedChange={setActive} />
            <Label>{active ? "Ativo" : "Inativo"}</Label>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button disabled={!name.trim()} onClick={() => { onSave({ id: appointmentType?.id, name: name.trim(), active }); onClose(); }}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============ Specialty Modal ============
const SpecialtyModal = ({ open, onClose, onSave, specialty }: { open: boolean; onClose: () => void; onSave: (s: Omit<Specialty, "id"> & { id?: string }) => void; specialty: Specialty | null }) => {
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (open) {
      if (specialty) { setName(specialty.name); setActive(specialty.active); }
      else { setName(""); setActive(true); }
    }
  }, [open, specialty]);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md !inset-0 !translate-x-0 !translate-y-0 !top-0 !left-0 sm:!inset-auto sm:!left-[50%] sm:!top-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] rounded-none sm:rounded-lg w-full sm:w-auto max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{specialty ? "Editar Especialidade" : "Nova Especialidade"}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nome da especialidade</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Cardiologia" />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={active} onCheckedChange={setActive} />
            <Label>{active ? "Ativo" : "Inativo"}</Label>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button disabled={!name.trim()} onClick={() => { onSave({ id: specialty?.id, name: name.trim(), active }); onClose(); }}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============ Main Page ============
const Cadastros = () => {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [preparations, setPreparations] = useState<Preparation[]>(initialPreparations);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>(initialAppointmentTypes);

  const [planModal, setPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [examModal, setExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  const [prepModal, setPrepModal] = useState(false);
  const [editingPrep, setEditingPrep] = useState<Preparation | null>(null);

  const [typeModal, setTypeModal] = useState(false);
  const [editingType, setEditingType] = useState<AppointmentType | null>(null);

  const [searchPlans, setSearchPlans] = useState("");
  const [searchExams, setSearchExams] = useState("");
  const [searchPreps, setSearchPreps] = useState("");
  const [searchTypes, setSearchTypes] = useState("");

  // Plan CRUD
  const savePlan = (data: Omit<Plan, "id"> & { id?: string }) => {
    if (data.id) {
      setPlans((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } as Plan : p)));
      toast.success("Plano atualizado");
    } else {
      setPlans((prev) => [...prev, { ...data, id: crypto.randomUUID() } as Plan]);
      toast.success("Plano adicionado");
    }
  };

  // Exam CRUD
  const saveExam = (data: Omit<Exam, "id"> & { id?: string }) => {
    if (data.id) {
      setExams((prev) => prev.map((e) => (e.id === data.id ? { ...e, ...data } as Exam : e)));
      toast.success("Exame atualizado");
    } else {
      setExams((prev) => [...prev, { ...data, id: crypto.randomUUID() } as Exam]);
      toast.success("Exame adicionado");
    }
  };

  // Preparation CRUD
  const savePrep = (data: Omit<Preparation, "id"> & { id?: string }) => {
    if (data.id) {
      setPreparations((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } as Preparation : p)));
      toast.success("Preparo atualizado");
    } else {
      setPreparations((prev) => [...prev, { ...data, id: crypto.randomUUID() } as Preparation]);
      toast.success("Preparo adicionado");
    }
  };

  // AppointmentType CRUD
  const saveType = (data: Omit<AppointmentType, "id"> & { id?: string }) => {
    if (data.id) {
      setAppointmentTypes((prev) => prev.map((t) => (t.id === data.id ? { ...t, ...data } as AppointmentType : t)));
      toast.success("Tipo de atendimento atualizado");
    } else {
      setAppointmentTypes((prev) => [...prev, { ...data, id: crypto.randomUUID() } as AppointmentType]);
      toast.success("Tipo de atendimento adicionado");
    }
  };

  const filteredPlans = plans.filter((p) => p.name.toLowerCase().includes(searchPlans.toLowerCase()));
  const filteredExams = exams.filter((e) => e.name.toLowerCase().includes(searchExams.toLowerCase()));
  const filteredPreps = preparations.filter((p) => p.name.toLowerCase().includes(searchPreps.toLowerCase()));
  const filteredTypes = appointmentTypes.filter((t) => t.name.toLowerCase().includes(searchTypes.toLowerCase()));

  const getPreparationName = (id: string | null) => {
    if (!id) return "—";
    return preparations.find((p) => p.id === id)?.name || "—";
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Cadastros</h2>
        <p className="text-muted-foreground mt-1 text-sm">Gerencie planos, exames, preparos e tipos de atendimento</p>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex">
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="exams">Exames</TabsTrigger>
          <TabsTrigger value="preparations">Preparos</TabsTrigger>
          <TabsTrigger value="types">Atendimentos</TabsTrigger>
        </TabsList>

        {/* ---- PLANS TAB ---- */}
        <TabsContent value="plans" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar plano..." value={searchPlans} onChange={(e) => setSearchPlans(e.target.value)} className="pl-9" />
                </div>
                <Button className="gap-2 shrink-0" onClick={() => { setEditingPlan(null); setPlanModal(true); }}>
                  <Plus className="h-4 w-4" /> Novo Plano
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="w-24 text-center">Status</TableHead>
                      <TableHead className="w-20 text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlans.length === 0 && (
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">Nenhum plano encontrado</TableCell></TableRow>
                    )}
                    {filteredPlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${plan.active ? "bg-status-confirmed/15 text-status-confirmed" : "bg-muted text-muted-foreground"}`}>
                            {plan.active ? "Ativo" : "Inativo"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingPlan(plan); setPlanModal(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- EXAMS TAB ---- */}
        <TabsContent value="exams" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar exame..." value={searchExams} onChange={(e) => setSearchExams(e.target.value)} className="pl-9" />
                </div>
                <Button className="gap-2 shrink-0" onClick={() => { setEditingExam(null); setExamModal(true); }}>
                  <Plus className="h-4 w-4" /> Novo Exame
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="hidden sm:table-cell">Preparo</TableHead>
                      <TableHead className="w-24 text-center">Status</TableHead>
                      <TableHead className="w-20 text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExams.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum exame encontrado</TableCell></TableRow>
                    )}
                    {filteredExams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell>
                          <div>
                            <span className="font-medium">{exam.name}</span>
                            {exam.description && <p className="text-xs text-muted-foreground mt-0.5">{exam.description}</p>}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{getPreparationName(exam.preparationId)}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${exam.active ? "bg-status-confirmed/15 text-status-confirmed" : "bg-muted text-muted-foreground"}`}>
                            {exam.active ? "Ativo" : "Inativo"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingExam(exam); setExamModal(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- PREPARATIONS TAB ---- */}
        <TabsContent value="preparations" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar preparo..." value={searchPreps} onChange={(e) => setSearchPreps(e.target.value)} className="pl-9" />
                </div>
                <Button className="gap-2 shrink-0" onClick={() => { setEditingPrep(null); setPrepModal(true); }}>
                  <Plus className="h-4 w-4" /> Novo Preparo
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="hidden sm:table-cell">Descrição</TableHead>
                      <TableHead className="w-24 text-center">Status</TableHead>
                      <TableHead className="w-20 text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPreps.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum preparo encontrado</TableCell></TableRow>
                    )}
                    {filteredPreps.map((prep) => (
                      <TableRow key={prep.id}>
                        <TableCell className="font-medium">{prep.name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{prep.description || "—"}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${prep.active ? "bg-status-confirmed/15 text-status-confirmed" : "bg-muted text-muted-foreground"}`}>
                            {prep.active ? "Ativo" : "Inativo"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingPrep(prep); setPrepModal(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- APPOINTMENT TYPES TAB ---- */}
        <TabsContent value="types" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar tipo de atendimento..." value={searchTypes} onChange={(e) => setSearchTypes(e.target.value)} className="pl-9" />
                </div>
                <Button className="gap-2 shrink-0" onClick={() => { setEditingType(null); setTypeModal(true); }}>
                  <Plus className="h-4 w-4" /> Novo Tipo
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="w-24 text-center">Status</TableHead>
                      <TableHead className="w-20 text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTypes.length === 0 && (
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">Nenhum tipo encontrado</TableCell></TableRow>
                    )}
                    {filteredTypes.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${t.active ? "bg-status-confirmed/15 text-status-confirmed" : "bg-muted text-muted-foreground"}`}>
                            {t.active ? "Ativo" : "Inativo"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingType(t); setTypeModal(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <PlanModal open={planModal} onClose={() => { setPlanModal(false); setEditingPlan(null); }} onSave={savePlan} plan={editingPlan} />
      <ExamModal open={examModal} onClose={() => { setExamModal(false); setEditingExam(null); }} onSave={saveExam} exam={editingExam} preparations={preparations} />
      <PreparationModal open={prepModal} onClose={() => { setPrepModal(false); setEditingPrep(null); }} onSave={savePrep} preparation={editingPrep} />
      <AppointmentTypeModal open={typeModal} onClose={() => { setTypeModal(false); setEditingType(null); }} onSave={saveType} appointmentType={editingType} />
    </div>
  );
};

export default Cadastros;
