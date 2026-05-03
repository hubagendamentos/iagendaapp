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

export type AppointmentStatus = "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "missed";

export interface Appointment {
  id: string;
  patientId?: string;
  patientName: string;
  time: string;
  duration: number;
  professionalId: string;
  status: AppointmentStatus;
  type?: string;
  serviceId?: string | null;
  serviceName?: string | null;
  price?: number;
  paymentType?: "particular" | "plan";
  planId?: string | null;
  planName?: string | null;
  notes?: string;
  date?: string;
  financeiro_encerrado?: boolean;
  valor_pago?: number;
  status_pagamento?: "pendente" | "parcial" | "pago";
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

export interface ServiceOption {
  id: string;
  name: string;
  appointmentTypeId: string;
  specialtyId: string | null;
  examId?: string | null;
  price: number;
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
  services?: ServiceOption[];
}

const mockPatients = [
  { id: "1", name: "Carlos Mendes" },
  { id: "2", name: "Ana Oliveira" },
  { id: "3", name: "Juliana Costa" },
  { id: "4", name: "Roberto Alves" },
  { id: "5", name: "Fernanda Lima" },
  { id: "6", name: "Lucas Barbosa" },
  { id: "7", name: "Patrícia Souza" },
  { id: "8", name: "Marcos Vieira" },
  { id: "9", name: "Beatriz Rocha" },
  { id: "10", name: "Rafael Martins" },
  { id: "11", name: "Camila Ferreira" },
  { id: "12", name: "Diego Nascimento" },
];

const fallbackTypes = [
  "Consulta", "Retorno", "Exame", "Procedimento", "Avaliação", "Urgência",
];

const statusOptions: { value: AppointmentStatus; label: string }[] = [
  { value: "scheduled", label: "Agendado" },
  { value: "confirmed", label: "Confirmado" },
  { value: "in_progress", label: "Em atendimento" },
  { value: "completed", label: "Finalizado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "missed", label: "Faltou" },
];

const statusDotClass: Record<AppointmentStatus, string> = {
  scheduled: "bg-status-scheduled",
  confirmed: "bg-status-confirmed",
  in_progress: "bg-blue-500",
  completed: "bg-muted-foreground",
  cancelled: "bg-status-cancelled",
  missed: "bg-status-missed",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
};

import { useUser } from "@/contexts/UserContext";

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
  appointmentTypes = [],
  services = [],
}: AppointmentModalProps) => {
  const { hasPermission } = useUser();
  const isEditing = !!appointment;

  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState("08:00");
  const [duration, setDuration] = useState("30");
  const [type, setType] = useState("");
  const [status, setStatus] = useState<AppointmentStatus>("scheduled");
  const [notes, setNotes] = useState("");

  const [serviceId, setServiceId] = useState<string | null>(null);
  const [serviceSearch, setServiceSearch] = useState("");
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
  const [price, setPrice] = useState<number | null>(null);

  const [paymentType, setPaymentType] = useState<"particular" | "plan">("particular");
  const [planId, setPlanId] = useState<string | null>(null);

  const [patientSearch, setPatientSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const serviceInputRef = useRef<HTMLInputElement>(null);

  const activePlans = plans.filter((p) => p.active);
  const activeTypes = appointmentTypes.length > 0
    ? appointmentTypes.filter((t) => t.active).map((t) => t.name)
    : fallbackTypes;
  const activeServices = services.filter((s) => s.active);

  const filteredPatients = patientSearch.length > 0
    ? mockPatients.filter((p) => p.name.toLowerCase().includes(patientSearch.toLowerCase()))
    : [];

  // Logic 1: Filter services by selected type
  const selectedTypeObj = type ? appointmentTypes.find((t) => t.name === type) : null;
  const filteredServices = activeServices.filter((s) => {
    // If a type is selected, enforce the match
    if (selectedTypeObj && s.appointmentTypeId !== selectedTypeObj.id) return false;
    // Then filter by text search
    if (serviceSearch && !s.name.toLowerCase().includes(serviceSearch.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    if (open) {
      if (appointment) {
        setPatientId(appointment.patientId || "");
        setPatientName(appointment.patientName);
        setPatientSearch(appointment.patientName);
        setProfessionalId(appointment.professionalId);
        setTime(appointment.time);
        setDuration(String(appointment.duration));
        setType(appointment.type || "");
        setStatus(appointment.status);
        setNotes(appointment.notes || "");
        setServiceId(appointment.serviceId || null);
        setServiceSearch(appointment.serviceName || "");
        setPrice(appointment.price || null);
        setPaymentType(appointment.paymentType || "particular");
        setPlanId(appointment.planId || null);
        if (defaultDate) setDate(defaultDate);
      } else {
        setPatientId("");
        setPatientName("");
        setPatientSearch("");
        setProfessionalId(defaultProfessionalId || "");
        setTime(defaultTime || "08:00");
        setDuration("30");
        setType("");
        setStatus("scheduled");
        setNotes("");
        setServiceId(null);
        setServiceSearch("");
        setPrice(null);
        setPaymentType("particular");
        setPlanId(null);
        if (defaultDate) setDate(defaultDate);
      }
    }
  }, [open, appointment, defaultTime, defaultProfessionalId, defaultDate]);

  const handleSave = () => {
    if (!patientName || !professionalId || !serviceId) return;
    const selectedPlan = plans.find((p) => p.id === planId);
    onSave({
      ...(appointment ? { id: appointment.id } : {}),
      patientId: patientId || undefined, // Include patientId
      patientName,
      time,
      duration: Number(duration),
      professionalId,
      status,
      type,
      serviceId,
      serviceName: serviceSearch,
      price: price || 0,
      paymentType,
      planId: paymentType === "plan" ? planId : null,
      planName: paymentType === "plan" ? selectedPlan?.name || null : null,
      notes,
    });
    onClose();
  };

  const handleSelectPatient = (patient: { id: string; name: string }) => {
    setPatientId(patient.id);
    setPatientName(patient.name);
    setPatientSearch(patient.name);
    setShowSuggestions(false);
  };

  const handleSelectService = (service: ServiceOption) => {
    setServiceId(service.id);
    setServiceSearch(service.name);
    setPrice(service.price);
    setShowServiceSuggestions(false);

    // Auto-fill and lock type
    const matchedType = appointmentTypes.find((t) => t.id === service.appointmentTypeId);
    if (matchedType) setType(matchedType.name);
  };

  const timeSlots = Array.from({ length: 21 }, (_, i) => {
    const h = Math.floor(i / 2) + 8;
    const m = i % 2 === 0 ? "00" : "30";
    return `${String(h).padStart(2, "0")}:${m}`;
  });

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
                    setPatientId(""); // Clear ID when typing manually
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
                        key={p.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                        onMouseDown={() => handleSelectPatient(p)}
                      >
                        {p.name}
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

          {/* 3. Tipo de atendimento */}
          <div className="space-y-1.5">
            <Label>Tipo de atendimento</Label>
            <Select disabled={!!serviceId} value={type} onValueChange={(v) => {
              setType(v);
              // Clear service if changing type so it doesn't conflict
              setServiceId(null);
              setServiceSearch("");
              setPrice(null);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Qualquer tipo..." />
              </SelectTrigger>
              <SelectContent>
                {activeTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 4. Serviço selection */}
          <div className="space-y-1.5 relative">
            <Label>Serviço (Obrigatório)</Label>
            <div className="relative">
              <Input
                ref={serviceInputRef}
                placeholder="Buscar serviço..."
                value={serviceSearch}
                onChange={(e) => {
                  setServiceSearch(e.target.value);
                  setServiceId(null);
                  setPrice(null);
                  setShowServiceSuggestions(true);
                }}
                onFocus={() => setShowServiceSuggestions(true)}
                onBlur={() => setTimeout(() => setShowServiceSuggestions(false), 150)}
                className="w-full"
              />
              {showServiceSuggestions && filteredServices.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
                  {filteredServices.map((s) => {
                    const tName = appointmentTypes.find(at => at.id === s.appointmentTypeId)?.name || "Geral";
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors"
                        onMouseDown={() => handleSelectService(s)}
                      >
                        <div className="text-left">
                          <span className="font-medium text-foreground block">{s.name}</span>
                          <span className="text-muted-foreground text-xs">{tName}</span>
                        </div>
                        <span className="text-muted-foreground font-medium shrink-0 ml-2">{formatCurrency(s.price)}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Valor */}
          {serviceId && price !== null && (
            <div className="space-y-1.5">
              <Label>Valor</Label>
              <Input value={formatCurrency(price)} readOnly className="w-full bg-muted cursor-default border-dashed" />
            </div>
          )}

          {/* Auto-filled Exame e Preparo vinculados */}
          {(() => {
            if (!serviceId) return null;
            const selectedServiceData = services.find((s) => s.id === serviceId);
            if (!selectedServiceData?.examId) return null;

            const linkedExam = exams.find((e) => e.id === selectedServiceData.examId);
            if (!linkedExam) return null;

            const linkedPrep = linkedExam.preparationId ? preparations.find((p) => p.id === linkedExam.preparationId) : null;

            return (
              <div className="space-y-1.5 pt-2">
                <div className="p-3 bg-muted/40 border border-muted-foreground/20 rounded-md text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-foreground">Exame:</span>
                    <span className="text-muted-foreground">{linkedExam.name}</span>
                  </div>
                  <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
                    <span className="font-semibold text-foreground">Preparo:</span>
                    {linkedPrep ? (
                      <div className="text-muted-foreground">
                        <span className="inline-flex items-center rounded bg-amber-500/15 text-amber-600 px-1.5 text-[10px] font-bold uppercase mr-1.5 align-middle">Requer preparo</span>
                        <span>{linkedPrep.name}</span>
                        {linkedPrep.description && (
                          <span className="block text-xs mt-0.5 opacity-80">{linkedPrep.description}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground opacity-80">Sem preparo necessário</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

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
              {statusOptions.filter(opt => {
                if (opt.value === "confirmed") return hasPermission("podeConfirmar");
                if (opt.value === "in_progress") return hasPermission("podeIniciar");
                if (opt.value === "completed") return hasPermission("podeFinalizar");
                if (opt.value === "cancelled") return hasPermission("podeCancelar");
                if (opt.value === "missed") return hasPermission("podeMarcarFalta");
                return true;
              }).map((opt) => (
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
            disabled={!patientName || !professionalId || !serviceId}
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