import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, CreditCard } from "lucide-react";

const Dashboard = () => {
  const { userName, userType } = useUser();
  const { plan, usage } = useSubscription();
  const navigate = useNavigate();
  const initials = userName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const usagePct = Math.min(Math.round((usage / plan.limit) * 100), 100);
  const isNearLimit = usagePct >= 80 && !plan.isEnterprise;
  const isAtLimit = usage >= plan.limit && !plan.isEnterprise;
  const hasOverage = plan.isEnterprise && usage > plan.limit;

  let badgeColor = "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border";
  let dotColor = "bg-emerald-500";
  
  if (isAtLimit) {
    badgeColor = "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20";
    dotColor = "bg-destructive";
  } else if (isNearLimit || hasOverage) {
    badgeColor = "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200";
    dotColor = "bg-amber-500";
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-base font-semibold text-foreground hidden sm:block">
                {userType === "clinic" ? "Painel da Clínica" : "Meu Painel"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate("/dashboard/assinatura")}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border text-xs font-medium transition-colors ${badgeColor}`}
                title="Consumo do Plano"
              >
                <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                <span>{usage}/{plan.limit}</span>
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-accent transition-colors">
                    <span className="text-sm text-muted-foreground hidden sm:block">{userName}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/dashboard/configuracoes")} className="gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/assinatura")} className="gap-2 cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                  Assinatura
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/")} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
