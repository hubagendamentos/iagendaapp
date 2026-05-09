import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Wallet, Building2, CreditCard } from "lucide-react";
import { useFinancialAccounts, type FinancialAccount } from "@/contexts/FinancialAccountsContext";
import { ContaFinanceiraModal } from "@/components/financeiro/ContaFinanceiraModal";
import { MoneyText } from "@/components/financeiro/MoneyText";
import { TIPO_CONTA_LABELS } from "@/types/financeiro";
import { toast } from "sonner";

const tipoIcon = { caixa: Wallet, banco: Building2, carteira: CreditCard } as const;

export default function ContasFinanceiras() {
  const { accounts, addAccount, updateAccount, getSaldoAtual } = useFinancialAccounts();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<FinancialAccount | null>(null);

  const handleSave = (data: Omit<FinancialAccount, "id"> & { id?: string }) => {
    if (data.id) {
      const { id, ...rest } = data;
      updateAccount(id, rest);
      toast.success("Conta atualizada");
    } else {
      const { id: _, ...rest } = data;
      addAccount(rest);
      toast.success("Conta criada");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader
        title="Contas Financeiras"
        subtitle="Caixas, bancos e carteiras onde o dinheiro entra e sai."
        action={
          <Button onClick={() => { setEditing(null); setModal(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Nova Conta
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((a) => {
          const Icon = tipoIcon[a.tipo];
          const saldo = getSaldoAtual(a.id);
          return (
            <div key={a.id} className="rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: a.cor }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{a.nome}</p>
                    <p className="text-xs text-muted-foreground">{TIPO_CONTA_LABELS[a.tipo]}{!a.ativo && " · Inativo"}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setEditing(a); setModal(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 pt-3 border-t">
                <p className="text-xs text-muted-foreground">Saldo atual</p>
                <MoneyText value={saldo} tipo={saldo >= 0 ? "neutro" : "saida"} className="text-xl" />
              </div>
            </div>
          );
        })}
      </div>

      <ContaFinanceiraModal open={modal} onClose={() => setModal(false)} conta={editing} onSave={handleSave} />
    </div>
  );
}