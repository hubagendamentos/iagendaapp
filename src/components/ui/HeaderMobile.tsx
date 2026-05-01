import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export function HeaderMobile() {
    const { toggleSidebar } = useSidebar();

    return (
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b bg-background">
            <button onClick={toggleSidebar}>
                <Menu className="h-6 w-6" />
            </button>

            <span className="font-semibold text-sm">
                Hub Agendamentos
            </span>

            <div className="w-6" /> {/* espaço pra centralizar */}
        </div>
    );
}