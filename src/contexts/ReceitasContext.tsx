// ============================================================
// ReceitasContext.tsx (COMPLETO - com todos os modelos prontos)
// ============================================================
import { createContext, useContext, useState, type ReactNode } from "react";

export type CampoTipo = "text" | "textarea" | "number" | "date" | "select" | "multi-select" | "boolean";

export interface CampoTemplate {
  id: string;
  tipo: CampoTipo;
  label: string;
  obrigatorio: boolean;
  opcoes?: string[];
}

export interface PrintConfig {
  paperSize: "A4" | "A5" | "letter" | "custom";
  customWidth?: number;
  customHeight?: number;
  orientation: "portrait" | "landscape";
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  showHeader: boolean;
  headerText?: string;
  headerLogo?: string;
  showFooter: boolean;
  footerText?: string;
  fontSize: number;
  lineSpacing: number;
}

export const defaultPrintConfig: PrintConfig = {
  paperSize: "A5",
  orientation: "portrait",
  marginTop: 10,
  marginRight: 10,
  marginBottom: 10,
  marginLeft: 10,
  showHeader: true,
  headerText: "Clínica Saúde Total",
  showFooter: true,
  footerText: "Documento gerado eletronicamente por Hub Agendamentos",
  fontSize: 12,
  lineSpacing: 1.5,
};

