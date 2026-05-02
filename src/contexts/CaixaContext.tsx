import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type TipoMovimentacao = "entrada" | "saida";
export type FormaPagamento = "dinheiro" | "pix" | "cartao" | "convenio" | "outros";

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
  getLancamentoByAtendimentoId: (atendimentoId: string) => LancamentoCaixa | undefined;
}

const CaixaContext = createContext<CaixaContextType | null>(null);

export const useCaixa = () => {
  const ctx = useContext(CaixaContext);
  if (!ctx) throw new Error("useCaixa must be used within CaixaProvider");
  return ctx;
};

export const CaixaProvider = ({ children }: { children: ReactNode }) => {
  const [lancamentos, setLancamentos] = useState<LancamentoCaixa[]>([]);

  const addLancamento = useCallback((lancamento: Omit<LancamentoCaixa, "id">) => {
    setLancamentos((prev) => [
      ...prev,
      { ...lancamento, id: crypto.randomUUID() },
    ]);
  }, []);

  const getLancamentoByAtendimentoId = useCallback(
    (atendimentoId: string) => lancamentos.find((l) => l.atendimentoId === atendimentoId),
    [lancamentos]
  );

  return (
    <CaixaContext.Provider value={{ lancamentos, addLancamento, getLancamentoByAtendimentoId }}>
      {children}
    </CaixaContext.Provider>
  );
};