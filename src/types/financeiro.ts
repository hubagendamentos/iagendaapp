export type FormaPagamento =
  | "dinheiro"
  | "pix"
  | "credito"
  | "debito"
  | "boleto"
  | "transferencia"
  | "convenio";

export type TipoFinanceiro = "entrada" | "saida";
export type StatusLancamento = "confirmado" | "cancelado";
export type OrigemLancamento = "manual" | "agenda" | "sistema" | "transferencia";
export type TipoConta = "caixa" | "banco" | "carteira";

export const FORMA_PAGAMENTO_LABELS: Record<FormaPagamento, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  credito: "Cartão Crédito",
  debito: "Cartão Débito",
  boleto: "Boleto",
  transferencia: "Transferência",
  convenio: "Convênio",
};

export const TIPO_CONTA_LABELS: Record<TipoConta, string> = {
  caixa: "Caixa",
  banco: "Banco",
  carteira: "Carteira",
};

export const STATUS_LABELS: Record<StatusLancamento, string> = {
  confirmado: "Confirmado",
  cancelado: "Cancelado",
};

export const ORIGEM_LABELS: Record<OrigemLancamento, string> = {
  manual: "Manual",
  agenda: "Agenda",
  sistema: "Sistema",
  transferencia: "Transferência",
};