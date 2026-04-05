import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type AppointmentStatus = "scheduled" | "confirmed" | "cancelled" | "missed";

export interface Appointment {
  id: string;
  patientName: string;
  time: string;
  duration: number;
  professionalId: string;
  status: AppointmentStatus;
  type?: string;
  examId?: string | null;
  examName?: string | null;
  preparationName?: string | null;
  paymentType?: "particular" | "plan";
  planId?: string | null;
  planName?: string | null;
  notes?: string;
  date?: string;
}

// Data types from Cadastros
interface ExamOption {
  id: string;
  name: string;
  description: string;
  preparationId: string | null;
  active: boolean;
}

interface PreparationOption {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

interface PlanOption {
  id: string;
  name: string;
  active: boolean;
}

interface AppointmentTypeOption {
  id: string;
  name: string;
  active: boolean;
}

interface AppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (appointment: Omit<Appointment, "id"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  appointment?: Appointment | null;
  defaultTime?: string;
  defaultProfessionalId?: string;
  defaultDate?: Date;
  professionals: { id: string; name: string }[];
  exams?: ExamOption[];
  preparations?: PreparationOption[];
  plans?: PlanOption[];
  appointmentTypes?: AppointmentTypeOption[];
}

const mockPatients = [
  "Ana Oliveira", "Carlos Mendes", "Juliana Costa", "Roberto Alves",
  "Fernanda Lima", "Lucas Barbosa", "Patrícia Souza", "Marcos Vieira",
  "Beatriz Rocha", "Rafael Martins", "Camila Ferreira", "Diego Nascimento",
];

const fallbackTypes = [
  "Consulta", "Retorno", "Exame", "Procedimento", "Avaliação", "Urgência",
];

const statusOptions: { value: AppointmentStatus; label: string }[] = [
  { value: "scheduled", label: "Agendado" },
  { value: "confirmed", label: "Confirmado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "missed", label: "Faltou" },
];

const statusDotClass: Record<AppointmentStatus, string> = {
  scheduled: "bg-status-scheduled",
  confirmed: "bg-status-confirmed",
  cancelled: "bg-status-cancelled",
  missed: "bg-status-missed",
};

const AppointmentModal = ({
  open,
  onClose,
  onSave,
  onDelete,
  appointment,
  defaultTime,
  defaultProfessionalId,
  defaultDate,
  professionals,
  exams = [],
  preparations = [],
  plans = [],
}: AppointmentModalProps) => {
  const isEditing = !!appointment;

  const [patientName, setPatientName] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState("08:00");
  const [duration, setDuration] = useState("30");
  const [type, setType] = useState("Consulta");
  const [status, setStatus] = useState<AppointmentStatus>("scheduled");
  const [notes, setNotes] = useState("");

  // New fields
  const [examId, setExamId] = useState<string | null>(null);
  const [examSearch, setExamSearch] = useState("");
  const [showExamSuggestions, setShowExamSuggestions] = useState(false);
  const [preparationName, setPreparationName] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<"particular" | "plan">("particular");
  const [planId, setPlanId] = useState<string | null>(null);

  const [patientSearch, setPatientSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const examInputRef = useRef<HTMLInputElement>(null);

  const activeExams = exams.filter((e) => e.active);
  const activePlans = plans.filter((p) => p.active);

  const filteredPatients = patientSearch.length > 0
    ? mockPatients.filter((p) => p.toLowerCase().includes(patientSearch.toLowerCase()))
    : [];

  const filteredExams = examSearch.length > 0
    ? activeExams.filter((e) => e.name.toLowerCase().includes(examSearch.toLowerCase()))
    : activeExams;

  // Auto-fill preparation when exam changes
  useEffect(() => {
    if (examId) {
      const exam = exams.find((e) => e.id === examId);
      if (exam?.preparationId) {
        const prep = preparations.find((p) => p.id === exam.preparationId);
        setPreparationName(prep?.name || "Sem preparo");
      } else {
        setPreparationName("Sem preparo");
      }
    } else {
      setPreparationName(null);
    }
  }, [examId, exams, preparations]);

  useEffect(() => {
    if (open) {
      if (appointment) {
        setPatientName(appointment.patientName);
        setPatientSearch(appointment.patientName);
        setProfessionalId(appointment.professionalId);
        setTime(appointment.time);
        setDuration(String(appointment.duration));
        setType(appointment.type || "Consulta");
        setStatus(appointment.status);
        setNotes(appointment.notes || "");
        setExamId(appointment.examId || null);
        setExamSearch(appointment.examName || "");
        setPaymentType(appointment.paymentType || "particular");
        setPlanId(appointment.planId || null);
        if (defaultDate) setDate(defaultDate);
      } else {
        setPatientName("");
        setPatientSearch("");
        setProfessionalId(defaultProfessionalId || "");
        setTime(defaultTime || "08:00");
        setDuration("30");
        setType("Consulta");
        setStatus("scheduled");
        setNotes("");
        setExamId(null);
        setExamSearch("");
        setPaymentType("particular");
        setPlanId(null);
        if (defaultDate) setDate(defaultDate);
      }
    }
  }, [open, appointment, defaultTime, defaultProfessionalId, defaultDate]);

  const handleSave = () => {
    if (!patientName || !professionalId) return;
    const selectedExam = exams.find((e) => e.id === examId);
    const selectedPlan = plans.find((p) => p.id === planId);
    onSave({
      ...(appointment ? { id: appointment.id } : {}),
      patientName,
      time,
      duration: Number(duration),
      professionalId,
      status,
      type,
      examId: type === "Exame" ? examId : null,
      examName: type === "Exame" ? selectedExam?.name || null : null,
      preparationName: type === "Exame" ? preparationName : null,
      paymentType,
      planId: paymentType === "plan" ? planId : null,
      planName: paymentType === "plan" ? selectedPlan?.name || null : null,
      notes,
    });
    onClose();
  };

  const handleSelectPatient = (name: string) => {
    setPatientName(name);
    setPatientSearch(name);
    setShowSuggestions(false);
  };

  const handleSelectExam = (exam: ExamOption) => {
    setExamId(exam.id);
    setExamSearch(exam.name);
    setShowExamSuggestions(false);
  };

  const timeSlots = Array.from({ length: 21 }, (_, i) => {
    const h = Math.floor(i / 2) + 8;
    const m = i % 2 === 0 ? "00" : "30";
    return `${String(h).padStart(2, "0")}:${m}`;
  });

  const isExam = type === "Exame";
  const isPlan = paymentType === "plan";

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[100dvh] sm:max-h-[90vh] overflow-hidden flex flex-col !inset-0 !translate-x-0 !translate-y-0 !top-0 !left-0 sm:!inset-auto sm:!left-[50%] sm:!top-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] rounded-none sm:rounded-lg w-full sm:w-auto">
        <DialogHeader className="shrink-0">
          <DialogTitle>{isEditing ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pt-2 pb-2 -mx-6 px-6">
          {/* 1. Patient autocomplete */}
          <div className="space-y-1.5 relative">
            <Label>Paciente</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  placeholder="Buscar paciente..."
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setPatientName(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  className="w-full"
                />
                {showSuggestions && filteredPatients.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
                    {filteredPatients.map((p) => (
                      <button
                        key={p}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                        onMouseDown={() => handleSelectPatient(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button type="button" variant="outline" size="icon" title="Novo paciente" className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 2. Tipo de atendimento */}
          <div className="space-y-1.5">
            <Label>Tipo de atendimento</Label>
            <Select value={type} onValueChange={(v) => {
              setType(v);
              if (v !== "Exame") {
                setExamId(null);
                setExamSearch("");
                setPreparationName(null);
              }
            }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {appointmentTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Exam selection (only if type === "Exame") */}
          {isExam && (
            <>
              <div className="space-y-1.5 relative">
                <Label>Exame</Label>
                <div className="relative">
                  <Input
                    ref={examInputRef}
                    placeholder="Buscar exame..."
                    value={examSearch}
                    onChange={(e) => {
                      setExamSearch(e.target.value);
                      setExamId(null);
                      setPreparationName(null);
                      setShowExamSuggestions(true);
                    }}
                    onFocus={() => setShowExamSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowExamSuggestions(false), 150)}
                    className="w-full"
                  />
                  {showExamSuggestions && filteredExams.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
                      {filteredExams.map((e) => (
                        <button
                          key={e.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                          onMouseDown={() => handleSelectExam(e)}
                        >
                          <span className="font-medium">{e.name}</span>
                          {e.description && (
                            <span className="text-muted-foreground ml-2 text-xs">— {e.description}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Preparation (read-only, auto-filled) */}
              <div className="space-y-1.5">
                <Label>Preparo</Label>
                <Input
                  value={preparationName || "Selecione um exame"}
                  readOnly
                  className="w-full bg-muted cursor-default"
                />
              </div>
            </>
          )}

          {/* Professional */}
          <div className="space-y-1.5">
            <Label>Profissional</Label>
            <Select value={professionalId} onValueChange={setProfessionalId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    locale={ptBR}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label>Hora</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <Label>Duração</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="60">60 minutos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 4. Payment type */}
          <div className="space-y-1.5">
            <Label>Tipo de pagamento</Label>
            <Select value={paymentType} onValueChange={(v: "particular" | "plan") => {
              setPaymentType(v);
              if (v === "particular") setPlanId(null);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="particular">Particular</SelectItem>
                <SelectItem value="plan">Plano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Plan selection (only if paymentType === "plan") */}
          {isPlan && (
            <div className="space-y-1.5">
              <Label>Plano</Label>
              <Select value={planId || "__none__"} onValueChange={(v) => setPlanId(v === "__none__" ? null : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o plano..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__" disabled>Selecione...</SelectItem>
                  {activePlans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Status */}
          <div className="space-y-1.5">
            <Label>Status</Label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition-all",
                    status === opt.value
                      ? "border-ring bg-accent text-accent-foreground shadow-sm"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", statusDotClass[opt.value])} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea
              placeholder="Observações sobre o agendamento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full"
            />
          </div>
        </div>

        {/* Fixed footer buttons */}
        <div className="flex items-center gap-2 pt-3 border-t shrink-0">
          {isEditing && onDelete && appointment && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => { onDelete(appointment.id); onClose(); }}
              className="h-10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </Button>
          )}
          <div className="flex-1" />
          <Button type="button" variant="outline" onClick={onClose} className="h-10">
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!patientName || !professionalId}
            className="h-10"
          >
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;
