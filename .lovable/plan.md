## Evolução do Módulo Financeiro — Mais Clínica (v2)

Plano revisado com os ajustes solicitados: separação Conta Financeira × Centro de Resultado, saldo atual, status do lançamento, transferências, competência e enum padronizado.

### 1. Navegação

Submenu **Financeiro** (sidebar colapsável):
- Fluxo de Caixa — `/dashboard/financeiro/fluxo`
- Lançamentos — `/dashboard/financeiro/lancamentos`
- Contas Financeiras — `/dashboard/financeiro/contas`
- Centros de Resultado — `/dashboard/financeiro/centros`
- Plano de Contas — `/dashboard/financeiro/plano-contas`
- Fechamento de Caixa — `/dashboard/financeiro/fechamento`

Alias mantido: `/dashboard/financeiro/caixa` → redirect para `/fluxo` (preserva bookmarks/sidebar antiga).

### 2. Modelo de dados

**Enum central** (`src/types/financeiro.ts`)
```ts
export type FormaPagamento =
  | "dinheiro" | "pix" | "credito" | "debito"
  | "boleto" | "transferencia" | "convenio";

export type TipoFinanceiro = "entrada" | "saida";
export type StatusLancamento = "confirmado" | "cancelado";
export type OrigemLancamento = "manual" | "agenda" | "sistema" | "transferencia";
export type TipoConta = "caixa" | "banco" | "carteira";
```

**`FinancialAccountsContext`** (Contas Financeiras — onde o dinheiro entra/sai)
```ts
interface FinancialAccount {
  id; nome; tipo: TipoConta;
  cor; saldoInicial: number;
  ativo; observacao?;
}
// + getSaldoAtual(id) calculado em tempo real (saldoInicial + entradas - saídas confirmadas)
```
Seeds: Caixa Principal, Caixa Recepção, Banco Inter, Conta PJ.

**`CentrosResultadoContext`** (opcional para DRE futura)
```ts
interface CentroResultado { id; nome; cor; ativo; }
```
Seeds: Recepção, Administrativo, Marketing, Unidade Centro.

**`PlanoContasContext`** — estender
```ts
interface PlanoContas {
  id; nome;
  tipoFinanceiro: TipoFinanceiro;   // dirige comportamento
  categoria: "receita" | "despesa";
  categoriaPaiId: string | null;    // hierarquia
  cor?; icone?; ativo;
}
```

**`CaixaContext`** — `LancamentoCaixa` enriquecido
```ts
interface LancamentoCaixa {
  id;
  contaFinanceiraId: string;        // obrigatório
  centroResultadoId?: string;       // opcional
  planoContasId: string;            // obrigatório
  tipo: TipoFinanceiro;             // derivado do plano
  valor: number;                    // > 0
  formaPagamento: FormaPagamento;
  descricao?: string;
  dataHora: string;                 // data do pagamento
  competencia?: string;             // mês contábil (YYYY-MM-DD)
  status: StatusLancamento;         // padrão "confirmado"
  origem: OrigemLancamento;
  appointmentId?: string;
  transferenciaId?: string;         // par de lançamentos
  usuarioId; usuarioNome;
  criadoEm; canceladoEm?; canceladoPor?;
}
```
Funções: `addLancamentoManual`, `cancelarLancamento` (não deleta — muda status), `addTransferencia` (gera dois lançamentos atômicos com mesmo `transferenciaId`).

### 3. Telas

**Contas Financeiras** — cards com cor, tipo, saldo inicial, **saldo atual** (calculado), status. Modal CRUD.

**Centros de Resultado** — lista simples + modal CRUD.

**Plano de Contas** — **árvore expansível com indentação visual** (Collapsible), chip de tipo Entrada/Saída colorido, cor/ícone editáveis, hierarquia via `categoriaPaiId`. Modal CRUD com select de pai.

