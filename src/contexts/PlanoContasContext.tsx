import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { TipoFinanceiro } from "@/types/financeiro";

export type TipoPlanoContas = "receita" | "despesa";

export interface PlanoContas {
  id: string;
  nome: string;
  tipo: TipoPlanoContas;
  tipoFinanceiro: TipoFinanceiro;
  categoriaPaiId: string | null;
  cor?: string;
  icone?: string;
  ativo: boolean;
}

interface PlanoContasContextType {
  planos: PlanoContas[];
  addPlano: (plano: Omit<PlanoContas, "id">) => void;
  updatePlano: (id: string, data: Partial<PlanoContas>) => void;
  getPlanoById: (id: string) => PlanoContas | undefined;
  getPlanosReceita: () => PlanoContas[];
  getPlanosEntrada: () => PlanoContas[];
  getPlanosSaida: () => PlanoContas[];
  getPlanoNome: (id: string) => string;
}

const PlanoContasContext = createContext<PlanoContasContextType | null>(null);

export const usePlanoContas = () => {
  const ctx = useContext(PlanoContasContext);
  if (!ctx) throw new Error("usePlanoContas must be used within PlanoContasProvider");
  return ctx;
};

const initialPlanos: PlanoContas[] = [
  // Receitas / Entradas
  { id: "pc-1", nome: "Consulta", tipo: "receita", tipoFinanceiro: "entrada", categoriaPaiId: null, ativo: true, cor: "#10b981" },
  { id: "pc-2", nome: "Procedimento", tipo: "receita", tipoFinanceiro: "entrada", categoriaPaiId: null, ativo: true, cor: "#10b981" },
  { id: "pc-3", nome: "Exame", tipo: "receita", tipoFinanceiro: "entrada", categoriaPaiId: null, ativo: true, cor: "#10b981" },
  { id: "pc-4", nome: "Retorno", tipo: "receita", tipoFinanceiro: "entrada", categoriaPaiId: null, ativo: true, cor: "#10b981" },
  { id: "pc-5", nome: "Outros", tipo: "receita", tipoFinanceiro: "entrada", categoriaPaiId: null, ativo: true, cor: "#10b981" },
  // Despesas / Saídas
  { id: "pc-10", nome: "Pagamento Funcionários", tipo: "despesa", tipoFinanceiro: "saida", categoriaPaiId: null, ativo: true, cor: "#ef4444" },
  { id: "pc-11", nome: "Aluguel", tipo: "despesa", tipoFinanceiro: "saida", categoriaPaiId: null, ativo: true, cor: "#ef4444" },
  { id: "pc-12", nome: "Energia Elétrica", tipo: "despesa", tipoFinanceiro: "saida", categoriaPaiId: null, ativo: true, cor: "#ef4444" },
  { id: "pc-13", nome: "Marketing", tipo: "despesa", tipoFinanceiro: "saida", categoriaPaiId: null, ativo: true, cor: "#ef4444" },
  { id: "pc-14", nome: "Materiais", tipo: "despesa", tipoFinanceiro: "saida", categoriaPaiId: null, ativo: true, cor: "#ef4444" },
  // Transferência (técnico)
  { id: "transferencia", nome: "Transferência entre contas", tipo: "receita", tipoFinanceiro: "entrada", categoriaPaiId: null, ativo: true, cor: "#64748b" },
];

export const PlanoContasProvider = ({ children }: { children: ReactNode }) => {
  const [planos, setPlanos] = useState<PlanoContas[]>(initialPlanos);

  const addPlano = useCallback((plano: Omit<PlanoContas, "id">) => {
    setPlanos((prev) => [...prev, { ...plano, id: crypto.randomUUID() }]);
  }, []);

  const updatePlano = useCallback((id: string, data: Partial<PlanoContas>) => {
    setPlanos((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }, []);

  const getPlanoById = useCallback((id: string) => planos.find((p) => p.id === id), [planos]);

  const getPlanosReceita = useCallback(() => planos.filter((p) => p.tipo === "receita" && p.ativo), [planos]);

  const getPlanosEntrada = useCallback(() => planos.filter((p) => p.tipoFinanceiro === "entrada" && p.ativo && p.id !== "transferencia"), [planos]);
  const getPlanosSaida = useCallback(() => planos.filter((p) => p.tipoFinanceiro === "saida" && p.ativo), [planos]);

  const getPlanoNome = useCallback((id: string) => {
    const found = planos.find((p) => p.id === id);
    return found?.nome || id;
  }, [planos]);

  return (
    <PlanoContasContext.Provider value={{ planos, addPlano, updatePlano, getPlanoById, getPlanosReceita, getPlanosEntrada, getPlanosSaida, getPlanoNome }}>
      {children}
    </PlanoContasContext.Provider>
  );
};