export interface TemplateClinico {
  id: string;
  nome: string;
  tipo: "receita" | "atestado" | "solicitacao" | "declaracao";
  especialidade: string;
  campos: CampoTemplate[];
  clinicId: string;
  createdAt: Date;
  printConfig: PrintConfig;
  isDefault?: boolean; // Modelos padrão do sistema (não podem ser excluídos)
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

// ============================================================
// MODELOS PADRÃO DO SISTEMA
// ============================================================
const initialTemplates: TemplateClinico[] = [
  // 📋 RECEITA SIMPLES
  {
    id: "tpl-receita-simples",
    nome: "Receita Simples",
    tipo: "receita",
    especialidade: "geral",
    clinicId: "c1",
    createdAt: new Date("2026-01-01"),
    isDefault: true,
    printConfig: { ...defaultPrintConfig, paperSize: "A5" },
    campos: [
      { id: "c1", tipo: "textarea", label: "Medicamento", obrigatorio: true },
      { id: "c2", tipo: "textarea", label: "Posologia", obrigatorio: true },
      { id: "c3", tipo: "number", label: "Quantidade", obrigatorio: false },
      { id: "c4", tipo: "text", label: "Duração do tratamento", obrigatorio: false },
      { id: "c5", tipo: "textarea", label: "Observações", obrigatorio: false },
    ],
  },

  // 📋 RECEITA CONTROLADA (BRANCA - 2 VIAS)
  {
    id: "tpl-receita-controlada",
    nome: "Receita Controlada (2 Vias)",
    tipo: "receita",
    especialidade: "geral",
    clinicId: "c1",
    createdAt: new Date("2026-01-15"),
    isDefault: true,
    printConfig: {
      ...defaultPrintConfig,
      paperSize: "A4",
      headerText: "RECEITUÁRIO DE CONTROLE ESPECIAL",
      marginTop: 15,
      marginBottom: 15,
    },
    campos: [
      { id: "c1", tipo: "textarea", label: "Medicamento Controlado", obrigatorio: true },
      { id: "c2", tipo: "textarea", label: "Posologia Detalhada", obrigatorio: true },
      { id: "c3", tipo: "number", label: "Quantidade (máx. permitida)", obrigatorio: true },
      { id: "c4", tipo: "date", label: "Validade da Receita", obrigatorio: true },
      { id: "c5", tipo: "boolean", label: "Uso contínuo", obrigatorio: false },
      {
        id: "c6", tipo: "select", label: "Tipo de Controle", obrigatorio: true, opcoes: [
          "Antibiótico",
          "Imunossupressor",
          "Antiretroviral",
          "Anabolizante",
          "Outros",
        ]
      },
      { id: "c7", tipo: "textarea", label: "Justificativa (se dose acima do usual)", obrigatorio: false },
    ],
  },

  // 👁️ RECEITA PARA ÓCULOS (OFTALMOLOGIA)
  {
    id: "tpl-receita-oculos",
    nome: "Receita para Óculos",
    tipo: "receita",
    especialidade: "oftalmologia",
    clinicId: "c1",
    createdAt: new Date("2026-02-01"),
    isDefault: true,
    printConfig: {
      ...defaultPrintConfig,
      paperSize: "A5",
      headerText: "RECEITA DE ÓCULOS",
    },
    campos: [
      { id: "c1", tipo: "text", label: "Olho Direito - Esférico (ESF)", obrigatorio: true },
      { id: "c2", tipo: "text", label: "Olho Direito - Cilíndrico (CIL)", obrigatorio: false },
      { id: "c3", tipo: "text", label: "Olho Direito - Eixo", obrigatorio: false },
      { id: "c4", tipo: "text", label: "Olho Esquerdo - Esférico (ESF)", obrigatorio: true },
      { id: "c5", tipo: "text", label: "Olho Esquerdo - Cilíndrico (CIL)", obrigatorio: false },
      { id: "c6", tipo: "text", label: "Olho Esquerdo - Eixo", obrigatorio: false },
      { id: "c7", tipo: "text", label: "Distância Interpupilar (DIP)", obrigatorio: false },
      {
        id: "c8", tipo: "select", label: "Tipo de Lente", obrigatorio: true, opcoes: [
          "Monofocal",
          "Bifocal",
          "Multifocal",
          "Progressiva",
          "Transitions",
        ]
      },
      {
        id: "c9", tipo: "select", label: "Uso Recomendado", obrigatorio: false, opcoes: [
          "Uso contínuo",
          "Leitura",
          "Computador",
          "Distância",
          "Sol/Proteção UV",
        ]
      },
      { id: "c10", tipo: "date", label: "Validade da Receita", obrigatorio: false },
      { id: "c11", tipo: "textarea", label: "Observações", obrigatorio: false },
    ],
  },

  // 🦷 RECEITA ODONTOLÓGICA
  {
    id: "tpl-receita-odontologica",
    nome: "Receita Odontológica",
    tipo: "receita",
    especialidade: "odontologia",
    clinicId: "c1",
    createdAt: new Date("2026-02-15"),
    isDefault: true,
    printConfig: {
      ...defaultPrintConfig,
      paperSize: "A5",
      headerText: "RECEITUÁRIO ODONTOLÓGICO",
    },
    campos: [
      { id: "c1", tipo: "textarea", label: "Medicamento Prescrito", obrigatorio: true },
      { id: "c2", tipo: "textarea", label: "Posologia", obrigatorio: true },
      { id: "c3", tipo: "number", label: "Quantidade", obrigatorio: true },
      { id: "c4", tipo: "text", label: "Duração do tratamento", obrigatorio: false },
      {
        id: "c5", tipo: "select", label: "Procedimento Associado", obrigatorio: false, opcoes: [
          "Extração",
          "Implante",
          "Tratamento de Canal",
          "Limpeza/Profilaxia",
          "Clareamento",
          "Ortodontia",
          "Prótese",
        ]
      },
      { id: "c6", tipo: "textarea", label: "Recomendações pós-procedimento", obrigatorio: false },
    ],
  },

  // 📄 ATESTADO DE COMPARECIMENTO
  {
    id: "tpl-atestado-comparecimento",
    nome: "Atestado de Comparecimento",
    tipo: "atestado",
    especialidade: "geral",
    clinicId: "c1",
    createdAt: new Date("2026-03-01"),
    isDefault: true,
    printConfig: {
      ...defaultPrintConfig,
      paperSize: "A5",
      headerText: "ATESTADO DE COMPARECIMENTO",
    },
    campos: [
      { id: "c1", tipo: "text", label: "Nome do paciente", obrigatorio: true },
      { id: "c2", tipo: "text", label: "Documento (RG/CPF)", obrigatorio: false },
      { id: "c3", tipo: "date", label: "Data do comparecimento", obrigatorio: true },
      { id: "c4", tipo: "text", label: "Horário", obrigatorio: false },
      {
        id: "c5", tipo: "select", label: "Tipo de consulta", obrigatorio: false, opcoes: [
          "Consulta de rotina",
          "Exame",
          "Procedimento",
          "Emergência",
          "Retorno",
        ]
      },
      { id: "c6", tipo: "textarea", label: "Observações", obrigatorio: false },
    ],
  },

  // 📄 ATESTADO DE AFASTAMENTO
  {
    id: "tpl-atestado-afastamento",
    nome: "Atestado de Afastamento",
    tipo: "atestado",
    especialidade: "geral",
    clinicId: "c1",
    createdAt: new Date("2026-03-15"),
    isDefault: true,
    printConfig: {
      ...defaultPrintConfig,
      paperSize: "A5",
      headerText: "ATESTADO MÉDICO",
      fontSize: 11,
    },
    campos: [
      { id: "c1", tipo: "text", label: "Nome do paciente", obrigatorio: true },
      { id: "c2", tipo: "number", label: "Dias de afastamento", obrigatorio: true },
      { id: "c3", tipo: "date", label: "Data de início", obrigatorio: true },
      { id: "c4", tipo: "date", label: "Data de retorno previsto", obrigatorio: false },
      { id: "c5", tipo: "text", label: "CID (opcional)", obrigatorio: false },
      { id: "c6", tipo: "textarea", label: "Recomendações", obrigatorio: false },
    ],
  },

  // 📄 ATESTADO DE APTIDÃO FÍSICA
  {
    id: "tpl-atestado-aptidao",
    nome: "Atestado de Aptidão Física",
    tipo: "atestado",
    especialidade: "medicina_esportiva",
    clinicId: "c1",
    createdAt: new Date("2026-04-01"),
    isDefault: true,
    printConfig: {
      ...defaultPrintConfig,
      paperSize: "A5",
      headerText: "ATESTADO DE APTIDÃO FÍSICA",
    },
    campos: [
      { id: "c1", tipo: "text", label: "Nome do avaliado", obrigatorio: true },
      { id: "c2", tipo: "text", label: "Documento (RG/CPF)", obrigatorio: false },
      { id: "c3", tipo: "text", label: "Modalidade esportiva/Finalidade", obrigatorio: true },
      {
        id: "c4", tipo: "select", label: "Resultado", obrigatorio: true, opcoes: [
          "Apto sem restrições",
          "Apto com restrições",
          "Inapto temporariamente",
          "Inapto",
        ]
      },
      { id: "c4b", tipo: "textarea", label: "Restrições (se houver)", obrigatorio: false },
      { id: "c5", tipo: "date", label: "Data da avaliação", obrigatorio: true },
      { id: "c6", tipo: "text", label: "Validade do atestado (meses)", obrigatorio: false },
      { id: "c7", tipo: "textarea", label: "Observações clínicas", obrigatorio: false },
    ],
  },

  // 🔬 SOLICITAÇÃO DE EXAME
  {
    id: "tpl-solicitacao-exame",
    nome: "Solicitação de Exame",
    tipo: "solicitacao",
    especialidade: "geral",
    clinicId: "c1",
    createdAt: new Date("2026-04-15"),
    isDefault: true,
    printConfig: {
      ...defaultPrintConfig,
      paperSize: "A5",
      headerText: "SOLICITAÇÃO DE EXAME",
    },
    campos: [
      { id: "c1", tipo: "text", label: "Nome do paciente", obrigatorio: true },
      { id: "c2", tipo: "text", label: "Idade", obrigatorio: false },
      {
        id: "c3", tipo: "select", label: "Tipo de exame", obrigatorio: true, opcoes: [
          "Hemograma Completo",
          "Glicemia em Jejum",
          "Colesterol Total e Frações",
          "Triglicerídeos",
          "TSH e T4 Livre",
          "Ácido Úrico",
          "Creatinina",
          "Raio-X de Tórax",
          "Ultrassonografia Abdominal",
          "Ultrassonografia Pélvica",
          "Eletrocardiograma",
          "Outros",
        ]
      },
      { id: "c4", tipo: "text", label: "Exame específico (se Outros)", obrigatorio: false },
      { id: "c5", tipo: "textarea", label: "Justificativa clínica", obrigatorio: true },
      {
        id: "c6", tipo: "select", label: "Urgência", obrigatorio: false, opcoes: [
          "Rotina",
          "Urgente",
          "Muito urgente",
        ]
      },
      { id: "c7", tipo: "textarea", label: "Preparo necessário", obrigatorio: false },
      { id: "c8", tipo: "date", label: "Data da solicitação", obrigatorio: true },
    ],
  },

  // 📄 DECLARAÇÃO DE ACOMPANHAMENTO
  {
    id: "tpl-declaracao-acompanhamento",
    nome: "Declaração de Acompanhamento",
    tipo: "declaracao",
    especialidade: "geral",
    clinicId: "c1",
    createdAt: new Date("2026-05-01"),
    isDefault: true,
    printConfig: {
      ...defaultPrintConfig,
      paperSize: "A5",
      headerText: "DECLARAÇÃO DE ACOMPANHAMENTO",
    },
    campos: [
      { id: "c1", tipo: "text", label: "Nome do acompanhante", obrigatorio: true },
      { id: "c2", tipo: "text", label: "Documento (RG/CPF)", obrigatorio: false },
      { id: "c3", tipo: "text", label: "Nome do paciente", obrigatorio: true },
      { id: "c4", tipo: "text", label: "Grau de parentesco/Vínculo", obrigatorio: false },
      { id: "c5", tipo: "date", label: "Data da consulta/procedimento", obrigatorio: true },
      { id: "c6", tipo: "text", label: "Período necessário (dias)", obrigatorio: false },
      { id: "c7", tipo: "textarea", label: "Justificativa médica", obrigatorio: true },
    ],
  },

  // 👶 RECEITA PEDIÁTRICA
  {
    id: "tpl-receita-pediatrica",
    nome: "Receita Pediátrica",
    tipo: "receita",
    especialidade: "pediatria",
    clinicId: "c1",
    createdAt: new Date("2026-05-15"),
    isDefault: true,
    printConfig: {
      ...defaultPrintConfig,
      paperSize: "A5",
      headerText: "RECEITA PEDIÁTRICA",
    },
    campos: [
      { id: "c1", tipo: "text", label: "Nome da criança", obrigatorio: true },
      { id: "c2", tipo: "number", label: "Idade", obrigatorio: false },
      { id: "c3", tipo: "number", label: "Peso (kg)", obrigatorio: true },
      { id: "c4", tipo: "textarea", label: "Medicamento", obrigatorio: true },
      { id: "c5", tipo: "textarea", label: "Posologia (dose por kg)", obrigatorio: true },
      { id: "c6", tipo: "text", label: "Duração do tratamento", obrigatorio: false },
      {
        id: "c7", tipo: "select", label: "Apresentação", obrigatorio: false, opcoes: [
          "Suspensão oral",
          "Gotas",
          "Comprimido mastigável",
          "Xarope",
          "Supositório",
          "Injetável",
        ]
      },
      { id: "c8", tipo: "textarea", label: "Observações aos pais", obrigatorio: false },
    ],
  },
];

export const ReceitasProvider = ({ children }: { children: ReactNode }) => {
  const [templates, setTemplates] = useState<TemplateClinico[]>(initialTemplates);
  const [receitas, setReceitas] = useState<Receita[]>([]);

  const addTemplate = (t: Omit<TemplateClinico, "id" | "createdAt">) => {
    setTemplates((prev) => [...prev, { ...t, id: crypto.randomUUID(), createdAt: new Date(), isDefault: false }]);
  };

  const updateTemplate = (id: string, t: Partial<Omit<TemplateClinico, "id" | "createdAt">>) => {
    setTemplates((prev) => prev.map((tpl) => (tpl.id === id ? { ...tpl, ...t } : tpl)));
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => !t.isDefault || t.id !== id));
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