**Lançamentos** — tabela com filtros sticky (período, conta, centro, tipo, plano, forma pgto, status, usuário, origem) + botão "Novo Lançamento" e "Transferência":
- Modal Lançamento: ao trocar plano → atualiza badge tipo, cor e limpa inconsistências automaticamente; campos: conta, centro (opcional), valor, forma, data, **competência** (default = data), descrição.
- Modal Transferência: conta origem → conta destino, valor, data, descrição. Gera par.
- Cancelados aparecem com risco e badge cinza; botão "Cancelar" pede motivo.

**Fluxo de Caixa**:
- Header sticky com Saldo Geral, Entradas Hoje, Saídas Hoje, Saldo do Dia
- Linha de cards menores: saldo atual por conta financeira
- Filtros sticky abaixo
- Tabela: linhas com fundo `bg-success/5` para entradas e `bg-destructive/5` para saídas, hover elegante, chip de forma pgto, valor colorido, status como badge. Cancelados riscados.

**Fechamento de Caixa**:
- Seleção de conta + data
- Mostra: valor esperado (calculado), campo "valor informado", diferença automática colorida, campo observação, botão "Confirmar fechamento"
- Histórico de fechamentos abaixo

### 4. Integração com Agenda / Recebimento

Modal de recebimento (existente) ganha campos obrigatórios:
- Conta Financeira (Select)
- Plano de Contas (filtrado por `tipoFinanceiro = entrada`)
- Forma de Pagamento (enum padronizado)
- Centro de Resultado (opcional)

Gera `LancamentoCaixa` com `origem: "agenda"`, `appointmentId`, `status: "confirmado"`.

### 5. Dashboard Financeiro (estilo Omie/ContaAzul/iClinic)

Cards compactos + 3 gráficos responsivos enxutos:
- Receitas × Despesas (barras agrupadas por mês)
- Entradas por Forma de Pagamento (donut)
- Receitas por Conta Financeira (barras horizontais)

Sem excessos visuais — segue padrão limpo já estabelecido no dashboard.

### 6. Design system

- Tokens semânticos (`--success`, `--destructive`, `--muted`) — zero cor hardcoded
- Componentes reutilizáveis: `PaymentChip`, `TipoBadge`, `StatusBadge`, `MoneyText`
- Consistência com PageHeader, modais full-screen mobile, sticky no desktop

### Detalhes técnicos

- Estado em React Context (in-memory) — segue padrão atual
- Validações com zod nos modais
- Saldo atual = `useMemo` derivado dos lançamentos confirmados
- Transferências: 1 saída + 1 entrada com `transferenciaId` compartilhado, plano padrão "Transferência entre contas"
- Cancelamento nunca remove fisicamente (auditoria)

### Arquivos a criar

```
src/types/financeiro.ts
src/contexts/FinancialAccountsContext.tsx
src/contexts/CentrosResultadoContext.tsx
src/pages/financeiro/FluxoCaixa.tsx
src/pages/financeiro/Lancamentos.tsx
src/pages/financeiro/ContasFinanceiras.tsx
src/pages/financeiro/CentrosResultado.tsx
src/pages/financeiro/PlanoContasPage.tsx
src/pages/financeiro/FechamentoCaixa.tsx
src/components/financeiro/LancamentoModal.tsx
src/components/financeiro/TransferenciaModal.tsx
src/components/financeiro/ContaFinanceiraModal.tsx
src/components/financeiro/CentroResultadoModal.tsx
src/components/financeiro/PlanoContasModal.tsx
src/components/financeiro/PlanoContasTree.tsx
src/components/financeiro/PaymentChip.tsx
src/components/financeiro/TipoBadge.tsx
src/components/financeiro/StatusBadge.tsx
src/components/financeiro/MoneyText.tsx
```

### Arquivos a editar

- `src/App.tsx` — providers + rotas + alias
- `src/contexts/PlanoContasContext.tsx` — `tipoFinanceiro`, cor, ícone
- `src/contexts/CaixaContext.tsx` — novos campos + cancelar + transferência
- Sidebar (submenu Financeiro)
- Modal de recebimento da agenda (campos obrigatórios)
- `src/pages/Caixa.tsx` — redirect para `/financeiro/fluxo`
