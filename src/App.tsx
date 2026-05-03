import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { AppointmentsProvider } from "@/contexts/AppointmentsContext";
import { TimelineProvider } from "@/contexts/TimelineContext";
import { CaixaProvider } from "@/contexts/CaixaContext";
import { PlanoContasProvider } from "@/contexts/PlanoContasContext";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import DashboardHome from "./pages/DashboardHome.tsx";
import Agenda from "./pages/Agenda.tsx";
import Pacientes from "./pages/Pacientes.tsx";
import Profissionais from "./pages/Profissionais.tsx";
import Configuracoes from "./pages/Configuracoes.tsx";
import Cadastros from "./pages/Cadastros.tsx";
import FichaPaciente from "./pages/FichaPaciente.tsx";
import BuscaFichaPaciente from "./pages/BuscaFichaPaciente.tsx";
import Atendimentos from "./pages/Atendimentos.tsx";
import Assinatura from "./pages/Assinatura.tsx";
import Usuarios from "./pages/Usuarios.tsx";
import Caixa from "./pages/Caixa.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <UserProvider>
        <SubscriptionProvider>
          <TimelineProvider>
            <AppointmentsProvider>
            <CaixaProvider>
            <PlanoContasProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />}>
                      <Route index element={<DashboardHome />} />
                      <Route path="atendimentos" element={<Atendimentos />} />
                      <Route path="agenda" element={<Agenda />} />
                      <Route path="pacientes" element={<Pacientes />} />
                      <Route path="ficha-paciente" element={<BuscaFichaPaciente />} />
                      <Route path="ficha-paciente/:id" element={<FichaPaciente />} />
                      <Route path="profissionais" element={<Profissionais />} />
                      <Route path="cadastros" element={<Cadastros />} />
                      <Route path="configuracoes" element={<Configuracoes />} />
                      <Route path="assinatura" element={<Assinatura />} />
                      <Route path="usuarios" element={<Usuarios />} />
                      <Route path="financeiro/caixa" element={<Caixa />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </PlanoContasProvider>
            </CaixaProvider>
            </AppointmentsProvider>
          </TimelineProvider>
        </SubscriptionProvider>
      </UserProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
