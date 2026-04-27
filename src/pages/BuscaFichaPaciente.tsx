import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { applyPhoneMask } from "@/components/PhoneMaskInput";
import { applyCpfCnpjMask } from "@/components/CpfCnpjMaskInput";

// Mock data to match the rest of the application
interface PacienteBasico {
  id: string;
  nome: string;
  cpf: string;
  celular: string;
}

const mockPacientes: PacienteBasico[] = [
  { id: "1", nome: "Maria Silva", cpf: "12345678901", celular: "11999990001" },
  { id: "2", nome: "João Santos", cpf: "98765432100", celular: "11999990002" },
  { id: "3", nome: "Ana Oliveira", cpf: "", celular: "11999990003" },
];

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

const BuscaFichaPaciente = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");

  const filtered = mockPacientes.filter((p) => {
    const buscaDigitos = busca.replace(/\D/g, "");
    const buscaTexto = busca.toLowerCase();

    const matchNome = buscaTexto !== "" ? p.nome.toLowerCase().includes(buscaTexto) : false;
    const matchCelular = buscaDigitos.length > 0 ? p.celular.replace(/\D/g, "").includes(buscaDigitos) : false;
    const matchCpf = buscaDigitos.length > 0 ? (p.cpf || "").replace(/\D/g, "").includes(buscaDigitos) : false;

    return busca === "" || matchNome || matchCelular || matchCpf;
  });

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-col space-y-1.5 mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <User className="h-5 w-5 text-primary" /> Acesso à Ficha do Paciente
        </h2>
        <p className="text-sm text-muted-foreground">
          Localize rapidamente o registro completo do paciente pelo nome, CPF ou telefone.
        </p>
      </div>

      <div className="relative sticky top-0 z-10 bg-background/95 backdrop-blur py-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar paciente por nome, CPF ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-10 h-14 text-base shadow-sm border-2 focus-visible:ring-primary/20"
          autoFocus
        />
      </div>

      <div className="space-y-3 mt-4">
        {filtered.length === 0 ? (
          <div className="rounded-lg border bg-card p-10 text-center text-muted-foreground flex flex-col items-center">
            <Search className="h-8 w-8 mb-3 opacity-20" />
            <p>Nenhum paciente encontrado com estes termos.</p>
          </div>
        ) : (
          filtered.map((p) => {
            const phoneDigits = p.celular.replace(/\D/g, "");
            return (
              <div
                key={p.id}
                className="rounded-xl border bg-card p-4 hover:shadow-md hover:border-primary/40 transition-all cursor-pointer flex items-center justify-between group"
                onClick={() => navigate(`/dashboard/ficha-paciente/${p.id}`)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar className="h-12 w-12 shrink-0 border border-primary/10">
                    <AvatarFallback className="bg-primary/5 text-primary text-sm font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {getInitials(p.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-base text-foreground truncate group-hover:text-primary transition-colors">
                      {p.nome}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-sm text-muted-foreground">
                      <span>{p.cpf ? applyCpfCnpjMask(p.cpf) : "CPF não informado"}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{applyPhoneMask(phoneDigits)}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-3">
                  <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm text-muted-foreground">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BuscaFichaPaciente;
