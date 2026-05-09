import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import type { TipoConta } from "@/types/financeiro";
import { useCaixa } from "./CaixaContext";

export interface FinancialAccount {
  id: string;
  nome: string;
  tipo: TipoConta;
  cor: string;
  saldoInicial: number;
  ativo: boolean;
  observacao?: string;
}

interface Ctx {
  accounts: FinancialAccount[];
  addAccount: (a: Omit<FinancialAccount, "id">) => void;
  updateAccount: (id: string, a: Partial<FinancialAccount>) => void;
  getAccountById: (id: string) => FinancialAccount | undefined;
  getSaldoAtual: (id: string) => number;
  getSaldoGeral: () => number;
}

const FinancialAccountsContext = createContext<Ctx | null>(null);

export const useFinancialAccounts = () => {
  const ctx = useContext(FinancialAccountsContext);
  if (!ctx) throw new Error("useFinancialAccounts must be used within FinancialAccountsProvider");
  return ctx;
};

const seed: FinancialAccount[] = [
  { id: "fa-1", nome: "Caixa Principal", tipo: "caixa", cor: "#3b82f6", saldoInicial: 0, ativo: true },
  { id: "fa-2", nome: "Caixa Recepção", tipo: "caixa", cor: "#10b981", saldoInicial: 0, ativo: true },
  { id: "fa-3", nome: "Banco Inter", tipo: "banco", cor: "#f97316", saldoInicial: 0, ativo: true },
  { id: "fa-4", nome: "Conta PJ", tipo: "banco", cor: "#8b5cf6", saldoInicial: 0, ativo: true },
];

export const FinancialAccountsProvider = ({ children }: { children: ReactNode }) => {
  const [accounts, setAccounts] = useState<FinancialAccount[]>(seed);
  const { lancamentos } = useCaixa();

  const addAccount = useCallback((a: Omit<FinancialAccount, "id">) => {
    setAccounts((prev) => [...prev, { ...a, id: crypto.randomUUID() }]);
  }, []);

  const updateAccount = useCallback((id: string, a: Partial<FinancialAccount>) => {
    setAccounts((prev) => prev.map((x) => (x.id === id ? { ...x, ...a } : x)));
  }, []);

  const getAccountById = useCallback((id: string) => accounts.find((a) => a.id === id), [accounts]);

  const saldosPorConta = useMemo(() => {
    const map = new Map<string, number>();
    accounts.forEach((a) => map.set(a.id, a.saldoInicial));
    lancamentos.forEach((l) => {
      if (l.status === "cancelado") return;
      if (!l.contaFinanceiraId) return;
      const cur = map.get(l.contaFinanceiraId) ?? 0;
      map.set(l.contaFinanceiraId, l.tipo === "entrada" ? cur + l.valor : cur - l.valor);
    });
    return map;
  }, [accounts, lancamentos]);

  const getSaldoAtual = useCallback((id: string) => saldosPorConta.get(id) ?? 0, [saldosPorConta]);
  const getSaldoGeral = useCallback(
    () => accounts.filter((a) => a.ativo).reduce((s, a) => s + (saldosPorConta.get(a.id) ?? 0), 0),
    [accounts, saldosPorConta]
  );

  return (
    <FinancialAccountsContext.Provider value={{ accounts, addAccount, updateAccount, getAccountById, getSaldoAtual, getSaldoGeral }}>
      {children}
    </FinancialAccountsContext.Provider>
  );
};