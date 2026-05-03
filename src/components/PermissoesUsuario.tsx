import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserPermissions } from "@/contexts/UserContext";
import { memo } from "react";

interface PermissoesUsuarioProps {
  permissions: Partial<UserPermissions>;
  onChange: (
    updater:
      | Partial<UserPermissions>
      | ((prev: Partial<UserPermissions>) => Partial<UserPermissions>)
  ) => void;
  disabled?: boolean;
}

// 🔥 ITEM MEMOIZADO (evita re-render desnecessário)
const PermissionItem = memo(function PermissionItem({
  id,
  label,
  description,
  checked,
  onToggle,
  disabled,
  hidden = false,
}: {
  id: keyof UserPermissions;
  label: string;
  description?: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
  hidden?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between space-x-2 rounded-lg border p-4 shadow-sm bg-card transition-all ${hidden ? "opacity-0 pointer-events-none absolute" : ""
        }`}
    >
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-base cursor-pointer">
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onToggle}
        disabled={disabled}
      />
    </div>
  );
});

export function PermissoesUsuario({
  permissions,
  onChange,
  disabled,
}: PermissoesUsuarioProps) {
  // ✅ update funcional (sem recriar tudo)
  const handleToggle = (key: keyof UserPermissions, checked: boolean) => {
    onChange((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  return (
    <div className="space-y-6">
      {/* 🔵 MÓDULOS */}
      <div>
        <h3 className="text-lg font-medium mb-4">Acesso a Módulos</h3>

        <div className="grid gap-4 sm:grid-cols-2 relative">
          <PermissionItem
            id="agenda"
            label="Agenda"
            description="Ver e gerenciar a agenda"
            checked={!!permissions.agenda}
            onToggle={(v) => handleToggle("agenda", v)}
            disabled={disabled}
          />

          <PermissionItem
            id="atendimentos"
            label="Atendimentos"
            description="Acesso ao atendimento e prontuário"
            checked={!!permissions.atendimentos}
            onToggle={(v) => handleToggle("atendimentos", v)}
            disabled={disabled}
          />

          <PermissionItem
            id="pacientes"
            label="Pacientes"
            description="Ver e editar pacientes"
            checked={!!permissions.pacientes}
            onToggle={(v) => handleToggle("pacientes", v)}
            disabled={disabled}
          />

          <PermissionItem
            id="financeiro"
            label="Financeiro"
            description="Controle de caixa e pagamentos"
            checked={!!permissions.financeiro}
            onToggle={(v) => handleToggle("financeiro", v)}
            disabled={disabled}
          />

          <PermissionItem
            id="relatorios"
            label="Relatórios"
            description="Visualizar relatórios e métricas"
            checked={!!permissions.relatorios}
            onToggle={(v) => handleToggle("relatorios", v)}
            disabled={disabled}
          />

          <PermissionItem
            id="comunicacao"
            label="Comunicação"
            description="Mensagens, automações e histórico"
            checked={!!permissions.comunicacao}
            onToggle={(v) => handleToggle("comunicacao", v)}
            disabled={disabled}
          />

          <PermissionItem
            id="usuarios"
            label="Usuários"
            description="Gerenciar equipe"
            checked={!!permissions.usuarios}
            onToggle={(v) => handleToggle("usuarios", v)}
            disabled={disabled}
          />

          <PermissionItem
            id="profissionais"
            label="Profissionais"
            description="Gerenciar profissionais"
            checked={!!permissions.profissionais}
            onToggle={(v) => handleToggle("profissionais", v)}
            disabled={disabled}
          />

          <PermissionItem
            id="configuracoes"
            label="Configurações"
            description="Ajustes gerais do sistema"
            checked={!!permissions.configuracoes}
            onToggle={(v) => handleToggle("configuracoes", v)}
            disabled={disabled}
          />

          {/* 🔥 NÃO REMOVE DO DOM → só esconde */}
          <PermissionItem
            id="pagamentos"
            label="Pagamentos"
            description="Formas de pagamento e cobranças"
            checked={!!permissions.pagamentos}
            onToggle={(v) => handleToggle("pagamentos", v)}
            disabled={disabled}
            hidden={!permissions.configuracoes}
          />

          <PermissionItem
            id="notificacoes"
            label="Notificações"
            description="Configuração de envios automáticos"
            checked={!!permissions.notificacoes}
            onToggle={(v) => handleToggle("notificacoes", v)}
            disabled={disabled}
            hidden={!permissions.configuracoes}
          />

          <PermissionItem
            id="cadastros"
            label="Cadastros"
            description="Serviços, planos e exames"
            checked={!!permissions.cadastros}
            onToggle={(v) => handleToggle("cadastros", v)}
            disabled={disabled}
          />

          <PermissionItem
            id="assinatura"
            label="Assinatura"
            description="Planos e faturamento"
            checked={!!permissions.assinatura}
            onToggle={(v) => handleToggle("assinatura", v)}
            disabled={disabled}
          />
        </div>
      </div>

      {/* 🟣 AÇÕES */}
      <div>
        <h3 className="text-lg font-medium mb-4">Ações</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <PermissionItem
            id="podeConfirmar"
            label="Confirmar Agendamento"
            checked={!!permissions.podeConfirmar}
            onToggle={(v) => handleToggle("podeConfirmar", v)}
            disabled={disabled}
          />

          <PermissionItem
            id="podeCancelar"
            label="Cancelar Agendamento"
            checked={!!permissions.podeCancelar}
            onToggle={(v) => handleToggle("podeCancelar", v)}
            disabled={disabled}
          />

          <PermissionItem
            id="podeMarcarFalta"
            label="Marcar como Falta"
            checked={!!permissions.podeMarcarFalta}
            onToggle={(v) => handleToggle("podeMarcarFalta", v)}
            disabled={disabled}
          />

          <PermissionItem
            id="podeIniciar"
            label="Iniciar Atendimento"
            checked={!!permissions.podeIniciar}
            onToggle={(v) => handleToggle("podeIniciar", v)}
            disabled={disabled}
          />

          <PermissionItem
            id="podeFinalizar"
            label="Finalizar Atendimento"
            checked={!!permissions.podeFinalizar}
            onToggle={(v) => handleToggle("podeFinalizar", v)}
            disabled={disabled}
          />

          <PermissionItem
            id="podeEditarFicha"
            label="Editar Atendimento"
            description="Permite adicionar evolução clínica"
            checked={!!permissions.podeEditarFicha}
            onToggle={(v) => handleToggle("podeEditarFicha", v)}
            disabled={disabled}
          />
          <PermissionItem
            id="encerrarAtendimentoFinanceiro"
            label="Encerrar Atendimento (Financeiro)"
            description="Permite lançar pagamentos e enviar para o caixa"
            checked={!!permissions.encerrarAtendimentoFinanceiro}
            onToggle={(v) => handleToggle("encerrarAtendimentoFinanceiro", v)}
            disabled={disabled}
          />
          <PermissionItem
            id="podeVerProntuario"
            label="Ver Prontuário"
            description="Permite abrir o prontuário do paciente"
            checked={!!permissions.podeVerProntuario}
            onToggle={(v) => handleToggle("podeVerProntuario", v)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}