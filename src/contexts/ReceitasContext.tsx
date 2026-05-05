import { createContext, useContext, useState, type ReactNode } from "react";

export type CampoTipo = "text" | "textarea" | "number" | "date" | "select" | "multi-select" | "boolean";

export interface CampoTemplate {
  id: string;
  tipo: CampoTipo;
  label: string;
  obrigatorio: boolean;
  opcoes?: string[];
}

export interface TemplateClinico {
  id: string;
  nome: string;
  tipo: "receita";
  especialidade: string;
  campos: CampoTemplate[];
  clinicId: string;
  createdAt: Date;
}

export interface Receita {
  id: string;
  patientId: string;
  appointmentId: string;
  templateId: string;
  templateNome: string;
  profissionalId: string;
  clinicId: string;
  data: Record<string, any>;
  html: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ReceitasContextType {
  templates: TemplateClinico[];
  receitas: Receita[];
  addTemplate: (t: Omit<TemplateClinico, "id" | "createdAt">) => void;
  updateTemplate: (id: string, t: Partial<Omit<TemplateClinico, "id" | "createdAt">>) => void;
  deleteTemplate: (id: string) => void;
  addReceita: (r: Omit<Receita, "id" | "createdAt" | "updatedAt">) => Receita;
  getReceitasByPatient: (patientId: string) => Receita[];
  getReceitaById: (id: string) => Receita | undefined;
}

const ReceitasContext = createContext<ReceitasContextType | null>(null);

export const useReceitas = () => {
  const ctx = useContext(ReceitasContext);
  if (!ctx) throw new Error("useReceitas must be used within ReceitasProvider");
  return ctx;
};

const initialTemplates: TemplateClinico[] = [
  {
    id: "tpl-1",
    nome: "Receita Simples",
    tipo: "receita",
    especialidade: "geral",
    clinicId: "c1",
    createdAt: new Date("2026-01-01"),
    campos: [
      { id: "c1", tipo: "textarea", label: "Medicamento", obrigatorio: true },
      { id: "c2", tipo: "text", label: "Posologia", obrigatorio: true },
      { id: "c3", tipo: "number", label: "Quantidade", obrigatorio: false },
    ],
  },
  {
    id: "tpl-2",
    nome: "Receita Controlada",
    tipo: "receita",
    especialidade: "geral",
    clinicId: "c1",
    createdAt: new Date("2026-01-15"),
    campos: [
      { id: "c1", tipo: "textarea", label: "Medicamento Controlado", obrigatorio: true },
      { id: "c2", tipo: "text", label: "Posologia", obrigatorio: true },
      { id: "c3", tipo: "number", label: "Quantidade", obrigatorio: true },
      { id: "c4", tipo: "date", label: "Validade da Receita", obrigatorio: true },
      { id: "c5", tipo: "boolean", label: "Uso contínuo", obrigatorio: false },
    ],
  },
];

export const ReceitasProvider = ({ children }: { children: ReactNode }) => {
  const [templates, setTemplates] = useState<TemplateClinico[]>(initialTemplates);
  const [receitas, setReceitas] = useState<Receita[]>([]);

  const addTemplate = (t: Omit<TemplateClinico, "id" | "createdAt">) => {
    setTemplates((prev) => [...prev, { ...t, id: crypto.randomUUID(), createdAt: new Date() }]);
  };

  const updateTemplate = (id: string, t: Partial<Omit<TemplateClinico, "id" | "createdAt">>) => {
    setTemplates((prev) => prev.map((tpl) => (tpl.id === id ? { ...tpl, ...t } : tpl)));
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const addReceita = (r: Omit<Receita, "id" | "createdAt" | "updatedAt">): Receita => {
    const now = new Date();
    const newReceita: Receita = { ...r, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    setReceitas((prev) => [newReceita, ...prev]);
    return newReceita;
  };

  const getReceitasByPatient = (patientId: string) => receitas.filter((r) => r.patientId === patientId);

  const getReceitaById = (id: string) => receitas.find((r) => r.id === id);

  return (
    <ReceitasContext.Provider value={{ templates, receitas, addTemplate, updateTemplate, deleteTemplate, addReceita, getReceitasByPatient, getReceitaById }}>
      {children}
    </ReceitasContext.Provider>
  );
};