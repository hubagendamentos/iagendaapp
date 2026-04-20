import { BadgeCheck, CreditCard, AlertTriangle, ArrowRight, Check } from "lucide-react";
import { useSubscription, PLANS, PlanType } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const Assinatura = () => {
  const { plan, status, trialDaysLeft, usage, changePlan } = useSubscription();

  const usagePercentage = Math.min(Math.round((usage / plan.limit) * 100), 100);
  const isNearLimit = usagePercentage >= 80 && !plan.isEnterprise;
  const isAtLimit = usage >= plan.limit && !plan.isEnterprise;
  const hasOverage = plan.isEnterprise && usage > plan.limit;
  const overageCount = hasOverage ? usage - plan.limit : 0;
  const overageCost = hasOverage ? overageCount * 0.05 : 0;

  const handleUpgrade = (newPlan: PlanType) => {
    changePlan(newPlan);
    toast.success(`Plano alterado para ${newPlan} com sucesso!`);
  };

  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto w-full pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assinatura e Planos</h1>
        <p className="text-muted-foreground mt-1">Gerencie seu plano atual e acompanhe o uso da sua conta.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Plano Atual */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <BadgeCheck className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Plano Atual</h2>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl font-bold text-foreground">{plan.name}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                status === "Trial" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                status === "Ativo" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                "bg-destructive/10 text-destructive border border-destructive/20"
              }`}>
                {status}
              </span>
            </div>
            
            {status === "Trial" && (
              <div className="flex items-center gap-2 mt-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p>Seu período de teste (trial) expira em <strong>{trialDaysLeft} dias</strong>.</p>
              </div>
            )}
            
            {status === "Expirado" && (
              <div className="flex items-center gap-2 mt-4 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p>Sua assinatura expirou. Faça o upgrade para continuar usando.</p>
              </div>
            )}
          </div>
        </div>

        {/* Uso Atual */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Uso Mensal</h2>
              <p className="text-2xl font-bold">
                <span className={isAtLimit ? "text-destructive" : "text-foreground"}>{usage}</span>
                <span className="text-muted-foreground text-lg font-medium mx-1">/</span>
                <span className="text-muted-foreground text-lg">{plan.limit}</span>
                {hasOverage && (
                  <span className="text-amber-500 text-sm font-bold ml-2">
                    (+{overageCount} excedente)
                  </span>
                )}
                <span className="text-sm font-medium text-muted-foreground ml-2">agendamentos</span>
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className={`text-sm font-bold ${
                isAtLimit ? "text-destructive" : isNearLimit ? "text-amber-500" : hasOverage ? "text-amber-500" : "text-emerald-500"
              }`}>
                {hasOverage ? "Excedeu" : `${usagePercentage}%`}
              </span>
            </div>
          </div>
          
          <Progress 
            value={hasOverage ? 100 : usagePercentage} 
            className={`h-3 bg-secondary`}
            indicatorClassName={`${
              isAtLimit ? "bg-destructive" : isNearLimit || hasOverage ? "bg-amber-500" : "bg-emerald-500"
            }`}
          />
          
          {hasOverage ? (
            <p className="text-sm text-amber-600 font-medium mt-3 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Custo excedente: {overageCount} × R$ 0,05 = R$ {overageCost.toFixed(2).replace('.', ',')}
            </p>
          ) : isAtLimit ? (
            <p className="text-sm text-destructive font-medium mt-3 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Você atingiu o limite de agendamentos.
            </p>
          ) : isNearLimit ? (
            <p className="text-sm text-amber-600 font-medium mt-3 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Você está próximo do limite do seu plano.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-3">
              Reset automático em 12 dias.
            </p>
          )}
        </div>
      </div>

      {/* Planos Disponíveis */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-6">Planos Disponíveis</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {(Object.values(PLANS) as Plan[]).map((p) => {
            const isCurrent = p.name === plan.name;
            const isPopular = p.name === "Clínica";
            return (
              <div 
                key={p.id} 
                className={`bg-card rounded-xl p-5 shadow-sm border-2 transition-all flex flex-col relative ${
                  isCurrent ? "border-primary ring-4 ring-primary/10" : isPopular ? "border-emerald-500/50 hover:border-emerald-500" : "border-border hover:border-primary/50"
                }`}
              >
                {isPopular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap">
                    Mais Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg rounded-tr-[9px]">
                    Plano Atual
                  </div>
                )}
                <div className="mb-4 mt-2">
                  <h3 className="text-lg font-bold text-foreground mb-1">{p.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-sm font-medium text-muted-foreground">R$</span>
                    <span className="text-2xl font-bold">{p.price.toFixed(2).replace('.', ',')}</span>
                    <span className="text-xs text-muted-foreground">/mês</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Até {p.limit} agends / mês</p>
                </div>
                
                <div className="py-4 border-t border-border flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-xs">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{p.isEnterprise ? `${p.limit} agendamentos inclusos` : `${p.limit} agendamentos mensais`}</span>
                    </li>
                    {p.isEnterprise && (
                      <li className="flex items-start gap-2 text-xs">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>R$ 0,05 por agendamento extra (sem bloqueio)</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2 text-xs">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Agendamentos ilimitados para profissionais</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Suporte {(p.name === "Clínica" || p.name === "Avançado" || p.isEnterprise) ? "Prioritário" : "Padrão"}</span>
                    </li>
                  </ul>
                </div>
                
                <div className="pt-4 mt-auto">
                  <Button 
                    variant={isCurrent ? "outline" : isPopular ? "default" : "secondary"} 
                    className="w-full text-xs h-9" 
                    disabled={isCurrent}
                    onClick={() => handleUpgrade(p.name)}
                  >
                    {isCurrent ? "Seu Plano" : (
                      <>
                        Selecionar plano <ArrowRight className="ml-1.5 h-3 w-3" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Assinatura;
