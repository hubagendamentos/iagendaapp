import { useState, useCallback } from "react";
import { format, addDays, subDays, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppointmentModal, { type Appointment, type AppointmentStatus } from "@/components/AppointmentModal";

const professionals = [
  { id: "p1", name: "Dr. João Silva" },
  { id: "p2", name: "Dra. Maria Santos" },
  { id: "p3", name: "Dr. Pedro Lima" },
];

const hours = Array.from({ length: 21 }, (_, i) => {
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

const statusConfig: Record<AppointmentStatus, { label: string; className: string; dotClass: string }> = {
  scheduled: { label: "Agendado", className: "bg-status-scheduled/15 border-status-scheduled/30 text-foreground", dotClass: "bg-status-scheduled" },
  confirmed: { label: "Confirmado", className: "bg-status-confirmed/15 border-status-confirmed/30 text-foreground", dotClass: "bg-status-confirmed" },
  cancelled: { label: "Cancelado", className: "bg-status-cancelled/15 border-status-cancelled/30 text-foreground line-through opacity-60", dotClass: "bg-status-cancelled" },
  missed: { label: "Faltou", className: "bg-status-missed/15 border-status-missed/30 text-foreground", dotClass: "bg-status-missed" },
};

const Agenda = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [defaultSlot, setDefaultSlot] = useState<{ time: string; professionalId: string } | null>(null);

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
      if (data.id) {
        return prev.map((a) => (a.id === data.id ? { ...a, ...data } as Appointment : a));
      }
      const newAppt: Appointment = { ...data, id: crypto.randomUUID() } as Appointment;
      return [...prev, newAppt];
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingAppointment(null);
    setDefaultSlot(null);
  };

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className={isToday(currentDate) ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""}
          >
            Hoje
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate((d) => subDays(d, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate((d) => addDays(d, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground capitalize">
            {format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`h-2.5 w-2.5 rounded-full ${cfg.dotClass}`} />
              {cfg.label}
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[700px]">
          <div className="grid sticky top-0 z-10 bg-card border-b" style={{ gridTemplateColumns: "72px repeat(3, 1fr)" }}>
            <div className="border-r p-2" />
            {professionals.map((p) => (
              <div key={p.id} className="border-r last:border-r-0 px-3 py-2.5 text-center">
                <span className="text-sm font-medium text-foreground">{p.name}</span>
              </div>
            ))}
          </div>

          {hours.map((time) => (
            <div key={time} className="grid border-b" style={{ gridTemplateColumns: "72px repeat(3, 1fr)" }}>
              <div className="border-r px-2 py-1 flex items-start justify-end">
                <span className="text-xs text-muted-foreground font-medium -mt-0.5">{time}</span>
              </div>
              {professionals.map((prof) => {
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

      {/* Modal */}
      <AppointmentModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        onDelete={handleDelete}
        appointment={editingAppointment}
        defaultTime={defaultSlot?.time}
        defaultProfessionalId={defaultSlot?.professionalId}
        defaultDate={currentDate}
        professionals={professionals}
      />
    </div>
  );
};

export default Agenda;
