import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { format } from "date-fns";
import type { Appointment, AppointmentStatus } from "@/components/AppointmentModal";

export type ActiveAppointment = {
  id: string;
  patientId: string;
  professionalId: string;
  clinicId?: string;
  startedAt: string;
  patientName: string;
};

interface AppointmentsContextType {
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  getAppointmentsByDate: (date: Date) => Appointment[];
  getAppointmentsByProfessional: (date: Date, professionalId: string) => Appointment[];
  activeAppointment: ActiveAppointment | null;
  startAppointment: (appointment: ActiveAppointment) => void;
  clearActiveAppointment: () => void;
}

// Criar o contexto
const AppointmentsContext = createContext<AppointmentsContextType | null>(null);

// Hook useAppointments
export function useAppointments() {
  const ctx = useContext(AppointmentsContext);
  if (!ctx) throw new Error("useAppointments must be used within AppointmentsProvider");
  return ctx;
}

const todayStr = format(new Date(), "yyyy-MM-dd");

const initialAppointments: Appointment[] = [
  // Paciente 1: Carlos Mendes
  { id: "1", patientId: "1", patientName: "Carlos Mendes", time: "09:00", duration: 30, professionalId: "p1", status: "confirmed", type: "Consulta", serviceId: "1", serviceName: "Consulta Clínica", price: 150.00, date: todayStr },

  // Paciente 2: Ana Oliveira
  { id: "2", patientId: "2", patientName: "Ana Oliveira", time: "10:00", duration: 30, professionalId: "p1", status: "scheduled", type: "Consulta", serviceId: "1", serviceName: "Consulta Clínica", price: 150.00, date: todayStr },

  // Paciente 3: Juliana Costa
  { id: "3", patientId: "3", patientName: "Juliana Costa", time: "09:30", duration: 30, professionalId: "p2", status: "cancelled", type: "Consulta", serviceId: "1", serviceName: "Consulta Clínica", price: 150.00, date: todayStr },

  // Paciente 4: Roberto Alves
  { id: "4", patientId: "4", patientName: "Roberto Alves", time: "11:00", duration: 30, professionalId: "p2", status: "confirmed", type: "Exame", serviceId: "3", serviceName: "Ultrassom Abdominal", price: 200.00, date: todayStr },

  // Paciente 5: Fernanda Lima
  { id: "5", patientId: "5", patientName: "Fernanda Lima", time: "14:00", duration: 30, professionalId: "p3", status: "missed", type: "Consulta", serviceId: "1", serviceName: "Consulta Clínica", price: 150.00, date: todayStr },

  // Paciente 6: Lucas Barbosa
  { id: "6", patientId: "6", patientName: "Lucas Barbosa", time: "08:00", duration: 30, professionalId: "p1", status: "confirmed", type: "Procedimento", serviceId: "2", serviceName: "Sessão de Fisioterapia", price: 120.00, date: todayStr },

  // Paciente 7: Patrícia Souza
  { id: "7", patientId: "7", patientName: "Patrícia Souza", time: "15:30", duration: 30, professionalId: "p3", status: "scheduled", type: "Procedimento", serviceId: "2", serviceName: "Sessão de Fisioterapia", price: 120.00, date: todayStr },

  // Paciente 8: Marcos Vieira
  { id: "8", patientId: "8", patientName: "Marcos Vieira", time: "13:00", duration: 30, professionalId: "p2", status: "confirmed", type: "Consulta", serviceId: "1", serviceName: "Consulta Clínica", price: 150.00, date: todayStr },
];

// Provider component
export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [activeAppointment, setActiveAppointment] = useState<ActiveAppointment | null>(() => {
    const stored = localStorage.getItem("activeAppointment");
    return stored ? JSON.parse(stored) : null;
  });

  const startAppointment = useCallback((appt: ActiveAppointment) => {
    setActiveAppointment(appt);
    localStorage.setItem("activeAppointment", JSON.stringify(appt));
  }, []);

  const clearActiveAppointment = useCallback(() => {
    setActiveAppointment(null);
    localStorage.removeItem("activeAppointment");
  }, []);

  const addAppointment = useCallback((appointment: Appointment) => {
    setAppointments((prev) => [...prev, appointment]);
  }, []);

  const updateAppointment = useCallback((id: string, data: Partial<Appointment>) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
  }, []);

  const deleteAppointment = useCallback((id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const updateAppointmentStatus = useCallback((id: string, status: AppointmentStatus) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }, []);

  const getAppointmentsByDate = useCallback((date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return appointments.filter((a) => a.date === dateStr);
  }, [appointments]);

  const getAppointmentsByProfessional = useCallback((date: Date, professionalId: string) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return appointments.filter((a) => a.date === dateStr && a.professionalId === professionalId);
  }, [appointments]);

  const value = {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    updateAppointmentStatus,
    getAppointmentsByDate,
    getAppointmentsByProfessional,
    activeAppointment,
    startAppointment,
    clearActiveAppointment,
  };

  return (
    <AppointmentsContext.Provider value={value}>
      {children}
    </AppointmentsContext.Provider>
  );
}