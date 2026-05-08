import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface Item {
  name: string;
  atendimentos: number;
}

export function DashboardProfessionalRanking({ data }: { data: Item[] }) {
  const ranked = [...data].sort((a, b) => b.atendimentos - a.atendimentos);
  const max = Math.max(1, ...ranked.map((r) => r.atendimentos));

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Ranking de profissionais</h3>
      </div>
      <div className="space-y-2.5">
        {ranked.map((p, i) => (
          <div key={p.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground truncate">
                <span className="text-muted-foreground mr-1.5">#{i + 1}</span>
                {p.name}
              </span>
              <span className="tabular-nums text-muted-foreground">{p.atendimentos}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                style={{ width: `${(p.atendimentos / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
