import { useState, useCallback, useMemo } from "react";
import { format, addDays, subDays, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import AppointmentModal, { type Appointment, type AppointmentStatus } from "@/components/AppointmentModal";
import AgendaFilterModal, { type AgendaFilters } from "@/components/AgendaFilterModal";

const professionals = [
  { id: "p1", name: "Dr. João Silva" },
  { id: "p2", name: "Dra. Maria Santos" },
  { id: "p3", name: "Dr. Pedro Lima" },
];

// Shared data (same as Cadastros mock data)
const mockExams = [
  { id: "1", name: "Hemograma Completo", description: "Exame de sangue completo", preparationId: "1", active: true },
  { id: "2", name: "Raio-X Tórax", description: "", preparationId: null, active: true },
  { id: "3", name: "Sangue Completo", description: "Análise completa de sangue", preparationId: "1", active: true },
  { id: "4", name: "Ultrassonografia", description: "Ultrassom abdominal", preparationId: "1", active: true },
  { id: "5", name: "Eletrocardiograma", description: "ECG de repouso", preparationId: null, active: true },
];

const mockPreparations = [
  { id: "1", name: "Jejum 12h", description: "Jejum absoluto de 12 horas antes do exame", active: true },
  { id: "2", name: "Sem preparo", description: "Nenhum preparo necessário", active: true },
];

const mockPlans = [
  { id: "1", name: "Unimed", active: true },
  { id: "2", name: "Bradesco Saúde", active: true },
  { id: "3", name: "SulAmérica", active: false },
];

const allHours = Array.from({ length: 21 }, (_, i) => {
  const h = Math.floor(i / 2) + 8;
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

const initialAppointments: Appointment[] = [
  { id: "1", patientName: "Ana Oliveira", time: "09:00", duration: 30, professionalId: "p1", status: "confirmed", type: "Consulta" },
  { id: "2", patientName: "Carlos Mendes", time: "10:00", duration: 30, professionalId: "p1", status: "scheduled", type: "Retorno" },
  { id: "3", patientName: "Juliana Costa", time: "09:30", duration: 30, professionalId: "p2", status: "cancelled", type: "Consulta" },
  { id: "4", patientName: "Roberto Alves", time: "11:00", duration: 30, professionalId: "p2", status: "confirmed", type: "Exame" },
  { id: "5", patientName: "Fernanda Lima", time: "14:00", duration: 30, professionalId: "p3", status: "missed", type: "Consulta" },
  { id: "6", patientName: "Lucas Barbosa", time: "08:00", duration: 30, professionalId: "p1", status: "confirmed", type: "Avaliação" },
  { id: "7", patientName: "Patrícia Souza", time: "15:30", duration: 30, professionalId: "p3", status: "scheduled", type: "Procedimento" },
  { id: "8", patientName: "Marcos Vieira", time: "13:00", duration: 30, professionalId: "p2", status: "confirmed", type: "Consulta" },
];

const statusConfig: Record<AppointmentStatus, { label: string; cardClass: string; dotClass: string; borderColor: string; cancelled?: boolean }> = {
  scheduled: { label: "Agendado", cardClass: "bg-card border-border", dotClass: "bg-status-scheduled", borderColor: "border-l-status-scheduled" },
  confirmed: { label: "Confirmado", cardClass: "bg-card border-border", dotClass: "bg-status-confirmed", borderColor: "border-l-status-confirmed" },
  cancelled: { label: "Cancelado", cardClass: "bg-card border-border opacity-60", dotClass: "bg-status-cancelled", borderColor: "border-l-status-cancelled", cancelled: true },
  missed: { label: "Faltou", cardClass: "bg-card border-border", dotClass: "bg-status-missed", borderColor: "border-l-status-missed" },
};

const Agenda = () => {
  const { userType, professionalId: userProfId } = useUser();
  const isClinic = userType === "clinic";

  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [defaultSlot, setDefaultSlot] = useState<{ time: string; professionalId: string } | null>(null);
  const [filters, setFilters] = useState<AgendaFilters>({ professionalId: null, startTime: null, endTime: null, date: null });

  // When filter date changes, update currentDate
  const handleApplyFilters = (newFilters: AgendaFilters) => {
    setFilters(newFilters);
    if (newFilters.date) {
      setCurrentDate(newFilters.date);
    }
  };
  // Mobile: which professional column to show (index)
  const [mobileProfIdx, setMobileProfIdx] = useState(0);

  const visibleProfessionals = useMemo(() => {
    if (!isClinic) return professionals.filter((p) => p.id === userProfId);
    if (filters.professionalId) return professionals.filter((p) => p.id === filters.professionalId);
    return professionals;
  }, [isClinic, userProfId, filters.professionalId]);

  const hours = useMemo(() => {
    let h = allHours;
    if (filters.startTime) h = h.filter((t) => t >= filters.startTime!);
    if (filters.endTime) h = h.filter((t) => t <= filters.endTime!);
    return h;
  }, [filters.startTime, filters.endTime]);

  const hasActiveFilters = filters.professionalId || filters.startTime || filters.endTime || filters.date;

  const getAppointment = (time: string, profId: string) =>
    appointments.find((a) => a.time === time && a.professionalId === profId);

  const handleSlotClick = (time: string, professionalId: string) => {
    const existing = getAppointment(time, professionalId);
    if (existing) {
      setEditingAppointment(existing);
      setDefaultSlot(null);
    } else {
      setEditingAppointment(null);
      setDefaultSlot({ time, professionalId });
    }
    setModalOpen(true);
  };

  const handleSave = useCallback((data: Omit<Appointment, "id"> & { id?: string }) => {
    setAppointments((prev) => {
      if (data.id) return prev.map((a) => (a.id === data.id ? { ...a, ...data } as Appointment : a));
      return [...prev, { ...data, id: crypto.randomUUID() } as Appointment];
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleCloseModal = () => { setModalOpen(false); setEditingAppointment(null); setDefaultSlot(null); };

  // For mobile: single professional view
  const mobileProfessional = visibleProfessionals[mobileProfIdx] || visibleProfessionals[0];

  return (
    <div className="flex flex-col h-full -m-4 sm:-m-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3 border-b bg-card">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className={isToday(currentDate) ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""}
          >
            Hoje
          </Button>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate((d) => subDays(d, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate((d) => addDays(d, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOpen(true)}
            className="gap-1.5"
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filtrar</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 order-3 sm:order-2 w-full sm:w-auto justify-center">
          <CalendarDays className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <h2 className="text-sm sm:text-base font-semibold text-foreground capitalize">
            {format(currentDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </h2>
        </div>

        <div className="hidden md:flex items-center gap-3 order-2 sm:order-3">
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`h-2 w-2 rounded-full ${cfg.dotClass}`} />
              {cfg.label}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile professional switcher */}
      {visibleProfessionals.length > 1 && (
        <div className="flex md:hidden items-center gap-2 px-4 py-2 border-b bg-card overflow-x-auto">
          {visibleProfessionals.map((p, idx) => (
            <Button
              key={p.id}
              variant={mobileProfIdx === idx ? "default" : "outline"}
              size="sm"
              className="text-xs shrink-0"
              onClick={() => setMobileProfIdx(idx)}
            >
              {p.name}
            </Button>
          ))}
        </div>
      )}

      {/* Desktop/Tablet Grid */}
      <div className="flex-1 overflow-auto hidden md:block">
        <div className="min-w-[500px]">
          <div
            className="grid sticky top-0 z-10 bg-card border-b"
            style={{ gridTemplateColumns: `72px repeat(${visibleProfessionals.length}, 1fr)` }}
          >
            <div className="border-r p-2" />
            {visibleProfessionals.map((p) => (
              <div key={p.id} className="border-r last:border-r-0 px-3 py-2.5 text-center">
                <span className="text-sm font-medium text-foreground">{p.name}</span>
              </div>
            ))}
          </div>

          {hours.map((time) => (
            <div
              key={time}
              className="grid border-b"
              style={{ gridTemplateColumns: `72px repeat(${visibleProfessionals.length}, 1fr)` }}
            >
              <div className="border-r px-2 py-1 flex items-start justify-end">
                <span className="text-xs text-muted-foreground font-medium -mt-0.5">{time}</span>
              </div>
              {visibleProfessionals.map((prof) => {
                const appt = getAppointment(time, prof.id);
                return (
                  <div
                    key={prof.id}
                    className={`border-r last:border-r-0 h-12 px-1 py-0.5 transition-colors ${
                      !appt ? "hover:bg-accent/50 cursor-pointer" : "cursor-pointer"
                    }`}
                    onClick={() => handleSlotClick(time, prof.id)}
                  >
                    {appt && (
                      <div className={`h-full rounded-md border px-2 py-1 flex items-center gap-2 text-xs ${statusConfig[appt.status].className}`}>
                        <span className={`h-2 w-2 rounded-full shrink-0 ${statusConfig[appt.status].dotClass}`} />
                        <span className="font-medium truncate">{appt.patientName}</span>
                        <span className="text-muted-foreground ml-auto shrink-0">{appt.time}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile List View */}
      <div className="flex-1 overflow-auto md:hidden">
        <div className="divide-y">
          {hours.map((time) => {
            const appt = getAppointment(time, mobileProfessional?.id || "");
            return (
              <div
                key={time}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  !appt ? "active:bg-accent/50" : ""
                }`}
                onClick={() => mobileProfessional && handleSlotClick(time, mobileProfessional.id)}
              >
                <span className="text-sm text-muted-foreground font-medium w-12 shrink-0">{time}</span>
                {appt ? (
                  <div className={`flex-1 rounded-lg border px-3 py-2 flex items-center gap-2 ${statusConfig[appt.status].className}`}>
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${statusConfig[appt.status].dotClass}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{appt.patientName}</p>
                      <p className="text-xs text-muted-foreground">{appt.type}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 h-10 rounded-lg border border-dashed border-border/50 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Disponível</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status legend mobile */}
      <div className="flex md:hidden items-center justify-center gap-3 px-4 py-2 border-t bg-card">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className={`h-2 w-2 rounded-full ${cfg.dotClass}`} />
            {cfg.label}
          </div>
        ))}
      </div>

      {/* Filter Modal */}
      <AgendaFilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
        professionals={professionals}
        showProfessionalFilter={isClinic}
      />

      {/* Appointment Modal */}
      <AppointmentModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        onDelete={handleDelete}
        appointment={editingAppointment}
        defaultTime={defaultSlot?.time}
        defaultProfessionalId={defaultSlot?.professionalId}
        defaultDate={currentDate}
        professionals={isClinic ? professionals : professionals.filter((p) => p.id === userProfId)}
        exams={mockExams}
        preparations={mockPreparations}
        plans={mockPlans}
      />
    </div>
  );
};

export default Agenda;
