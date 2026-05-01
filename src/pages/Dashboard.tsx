import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { ActiveAppointmentBanner } from "@/components/ActiveAppointmentBanner";
import { Menu } from "lucide-react";

/* 🔥 HEADER MOBILE (correto, não flutuante) */
function MobileHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="md:hidden flex items-center justify-between h-14 px-4 border-b bg-background">
      <button onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </button>



      {/* espaço pra centralizar */}
      <div className="w-5" />
    </div>
  );
}

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">

        {/* 🔵 SIDEBAR */}
        <AppSidebar />

        {/* 🔵 CONTEÚDO */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* 📱 HEADER MOBILE */}
          <MobileHeader />

          <ActiveAppointmentBanner />

          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            <Outlet />
          </main>

        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;