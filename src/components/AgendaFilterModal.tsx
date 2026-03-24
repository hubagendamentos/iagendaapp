import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

export interface AgendaFilters {
  professionalId: string | null;
  startTime: string | null;
  endTime: string | null;
  date: Date | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (filters: AgendaFilters) => void;
  currentFilters: AgendaFilters;
  professionals: { id: string; name: string }[];
  showProfessionalFilter: boolean;
}

const timeSlots = Array.from({ length: 21 }, (_, i) => {
  const h = Math.floor(i / 2) + 8;
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

const AgendaFilterModal = ({ open, onClose, onApply, currentFilters, professionals, showProfessionalFilter }: Props) => {
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    if (open) {
      setProfessionalId(currentFilters.professionalId);
      setStartTime(currentFilters.startTime);
      setEndTime(currentFilters.endTime);
      setDate(currentFilters.date);
    }
  }, [open, currentFilters]);

  const handleApply = () => {
    onApply({ professionalId, startTime, endTime, date });
    onClose();
  };

  const handleClear = () => {
    const empty: AgendaFilters = { professionalId: null, startTime: null, endTime: null, date: null };
    onApply(empty);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filtrar Agenda</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {showProfessionalFilter && (
            <div className="space-y-1.5">
              <Label>Profissional</Label>
              <Select value={professionalId || "__all__"} onValueChange={(v) => setProfessionalId(v === "__all__" ? null : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todos</SelectItem>
                  {professionals.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Hora inicial</Label>
              <Select value={startTime || "__none__"} onValueChange={(v) => setStartTime(v === "__none__" ? null : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Início" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Todas</SelectItem>
                  {timeSlots.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Hora final</Label>
              <Select value={endTime || "__none__"} onValueChange={(v) => setEndTime(v === "__none__" ? null : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Fim" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Todas</SelectItem>
                  {timeSlots.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy") : "Qualquer data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date || undefined}
                  onSelect={(d) => setDate(d || null)}
                  locale={ptBR}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClear} className="flex-1">
              Limpar filtro
            </Button>
            <Button type="button" onClick={handleApply} className="flex-1">
              Aplicar filtro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgendaFilterModal;
