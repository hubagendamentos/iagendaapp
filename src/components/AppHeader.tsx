import { useState } from "react";
import {
    Calendar, Users, UserCog, ClipboardList, LayoutDashboard,
    ListChecks, Shield, ChevronDown,
    DollarSign, BarChart3, MessageSquare, Bot, History,
    Building2, CreditCard, Bell, Menu, Settings, BadgeCheck,
    Wallet, Receipt, HandCoins, X,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser, type UserPermissions } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
                title: "Financeiro",
                icon: DollarSign,
                permission: "financeiro",
                children: [
                    { title: "Caixa", url: "/dashboard/financeiro/caixa", icon: Wallet },
                    { title: "Contas a receber", url: "/dashboard/financeiro/receber", icon: Receipt },
                    { title: "Contas a pagar", url: "/dashboard/financeiro/pagar", icon: HandCoins },
                ],
            },
            {
                title: "Relatórios",
                url: "/dashboard/relatorios",
                icon: BarChart3,
                permission: "relatorios",
            },
        ],
    },
    {
        label: "Comunicação",
        items: [
            { title: "Comunicação", url: "/dashboard/templates", icon: MessageSquare, permission: "comunicacao" },
            { title: "Automações", url: "/dashboard/automacoes", icon: Bot, permission: "comunicacao" },
            { title: "Histórico de envios", url: "/dashboard/historico-envios", icon: History, permission: "comunicacao" },
        ],
    },
    {
        label: "Configurações",
        items: [
            { title: "Conta", url: "/dashboard/configuracoes", icon: Building2, permission: "configuracoes" },
            { title: "Profissionais", url: "/dashboard/profissionais", icon: UserCog, permission: "profissionais", requireClinic: true },
            { title: "Cadastros", url: "/dashboard/cadastros", icon: ClipboardList, permission: "cadastros" },
            { title: "Pagamentos", url: "/dashboard/formas-pagamento", icon: CreditCard, permission: "pagamentos" },
            { title: "Notificações", url: "/dashboard/notificacoes", icon: Bell, permission: "notificacoes" },
        ],
    },
    {
        label: "Administração",
        items: [
            { title: "Usuários", url: "/dashboard/usuarios", icon: Shield, permission: "usuarios", requireClinic: true, adminOnly: true },
        ],
    },
    {
        label: "Comercial",
        items: [
            { title: "Assinatura", url: "/dashboard/assinatura", icon: BadgeCheck, permission: "assinatura", requireClinic: true },
        ],
    },
];

// Componente para item do menu mobile com submenu acordeão
function MobileMenuItem({
    item,
    navigate,
    onClose
}: {
    item: MenuItem;
    navigate: (url: string) => void;
    onClose: () => void;
}) {
    const [open, setOpen] = useState(false);

    if (item.children) {
        return (
            <div className="space-y-1">
                <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-md hover:bg-accent transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {item.title}
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                    <div className="ml-4 border-l pl-4 space-y-1">
                        {item.children.map((child) => (
                            <button
                                key={child.title}
                                onClick={() => {
                                    navigate(child.url!);
                                    onClose();
                                }}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                            >
                                <child.icon className="h-4 w-4" />
                                {child.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <button
            onClick={() => {
                if (item.url) {
                    navigate(item.url);
                    onClose();
                }
            }}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-md hover:bg-accent transition-colors"
        >
            <item.icon className="h-5 w-5" />
            {item.title}
        </button>
    );
}

export function AppHeader() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { hasPermission, clinic, user, usersList, setUser } = useUser();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const canShow = (item: MenuItem): boolean => {
        if (item.requireClinic && clinic?.type === "solo") return false;
        if (item.adminOnly && user?.role !== "admin") return false;
        if (item.permission && !hasPermission(item.permission)) return false;
        if ((item.permission === "pagamentos" || item.permission === "notificacoes") && !hasPermission("configuracoes")) return false;
        return true;
    };

    const allVisibleItems = menuStructure.flatMap(group => group.items.filter(canShow));
    const mainItems = allVisibleItems.filter(item => !item.children).slice(0, 5);
    const dropdownItems = allVisibleItems.filter(item => item.children);
    const moreItems = allVisibleItems.filter(item => !item.children).slice(5);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background">
            <div className="flex h-14 items-center px-4 sm:px-6 gap-2">
                {/* Logo */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 font-bold text-lg shrink-0 hover:opacity-80"
                >
                    <Calendar className="h-6 w-6 text-primary" />
                    <span className="hidden lg:inline">Hub Atendimentos</span>
                </button>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-0.5 ml-1 flex-1 overflow-x-auto">
                    {mainItems.map((item) => (
                        <NavLink
                            key={item.title}
                            to={item.url!}
                            end={item.url === "/dashboard"}
                            className="flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors whitespace-nowrap"
                            activeClassName="bg-accent text-accent-foreground"
                        >
                            <item.icon className="h-4 w-4" />
                            <span className="hidden lg:inline">{item.title}</span>
                        </NavLink>
                    ))}

                    {dropdownItems.map((item) => (
                        <DropdownMenu key={item.title}>
                            <DropdownMenuTrigger className="flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors whitespace-nowrap">
                                <item.icon className="h-4 w-4" />
                                <span className="hidden lg:inline">{item.title}</span>
                                <ChevronDown className="h-3 w-3 opacity-50 hidden lg:block" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                                {item.children?.map((child) => (
                                    <DropdownMenuItem key={child.title} onClick={() => navigate(child.url!)} className="cursor-pointer gap-2">
                                        <child.icon className="h-4 w-4" />
                                        {child.title}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ))}

                    {moreItems.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors whitespace-nowrap">
                                <Settings className="h-4 w-4" />
                                <span className="hidden lg:inline">Mais</span>
                                <ChevronDown className="h-3 w-3 opacity-50 hidden lg:block" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                                {moreItems.map((item) => (
                                    <DropdownMenuItem key={item.title} onClick={() => navigate(item.url!)} className="cursor-pointer gap-2">
                                        <item.icon className="h-4 w-4" />
                                        {item.title}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </nav>

                {/* User */}
                <div className="flex items-center gap-2 ml-auto shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 hover:bg-accent p-1.5 rounded-md transition-colors">
                                <Avatar className="h-7 w-7">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                        {user?.name?.substring(0, 2).toUpperCase() || "??"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden sm:inline text-sm font-medium truncate max-w-[120px]">{user?.name}</span>
                                <ChevronDown className="h-3 w-3 opacity-50 hidden sm:block" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {usersList.filter(u => u.clinicId === clinic?.id).map((u) => (
                                <DropdownMenuItem
                                    key={u.id}
                                    onClick={() => { setUser(u); navigate("/dashboard"); }}
                                    className="cursor-pointer"
                                >
                                    {u.name} {u.id === user?.id && "✓"}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate("/")} className="cursor-pointer text-destructive">
                                Sair
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Mobile menu button */}
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <>
                    {/* Overlay para fechar ao clicar fora */}
                    <div
                        className="md:hidden fixed inset-0 top-14 bg-black/20 z-40"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    <div className="md:hidden absolute top-14 left-0 right-0 border-t bg-background shadow-lg z-50 max-h-[70vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-4 py-3 border-b">
                            <span className="text-sm font-semibold text-muted-foreground">Menu</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="p-4 space-y-1">
                            {allVisibleItems.map((item) => (
                                <MobileMenuItem
                                    key={item.title}
                                    item={item}
                                    navigate={navigate}
                                    onClose={() => setMobileMenuOpen(false)}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}