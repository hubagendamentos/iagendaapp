import { useState, useMemo } from "react";
import { format, isToday, subDays, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, X, FileText, Pill, Paperclip, PlayCircle, ChevronDown, ChevronUp, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { TimelineItem } from "@/contexts/TimelineContext";

const typeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  note: { icon: <FileText className="h-3.5 w-3.5" />, label: "Evolução", color: "text-emerald-600" },
  prescription: { icon: <Pill className="h-3.5 w-3.5" />, label: "Receita", color: "text-purple-600" },
  attachment: { icon: <Paperclip className="h-3.5 w-3.5" />, label: "Anexo", color: "text-amber-600" },
  status: { icon: <PlayCircle className="h-3.5 w-3.5" />, label: "Status", color: "text-blue-600" },
  receita: { icon: <ClipboardList className="h-3.5 w-3.5" />, label: "Receita", color: "text-indigo-600" },
};

type Periodo = "hoje" | "7dias" | "mes" | "tudo";

interface Props {
  items: TimelineItem[];
  currentAppointmentId?: string;
  selectionMode?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onReceitaClick?: (receitaId: string) => void;
}

export function TimelineCompacta({ items, currentAppointmentId, selectionMode, selectedIds = [], onToggleSelect, onReceitaClick }: Props) {
  const [busca, setBusca] = useState("");
  const [periodo, setPeriodo] = useState<Periodo>("tudo");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...items];

    if (busca.trim()) {
      const q = busca.toLowerCase();
      result = result.filter(
        (i) =>
          (i.content?.toLowerCase().includes(q)) ||
          i.createdBy.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q)
      );
    }

    const now = new Date();
    if (periodo === "hoje") {
      result = result.filter((i) => isToday(new Date(i.createdAt)));
    } else if (periodo === "7dias") {
      const limit = subDays(now, 7);
      result = result.filter((i) => new Date(i.createdAt) >= limit);
    } else if (periodo === "mes") {
      const limit = startOfMonth(now);
      result = result.filter((i) => new Date(i.createdAt) >= limit);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [items, busca, periodo]);

  const hasFilter = busca.trim() || periodo !== "tudo";

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, TimelineItem[]>();
    filtered.forEach((item) => {
      const key = format(new Date(item.createdAt), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const periodos: { value: Periodo; label: string }[] = [
    { value: "hoje", label: "Hoje" },
    { value: "7dias", label: "7 dias" },
    { value: "mes", label: "Mês" },
    { value: "tudo", label: "Tudo" },
  ];

  return (
    <div className="flex flex-col h-auto md:h-full rounded-xl border bg-card">
      {/* Filters */}
      <div className="p-3 border-b space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar na timeline..."
            className="pl-8 h-8 text-xs"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {periodos.map((p) => (
            <Button
              key={p.value}
              variant={periodo === p.value ? "default" : "outline"}
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => setPeriodo(p.value)}
            >
              {p.label}
            </Button>
          ))}
          {hasFilter && (
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => { setBusca(""); setPeriodo("tudo"); }}>
              <X className="h-3 w-3 mr-1" /> Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 md:overflow-y-auto overflow-x-hidden divide-y">
        {grouped.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">Nenhum registro encontrado.</p>
        )}
        {grouped.map(([dateKey, dayItems]) => (
          <div key={dateKey}>
            <div className="sticky top-0 z-10 bg-muted/80 backdrop-blur px-3 py-1">
              <span className="text-xs font-semibold text-muted-foreground">
                {format(new Date(dateKey), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
            {dayItems.map((item) => {
              const cfg = typeConfig[item.type] || typeConfig.status;
              const isCurrent = item.appointmentId === currentAppointmentId;
              const isExpanded = expandedId === item.id;
              const time = format(new Date(item.createdAt), "HH:mm");
              const contentLong = (item.content?.length || 0) > 60;

              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-2 px-3 py-2 hover:bg-muted/50 transition-colors ${isCurrent ? "bg-blue-50/50 dark:bg-blue-900/10" : ""} ${selectionMode && selectedIds.includes(item.id) ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                >
                  {selectionMode && (
                    <div className="pt-0.5 shrink-0 mr-1">
                      <Checkbox 
                        checked={selectedIds.includes(item.id)} 
                        onCheckedChange={() => onToggleSelect && onToggleSelect(item.id)} 
                      />
                    </div>
                  )}
                  <span className="font-mono text-[11px] text-muted-foreground w-[36px] shrink-0 pt-0.5 cursor-pointer" onClick={() => contentLong && setExpandedId(isExpanded ? null : item.id)}>{time}</span>
                  <span className={`shrink-0 pt-0.5 ${cfg.color} cursor-pointer`} onClick={() => {
                    if (item.type === "receita" && item.receitaId && onReceitaClick) {
                      onReceitaClick(item.receitaId);
                    } else if (contentLong) {
                      setExpandedId(isExpanded ? null : item.id);
                    }
                  }}>{cfg.icon}</span>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => {
                    if (item.type === "receita" && item.receitaId && onReceitaClick) {
                      onReceitaClick(item.receitaId);
                    } else if (contentLong) {
                      setExpandedId(isExpanded ? null : item.id);
                    }
                  }}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium truncate">{item.createdBy}</span>
                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{cfg.label}</Badge>
                    </div>
                    {item.content && (
                      <div className="flex min-w-0 w-full mt-0.5">
                        <p className={`text-xs text-muted-foreground break-words whitespace-normal w-full ${isExpanded ? "" : "line-clamp-1"}`}>
                          {item.content}
                        </p>
                      </div>
                    )}
                  </div>
                  {contentLong && (
                    <span className="shrink-0 pt-1 text-muted-foreground">
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}