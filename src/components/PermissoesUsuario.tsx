import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserPermissions } from "@/contexts/UserContext";

interface PermissoesUsuarioProps {
  permissions: Partial<UserPermissions>;
  onChange: (permissions: Partial<UserPermissions>) => void;
  disabled?: boolean;
}

export function PermissoesUsuario({ permissions, onChange, disabled }: PermissoesUsuarioProps) {
  const handleToggle = (key: keyof UserPermissions, checked: boolean) => {
    onChange({ ...permissions, [key]: checked });
  };

  const PermissionItem = ({
    id,
    label,
    description,
  }: {
    id: keyof UserPermissions;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between space-x-2 rounded-lg border p-4 shadow-sm bg-card">
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
        checked={!!permissions[id]}
        onCheckedChange={(checked) => handleToggle(id, checked)}
        disabled={disabled}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 🔵 MÓDULOS */}
      <div>
        <h3 className="text-lg font-medium mb-4">Acesso a Módulos</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* PRINCIPAL */}
          <PermissionItem id="agenda" label="Agenda" description="Ver e gerenciar a agenda" />
          <PermissionItem id="atendimentos" label="Atendimentos" description="Acesso ao atendimento e prontuário" />
          <PermissionItem id="pacientes" label="Pacientes" description="Ver e editar pacientes" />

          {/* GESTÃO */}
          <PermissionItem id="financeiro" label="Financeiro" description="Controle de caixa e pagamentos" />
          <PermissionItem id="relatorios" label="Relatórios" description="Visualizar relatórios e métricas" />

          {/* COMUNICAÇÃO */}
          <PermissionItem id="comunicacao" label="Comunicação" description="Mensagens, automações e histórico" />

          {/* ESTRUTURA */}
          <PermissionItem id="usuarios" label="Usuários" description="Gerenciar equipe" />
          <PermissionItem id="profissionais" label="Profissionais" description="Gerenciar profissionais" />

          {/* CONFIG */}
          <PermissionItem id="configuracoes" label="Configurações" description="Ajustes gerais do sistema" />

          {/* SUB-ITENS DE CONFIG (condicional) */}
          {permissions.configuracoes && (
            <>
              <PermissionItem id="pagamentos" label="Pagamentos" description="Formas de pagamento e cobranças" />
              <PermissionItem id="notificacoes" label="Notificações" description="Configuração de envios automáticos" />
            </>
          )}

          {/* CADASTROS */}
          <PermissionItem id="cadastros" label="Cadastros" description="Serviços, planos e exames" />

          {/* COMERCIAL */}
          <PermissionItem id="assinatura" label="Assinatura" description="Planos e faturamento" />
        </div>
      </div>

      {/* 🟣 AÇÕES */}
      <div>
        <h3 className="text-lg font-medium mb-4">Ações</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <PermissionItem id="podeConfirmar" label="Confirmar Agendamento" />
          <PermissionItem id="podeCancelar" label="Cancelar Agendamento" />
          <PermissionItem id="podeMarcarFalta" label="Marcar como Falta" />

          <PermissionItem id="podeIniciar" label="Iniciar Atendimento" />
          <PermissionItem id="podeFinalizar" label="Finalizar Atendimento" />
          <PermissionItem
            id="podeEditarFicha"
            label="Editar Atendimento"
            description="Permite adicionar evolução clínica"
          />
        </div>
      </div>
    </div>
  );
}