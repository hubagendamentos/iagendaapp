import { Calendar, Users, UserCog, Settings, ClipboardList, LayoutDashboard, FileText, BadgeCheck, ListChecks, Shield, ChevronsUpDown } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser, type UserPermissions } from "@/contexts/UserContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const allMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Atendimentos", url: "/dashboard/atendimentos", icon: ListChecks, permission: "atendimentos" as keyof UserPermissions },
  { title: "Agenda", url: "/dashboard/agenda", icon: Calendar, permission: "agenda" as keyof UserPermissions },
  { title: "Ficha do paciente", url: "/dashboard/ficha-paciente", icon: FileText, permission: "fichaPaciente" as keyof UserPermissions },
  { title: "Pacientes", url: "/dashboard/pacientes", icon: Users, permission: "pacientes" as keyof UserPermissions },
  { title: "Profissionais", url: "/dashboard/profissionais", icon: UserCog, permission: "profissionais" as keyof UserPermissions, requireClinic: true },
  { title: "Usuários", url: "/dashboard/usuarios", icon: Shield, permission: "usuarios" as keyof UserPermissions, requireClinic: true },
  { title: "Cadastros", url: "/dashboard/cadastros", icon: ClipboardList, permission: "cadastros" as keyof UserPermissions },
  { title: "Assinatura", url: "/dashboard/assinatura", icon: BadgeCheck, permission: "assinatura" as keyof UserPermissions, requireClinic: true },
  { title: "Configurações", url: "/dashboard/configuracoes", icon: Settings, permission: "configuracoes" as keyof UserPermissions },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, clinic, user, usersList, setUser } = useUser();

  const menuItems = allMenuItems.filter((item) => {
    if (item.requireClinic && clinic?.type === "solo") return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 px-4 py-5 hover:opacity-80 transition-opacity">
          <Calendar className="h-6 w-6 text-sidebar-primary shrink-0" />
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-primary-foreground tracking-tight">
              Hub Agendamentos
            </span>
          )}
        </button>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Switcher for Testing */}
        <div className="mt-auto p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 w-full hover:bg-sidebar-accent/50 p-2 rounded-md transition-colors text-left outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {user?.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate capitalize">{user?.role}</p>
                  </div>
                )}
                {!collapsed && <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Simular Acesso Como:</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {usersList.filter(u => u.clinicId === clinic?.id).map((u) => (
                <DropdownMenuItem 
                  key={u.id} 
                  onClick={() => {
                    setUser(u);
                    navigate("/dashboard");
                  }} 
                  className="cursor-pointer flex flex-col items-start gap-0.5"
                >
                  <span className="font-medium text-sm">{u.name} {u.id === user?.id && "(Atual)"}</span>
                  <span className="text-xs text-muted-foreground capitalize">{u.role}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/")} className="cursor-pointer text-red-500">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
