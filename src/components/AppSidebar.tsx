import { useState } from "react";
import { PanelLeft } from "lucide-react";
import {
  Calendar, Users, UserCog, Settings, ClipboardList, LayoutDashboard,
  BadgeCheck, ListChecks, Shield, ChevronsUpDown, ChevronRight,
  DollarSign, BarChart3, MessageSquare, Bot, History,
  Building2, Clock, CreditCard, Bell, Briefcase, Lock,
  Wallet, Receipt, HandCoins,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser, type UserPermissions } from "@/contexts/UserContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type MenuItem = {
  title: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: keyof UserPermissions;
  requireClinic?: boolean;
  adminOnly?: boolean;
  children?: MenuItem[];
};

const menuStructure: { label: string; items: MenuItem[] }[] = [
  {
    label: "Principal",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Agenda", url: "/dashboard/agenda", icon: Calendar, permission: "agenda" },
      { title: "Atendimentos", url: "/dashboard/atendimentos", icon: ListChecks, permission: "atendimentos" },
      { title: "Pacientes", url: "/dashboard/pacientes", icon: Users, permission: "pacientes" },
    ],
  },
  {
    label: "Gestão",
    items: [
      {
        title: "Financeiro", icon: DollarSign, children: [
          { title: "Caixa", url: "/dashboard/financeiro/caixa", icon: Wallet },
          { title: "Contas a receber", url: "/dashboard/financeiro/receber", icon: Receipt },
          { title: "Contas a pagar", url: "/dashboard/financeiro/pagar", icon: HandCoins },
        ],
      },
      { title: "Relatórios", url: "/dashboard/relatorios", icon: BarChart3 },
    ],
  },
  {
    label: "Comunicação",
    items: [
      { title: "Templates", url: "/dashboard/templates", icon: MessageSquare },
      { title: "Automações", url: "/dashboard/automacoes", icon: Bot },
      { title: "Histórico de envios", url: "/dashboard/historico-envios", icon: History },
    ],
  },
  {
    label: "Configurações",
    items: [
      { title: "Clínica", url: "/dashboard/configuracoes", icon: Building2, permission: "configuracoes" },
      { title: "Profissionais", url: "/dashboard/profissionais", icon: UserCog, permission: "profissionais", requireClinic: true },
      { title: "Horários", url: "/dashboard/horarios", icon: Clock },
      {
        title: "Cadastros", icon: ClipboardList, permission: "cadastros", children: [
          { title: "Serviços", url: "/dashboard/cadastros?tab=services", icon: ClipboardList },
          { title: "Planos", url: "/dashboard/cadastros?tab=plans", icon: ClipboardList },
          { title: "Tipos de atendimento", url: "/dashboard/cadastros?tab=types", icon: ClipboardList },
          { title: "Exames", url: "/dashboard/cadastros?tab=exams", icon: ClipboardList },
        ],
      },
      { title: "Pagamentos", url: "/dashboard/formas-pagamento", icon: CreditCard },
      { title: "Notificações", url: "/dashboard/notificacoes", icon: Bell },
    ],
  },
  {
    label: "Administração",
    items: [
      { title: "Usuários", url: "/dashboard/usuarios", icon: Shield, permission: "usuarios", requireClinic: true, adminOnly: true },
      { title: "Permissões", url: "/dashboard/permissoes", icon: Lock, adminOnly: true },
    ],
  },
  {
    label: "Comercial",
    items: [
      { title: "Assinatura", url: "/dashboard/assinatura", icon: BadgeCheck, permission: "assinatura", requireClinic: true },
    ],
  },
];

function SidebarNavItem({ item, collapsed, pathname }: { item: MenuItem; collapsed: boolean; pathname: string }) {
  const [open, setOpen] = useState(() => {
    if (!item.children) return false;
    return item.children.some(c => c.url && pathname.startsWith(c.url.split("?")[0]));
  });

  if (item.children) {
    const isChildActive = item.children.some(c => c.url && pathname.startsWith(c.url.split("?")[0]));

    if (collapsed) {
      return (
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <button className={cn("hover:bg-sidebar-accent/50", isChildActive && "bg-sidebar-accent text-sidebar-primary font-medium")}>
              <item.icon className="mr-2 h-4 w-4" />
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className={cn("hover:bg-sidebar-accent/50 w-full justify-between", isChildActive && "text-sidebar-primary font-medium")}>
              <span className="flex items-center">
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </span>
              <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")} />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenu className="ml-4 border-l border-sidebar-border pl-2 mt-1">
              {item.children.map((child) => (
                <SidebarMenuItem key={child.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={child.url!}
                      className="hover:bg-sidebar-accent/50 text-sm"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <span>{child.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url!}
          end={item.url === "/dashboard"}
          className="hover:bg-sidebar-accent/50"
          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
        >
          <item.icon className="mr-2 h-4 w-4" />
          {!collapsed && <span>{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { hasPermission, clinic, user, usersList, setUser } = useUser();
  const { plan, usage } = useSubscription();

  const canShow = (item: MenuItem): boolean => {
    if (item.requireClinic && clinic?.type === "solo") return false;
    if (item.adminOnly && user?.role !== "admin") return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-0">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Calendar className="h-6 w-6 text-sidebar-primary shrink-0" />
            {!collapsed && (
              <span className="text-lg font-bold text-sidebar-primary-foreground tracking-tight">
                Hub Agendamentos
              </span>
            )}
          </button>
          {!collapsed && (
            <button
              onClick={() => { const { toggleSidebar } = useSidebarRef.current; toggleSidebar(); }}
              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors text-sidebar-foreground/70"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
          {menuStructure.map((group) => {
            const visibleItems = group.items.filter(canShow);
            if (visibleItems.length === 0) return null;

            return (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleItems.map((item) => (
                      <SidebarNavItem key={item.title} item={item} collapsed={collapsed} pathname={pathname} />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 w-full hover:bg-sidebar-accent/50 p-2 rounded-md transition-colors text-left outline-none">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {user?.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
                        {usage}/{plan.limit}
                      </span>
                    </div>
                  </div>
                )}
                {!collapsed && <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-[200px]">
              <DropdownMenuItem onClick={() => navigate("/dashboard/configuracoes")} className="cursor-pointer gap-2">
                <Settings className="h-4 w-4" /> Meu perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard/configuracoes")} className="cursor-pointer gap-2">
                <Building2 className="h-4 w-4" /> Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {usersList.filter(u => u.clinicId === clinic?.id).map((u) => (
                <DropdownMenuItem
                  key={u.id}
                  onClick={() => { setUser(u); navigate("/dashboard"); }}
                  className="cursor-pointer flex flex-col items-start gap-0.5"
                >
                  <span className="font-medium text-sm">{u.name} {u.id === user?.id && "(Atual)"}</span>
                  <span className="text-xs text-muted-foreground capitalize">{u.role}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/")} className="cursor-pointer text-destructive gap-2">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
