import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type TipoMovimentacao = "entrada" | "saida";
export type FormaPagamento = "dinheiro" | "pix" | "cartao" | "convenio" | "outros";

export interface PagamentoAtendimento {
  id: string;
  atendimentoId: string;
  valor: number;
  formaPagamento: FormaPagamento;
  planoContas: string;
  dataHora: string;
  usuario: string;
  origem: string;
}

export interface LancamentoCaixa {
  id: string;
  tipo: TipoMovimentacao;
  origem: string;
  atendimentoId: string;
  paciente: string;
  profissional: string;
  profissionalId: string;
  valor: number;
  formaPagamento: FormaPagamento;
  planoContas: string;
  observacao?: string;
  dataHora: string;
}

interface CaixaContextType {
  lancamentos: LancamentoCaixa[];
  addLancamento: (lancamento: Omit<LancamentoCaixa, "id">) => void;
  getLancamentosByAtendimentoId: (atendimentoId: string) => LancamentoCaixa[];
  pagamentos: PagamentoAtendimento[];
  addPagamentos: (pagamentos: Omit<PagamentoAtendimento, "id">[]) => void;
  getPagamentosByAtendimentoId: (atendimentoId: string) => PagamentoAtendimento[];
  getTotalPagoByAtendimentoId: (atendimentoId: string) => number;
}

const CaixaContext = createContext<CaixaContextType | null>(null);

export const useCaixa = () => {
  const ctx = useContext(CaixaContext);
  if (!ctx) throw new Error("useCaixa must be used within CaixaProvider");
  return ctx;
};

export const CaixaProvider = ({ children }: { children: ReactNode }) => {
  const [lancamentos, setLancamentos] = useState<LancamentoCaixa[]>([]);
  const [pagamentos, setPagamentos] = useState<PagamentoAtendimento[]>([]);

  const addLancamento = useCallback((lancamento: Omit<LancamentoCaixa, "id">) => {
    setLancamentos((prev) => [
      ...prev,
      { ...lancamento, id: crypto.randomUUID() },
    ]);
  }, []);

  const getLancamentosByAtendimentoId = useCallback(
    (atendimentoId: string) => lancamentos.filter((l) => l.atendimentoId === atendimentoId),
    [lancamentos]
  );

  const addPagamentos = useCallback((newPagamentos: Omit<PagamentoAtendimento, "id">[]) => {
    setPagamentos((prev) => [
      ...prev,
      ...newPagamentos.map((p) => ({ ...p, id: crypto.randomUUID() })),
    ]);
  }, []);

  const getPagamentosByAtendimentoId = useCallback(
    (atendimentoId: string) => pagamentos.filter((p) => p.atendimentoId === atendimentoId),
    [pagamentos]
  );

  const getTotalPagoByAtendimentoId = useCallback(
    (atendimentoId: string) => pagamentos.filter((p) => p.atendimentoId === atendimentoId).reduce((s, p) => s + p.valor, 0),
    [pagamentos]
  );

  return (
    <CaixaContext.Provider value={{ lancamentos, addLancamento, getLancamentosByAtendimentoId, pagamentos, addPagamentos, getPagamentosByAtendimentoId, getTotalPagoByAtendimentoId }}>
      {children}
    </CaixaContext.Provider>
  );
};