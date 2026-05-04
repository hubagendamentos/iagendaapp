import { useState, useEffect } from "react";
import { PlayCircle, CheckCircle2, ChevronLeft, ChevronRight, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/contexts/UserContext";
import { useCronometro } from "@/hooks/useCronometro";
import { cn } from "@/lib/utils";

interface Props {
  appointmentId: string;
  status: string;
  duration?: number;
  onIniciar: () => boolean | void;
  onFinalizar: () => void;
  disabled?: boolean;
}

export function PainelAtendimento({ appointmentId, status, duration, onIniciar, onFinalizar, disabled }: Props) {
  const { hasPermission } = useUser();
  const crono = useCronometro(appointmentId);

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("painel_collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("painel_collapsed", String(collapsed));
  }, [collapsed]);

  const handleIniciar = () => {
    const result = onIniciar();
    if (result !== false) {
      crono.iniciar();
    }
  };

  const handleFinalizar = () => {
    crono.parar();
    onFinalizar();
  };

  if (collapsed) {
    return (
      <div className="w-[68px] shrink-0 border rounded-xl bg-card flex flex-col items-center gap-2 py-3 print:hidden shadow-sm transition-all duration-300">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(false)} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Expandir painel</TooltipContent>
        </Tooltip>
        {crono.rodando && (
          <span className="font-mono text-xs text-primary writing-mode-vertical py-2">{crono.formatado}</span>
        )}
      </div>
    );
  }

  return (
    <div className="w-60 shrink-0 border rounded-xl bg-card p-4 flex flex-col gap-5 print:hidden shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between border-b pb-3">
        <span className="text-base font-semibold tracking-tight">Prontuário</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2" onClick={() => setCollapsed(true)}>
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Ocultar painel</TooltipContent>
        </Tooltip>
      </div>

      {/* Cronômetro */}
      <div className="flex flex-col items-center justify-center gap-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tempo de atendimento</span>
        <div className="flex items-center justify-center gap-2 mt-1">
          <Timer className={cn("h-5 w-5", crono.rodando ? "text-primary animate-pulse" : "text-muted-foreground")} />
          <span className="font-mono text-3xl font-bold tracking-tight">{crono.formatado}</span>
        </div>
        {duration && (
          <div className="flex flex-col items-center mt-2 space-y-1">
            <p className="text-[11px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">Duração prevista: {duration} min</p>
            {crono.decorrido > duration * 60 ? (
              <span className="text-[11px] text-destructive font-medium">Atrasado +{Math.floor((crono.decorrido - duration * 60) / 60)} min</span>
            ) : crono.decorrido > 0 ? (
              <span className="text-[11px] text-emerald-600 font-medium">Dentro do tempo</span>
            ) : null}
          </div>
        )}
      </div>

      {/* Botões */}
      <div className="flex flex-col gap-2 pt-2 border-t">
        {status !== "in_progress" && hasPermission("podeIniciar") && (
          <Button className="w-full h-11 font-semibold text-sm" onClick={handleIniciar} disabled={disabled}>
            <PlayCircle className="h-5 w-5 mr-2" /> Iniciar atendimento
          </Button>
        )}

        {status === "in_progress" && (
          <Button className="w-full h-11 font-semibold text-sm bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed opacity-80" disabled>
            <PlayCircle className="h-5 w-5 mr-2" /> Em andamento
          </Button>
        )}

        {status === "in_progress" && hasPermission("podeFinalizar") && (
          <Button className="w-full h-11 font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleFinalizar}>
            <CheckCircle2 className="h-5 w-5 mr-2" /> Finalizar atendimento
          </Button>
        )}
      </div>
    </div>
  );
}