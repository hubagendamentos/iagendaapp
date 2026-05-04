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
  onIniciar: () => void;
  onFinalizar: () => void;
}

export function PainelAtendimento({ appointmentId, status, duration, onIniciar, onFinalizar }: Props) {
  const { hasPermission } = useUser();
  const crono = useCronometro(appointmentId);

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("painel_collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("painel_collapsed", String(collapsed));
  }, [collapsed]);

  const handleIniciar = () => {
    crono.iniciar();
    onIniciar();
  };

  const handleFinalizar = () => {
    crono.parar();
    onFinalizar();
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 py-3 print:hidden">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(false)} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Expandir painel</TooltipContent>
        </Tooltip>
        {crono.rodando && (
          <span className="font-mono text-xs text-primary writing-mode-vertical">{crono.formatado}</span>
        )}
      </div>
    );
  }

  return (
    <div className="w-[180px] shrink-0 border rounded-xl bg-card p-4 flex flex-col gap-4 print:hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Atendimento</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCollapsed(true)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Ocultar painel</TooltipContent>
        </Tooltip>
      </div>

      {/* Cronômetro */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5">
          <Timer className={cn("h-4 w-4", crono.rodando && "text-primary animate-pulse")} />
          <span className="font-mono text-2xl font-bold">{crono.formatado}</span>
        </div>
        {duration && (
          <p className="text-xs text-muted-foreground">Previsto: {duration}min</p>
        )}
      </div>

      {/* Botões */}
      {status !== "in_progress" && hasPermission("podeIniciar") && (
        <Button className="w-full" onClick={handleIniciar}>
          <PlayCircle className="h-4 w-4 mr-1.5" /> Iniciar
        </Button>
      )}

      {status === "in_progress" && hasPermission("podeFinalizar") && (
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleFinalizar}>
          <CheckCircle2 className="h-4 w-4 mr-1.5" /> Finalizar
        </Button>
      )}
    </div>
  );
}