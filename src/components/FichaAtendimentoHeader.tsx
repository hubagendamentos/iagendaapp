import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { applyCpfCnpjMask } from "@/components/CpfCnpjMaskInput";
import { applyPhoneMask } from "@/components/PhoneMaskInput";
import type { Paciente } from "@/components/PacienteModal";

function getInitials(name: string = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

function calcIdade(nascimento?: string): number | null {
  if (!nascimento) return null;
  const birth = new Date(nascimento);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

interface Props {
  paciente: Paciente;
  profissionalNome: string;
  status: string;
}

export function FichaAtendimentoHeader({ paciente, profissionalNome, status }: Props) {
  const navigate = useNavigate();
  const idade = calcIdade(paciente.nascimento);
  const phoneDigits = (paciente.celular || "").replace(/\D/g, "");

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl border bg-card shadow-sm print:shadow-none">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/atendimentos")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {getInitials(paciente.nome)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold">{paciente.nome}</h2>
              {status === "in_progress" && (
                <Badge className="bg-blue-500 text-white animate-pulse text-xs py-0">Em atendimento</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><User className="h-3 w-3" /> {profissionalNome}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(), "HH:mm")}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/paciente/${paciente.id}`)}>
          <FileText className="h-3.5 w-3.5 mr-1.5" /> Ver Ficha
        </Button>
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-2">
        <span><strong>{idade ?? "N/A"} anos</strong> • {paciente.genero || "N/A"}</span>
        <span>CPF: <strong>{paciente.cpf ? applyCpfCnpjMask(paciente.cpf) : "Não informado"}</strong></span>
        <span>{phoneDigits ? applyPhoneMask(phoneDigits) : "Não informado"}</span>
      </div>
    </div>
  );
}