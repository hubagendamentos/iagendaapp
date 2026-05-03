import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type TipoPlanoContas = "receita" | "despesa";

export interface PlanoContas {
  id: string;
  nome: string;
  tipo: TipoPlanoContas;
  categoriaPaiId: string | null;
  ativo: boolean;
}

interface PlanoContasContextType {
  planos: PlanoContas[];
  addPlano: (plano: Omit<PlanoContas, "id">) => void;
  updatePlano: (id: string, data: Partial<PlanoContas>) => void;
  getPlanoById: (id: string) => PlanoContas | undefined;
  getPlanosReceita: () => PlanoContas[];
  getPlanoNome: (id: string) => string;
}

const PlanoContasContext = createContext<PlanoContasContextType | null>(null);

export const usePlanoContas = () => {
  const ctx = useContext(PlanoContasContext);
  if (!ctx) throw new Error("usePlanoContas must be used within PlanoContasProvider");
  return ctx;
};

const initialPlanos: PlanoContas[] = [
  { id: "pc-1", nome: "Consulta", tipo: "receita", categoriaPaiId: null, ativo: true },
  { id: "pc-2", nome: "Procedimento", tipo: "receita", categoriaPaiId: null, ativo: true },
  { id: "pc-3", nome: "Exame", tipo: "receita", categoriaPaiId: null, ativo: true },
  { id: "pc-4", nome: "Retorno", tipo: "receita", categoriaPaiId: null, ativo: true },
  { id: "pc-5", nome: "Outros", tipo: "receita", categoriaPaiId: null, ativo: true },
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

  const getPlanoNome = useCallback((id: string) => {
    const found = planos.find((p) => p.id === id);
    return found?.nome || id;
  }, [planos]);

  return (
    <PlanoContasContext.Provider value={{ planos, addPlano, updatePlano, getPlanoById, getPlanosReceita, getPlanoNome }}>
      {children}
    </PlanoContasContext.Provider>
  );
};