import { useSearchParams } from "react-router-dom";
import { FichaPacienteNormal } from "@/components/FichaPacienteNormal";
import { FichaAtendimento } from "@/components/FichaAtendimento";

const FichaPaciente = () => {
  const [searchParams] = useSearchParams();
  const isAttendanceMode = searchParams.get("mode") === "atendimento";

  if (isAttendanceMode) {
    return <FichaAtendimento />;
  }

  return <FichaPacienteNormal />;
};

export default FichaPaciente;
