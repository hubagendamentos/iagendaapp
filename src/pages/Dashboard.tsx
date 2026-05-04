import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { ActiveAppointmentBanner } from "@/components/ActiveAppointmentBanner";

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* 🔵 HEADER HORIZONTAL */}
      <AppHeader />

      <ActiveAppointmentBanner />

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;