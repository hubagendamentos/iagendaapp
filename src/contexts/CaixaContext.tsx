import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { FormaPagamento, TipoFinanceiro, StatusLancamento, OrigemLancamento } from "@/types/financeiro";

export type TipoMovimentacao = TipoFinanceiro;
export type { FormaPagamento };

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
  tipo: TipoFinanceiro;
  origem: OrigemLancamento;
  atendimentoId: string;
  paciente: string;
  profissional: string;
  profissionalId: string;
  valor: number;
  formaPagamento: FormaPagamento;
  planoContas: string;
  observacao?: string;
  dataHora: string;
  // novos campos do módulo financeiro
  contaFinanceiraId?: string;
  centroResultadoId?: string;
  descricao?: string;
  competencia?: string;
  status: StatusLancamento;
  appointmentId?: string;
  transferenciaId?: string;
  usuarioId?: string;
  usuarioNome?: string;
  criadoEm?: string;
  canceladoEm?: string;
  canceladoPor?: string;
  motivoCancelamento?: string;
}

interface CaixaContextType {
  lancamentos: LancamentoCaixa[];
  addLancamento: (lancamento: Omit<LancamentoCaixa, "id" | "status"> & { status?: StatusLancamento }) => LancamentoCaixa;
  cancelarLancamento: (id: string, motivo: string, usuarioNome: string) => void;
  addTransferencia: (params: {
    contaOrigemId: string;
    contaDestinoId: string;
    valor: number;
    dataHora: string;
    descricao?: string;
    usuarioNome: string;
  }) => void;
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

  const addLancamento = useCallback(
    (lancamento: Omit<LancamentoCaixa, "id" | "status"> & { status?: StatusLancamento }) => {
      const novo: LancamentoCaixa = {
        ...lancamento,
        id: crypto.randomUUID(),
        status: lancamento.status ?? "confirmado",
        criadoEm: lancamento.criadoEm ?? new Date().toISOString(),
      };
      setLancamentos((prev) => [...prev, novo]);
      return novo;
    },
    []
  );

  const cancelarLancamento = useCallback((id: string, motivo: string, usuarioNome: string) => {
    setLancamentos((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: "cancelado",
              canceladoEm: new Date().toISOString(),
              canceladoPor: usuarioNome,
              motivoCancelamento: motivo,
            }
          : l
      )
    );
  }, []);

  const addTransferencia = useCallback(
    ({ contaOrigemId, contaDestinoId, valor, dataHora, descricao, usuarioNome }: {
      contaOrigemId: string;
      contaDestinoId: string;
      valor: number;
      dataHora: string;
      descricao?: string;
      usuarioNome: string;
    }) => {
      const transferenciaId = crypto.randomUUID();
      const base = {
        atendimentoId: "",
        paciente: "",
        profissional: "",
        profissionalId: "",
        formaPagamento: "transferencia" as FormaPagamento,
        planoContas: "transferencia",
        dataHora,
        valor,
        origem: "transferencia" as OrigemLancamento,
        descricao: descricao ?? "Transferência entre contas",
        status: "confirmado" as StatusLancamento,
        transferenciaId,
        usuarioNome,
        criadoEm: new Date().toISOString(),
      };
      setLancamentos((prev) => [
        ...prev,
        { ...base, id: crypto.randomUUID(), tipo: "saida", contaFinanceiraId: contaOrigemId },
        { ...base, id: crypto.randomUUID(), tipo: "entrada", contaFinanceiraId: contaDestinoId },
      ]);
    },
    []
  );

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
    <CaixaContext.Provider value={{ lancamentos, addLancamento, cancelarLancamento, addTransferencia, getLancamentosByAtendimentoId, pagamentos, addPagamentos, getPagamentosByAtendimentoId, getTotalPagoByAtendimentoId }}>
      {children}
    </CaixaContext.Provider>
  );
};