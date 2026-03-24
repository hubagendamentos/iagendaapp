import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";

const Dashboard = () => {
  const { userName, userType } = useUser();
  const initials = userName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

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
              <span className="text-sm text-muted-foreground hidden sm:block">{userName}</span>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
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
