import { useNavigate } from "react-router-dom";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { useUser } from "@/contexts/UserContext";
import { PlayCircle } from "lucide-react";

export const ActiveAppointmentBanner = () => {
  const { activeAppointment } = useAppointments();
  const { hasPermission } = useUser();
  const navigate = useNavigate();

  // 🔐 Controle de permissão
  const canViewBanner =
    hasPermission("podeIniciar") || hasPermission("podeFinalizar");

  // ❌ Não mostra se não tiver permissão
  if (!activeAppointment || !canViewBanner) return null;

  return (
    <div className="sticky top-0 z-40 w-full bg-blue-600 text-white px-4 py-2 flex justify-between items-center shadow-sm">

      <div className="flex items-center gap-2">
        <PlayCircle className="w-4 h-4 animate-pulse" />
        <span className="text-sm font-medium">
          Em atendimento: <strong>{activeAppointment.patientName}</strong>
        </span>
      </div>

      <button
        onClick={() =>
          navigate(`/dashboard/atendimento/${activeAppointment.patientId}/${activeAppointment.id}`)
        }
        className="text-xs font-semibold underline hover:text-blue-200 transition"
      >
        Voltar para atendimento
      </button>
    </div>
  );
};