import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { format } from "date-fns";
import type { Appointment, AppointmentStatus } from "@/components/AppointmentModal";

interface AppointmentsContextType {
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  getAppointmentsByDate: (date: Date) => Appointment[];
  getAppointmentsByProfessional: (date: Date, professionalId: string) => Appointment[];
}

const AppointmentsContext = createContext<AppointmentsContextType | null>(null);

export const useAppointments = () => {
  const ctx = useContext(AppointmentsContext);
  if (!ctx) throw new Error("useAppointments must be used within AppointmentsProvider");
  return ctx;
};

const todayStr = format(new Date(), "yyyy-MM-dd");

const initialAppointments: Appointment[] = [
  { id: "1", patientName: "Ana Oliveira", time: "09:00", duration: 30, professionalId: "p1", status: "confirmed", type: "Consulta", serviceId: "1", serviceName: "Consulta Clínica", price: 150.00, date: todayStr },
  { id: "2", patientName: "Carlos Mendes", time: "10:00", duration: 30, professionalId: "p1", status: "scheduled", type: "Consulta", serviceId: "1", serviceName: "Consulta Clínica", price: 150.00, date: todayStr },
  { id: "3", patientName: "Juliana Costa", time: "09:30", duration: 30, professionalId: "p2", status: "cancelled", type: "Consulta", serviceId: "1", serviceName: "Consulta Clínica", price: 150.00, date: todayStr },
  { id: "4", patientName: "Roberto Alves", time: "11:00", duration: 30, professionalId: "p2", status: "confirmed", type: "Exame", serviceId: "3", serviceName: "Ultrassom Abdominal", price: 200.00, date: todayStr },
  { id: "5", patientName: "Fernanda Lima", time: "14:00", duration: 30, professionalId: "p3", status: "missed", type: "Consulta", serviceId: "1", serviceName: "Consulta Clínica", price: 150.00, date: todayStr },
  { id: "6", patientName: "Lucas Barbosa", time: "08:00", duration: 30, professionalId: "p1", status: "confirmed", type: "Procedimento", serviceId: "2", serviceName: "Sessão de Fisioterapia", price: 120.00, date: todayStr },
  { id: "7", patientName: "Patrícia Souza", time: "15:30", duration: 30, professionalId: "p3", status: "scheduled", type: "Procedimento", serviceId: "2", serviceName: "Sessão de Fisioterapia", price: 120.00, date: todayStr },
  { id: "8", patientName: "Marcos Vieira", time: "13:00", duration: 30, professionalId: "p2", status: "confirmed", type: "Consulta", serviceId: "1", serviceName: "Consulta Clínica", price: 150.00, date: todayStr },
];

export const AppointmentsProvider = ({ children }: { children: ReactNode }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

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

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        updateAppointmentStatus,
        getAppointmentsByDate,
        getAppointmentsByProfessional,
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
};
