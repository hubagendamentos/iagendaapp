import { createContext, useContext, useState, ReactNode } from "react";

export type PlanType = "Básico" | "Profissional" | "Clínica" | "Avançado" | "Enterprise";
export type PlanStatus = "Trial" | "Ativo" | "Expirado";

export interface Plan {
  id: string;
  name: PlanType;
  limit: number;
  price: number;
  isEnterprise?: boolean;
}

export const PLANS: Record<PlanType, Plan> = {
  Básico: { id: "basic", name: "Básico", limit: 200, price: 39.90 },
  Profissional: { id: "pro", name: "Profissional", limit: 500, price: 79.90 },
  Clínica: { id: "clinic", name: "Clínica", limit: 1500, price: 149.90 },
  Avançado: { id: "advanced", name: "Avançado", limit: 5000, price: 297.90 },
  Enterprise: { id: "enterprise", name: "Enterprise", limit: 5000, price: 297.90, isEnterprise: true },
};

interface SubscriptionContextType {
  plan: Plan;
  status: PlanStatus;
  trialDaysLeft: number;
  usage: number;
  incrementUsage: () => void;
  checkLimit: () => boolean; // Returns true if limit is reached
  changePlan: (planName: PlanType) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  // Mock initial state for the user
  const [plan, setPlan] = useState<Plan>(PLANS.Básico);
  const [status, setStatus] = useState<PlanStatus>("Trial");
  const [trialDaysLeft, setTrialDaysLeft] = useState(7);
  const [usage, setUsage] = useState(198); // Start close to the limit to test the feature easily

  const incrementUsage = () => {
    setUsage((prev) => prev + 1);
  };

  const checkLimit = () => {
    if (plan.isEnterprise) return false; // Enterprise never blocks
    return usage >= plan.limit;
  };

  const changePlan = (planName: PlanType) => {
    setPlan(PLANS[planName]);
    setStatus("Ativo");
  };

  return (
    <SubscriptionContext.Provider
      value={{
        plan,
        status,
        trialDaysLeft,
        usage,
        incrementUsage,
        checkLimit,
        changePlan,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
