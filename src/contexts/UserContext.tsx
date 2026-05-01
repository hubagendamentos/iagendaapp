import { createContext, useContext, useState, type ReactNode } from "react";

export type UserPermissions = {
  // 🔵 MÓDULOS PRINCIPAIS
  agenda: boolean;
  atendimentos: boolean;
  pacientes: boolean;

  // 🟢 GESTÃO
  financeiro: boolean;
  relatorios: boolean;

  // 🟣 COMUNICAÇÃO
  comunicacao: boolean;

  // ⚙️ ESTRUTURA
  usuarios: boolean;
  profissionais: boolean;
  configuracoes: boolean;
  cadastros: boolean;

  // SUBCONFIGURAÇÕES (dependem de configuracoes)
  pagamentos: boolean;
  notificacoes: boolean;

  // 💳 COMERCIAL
  assinatura: boolean;

  // 🟠 AÇÕES
  podeConfirmar: boolean;
  podeIniciar: boolean;
  podeFinalizar: boolean;
  podeCancelar: boolean;
  podeMarcarFalta: boolean;
  podeEditarFicha: boolean;
};

export type UserRole = "admin" | "staff" | "professional";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clinicId: string;
  professionalId?: string;
  permissions?: Partial<UserPermissions>;
};

export type ClinicType = "clinic" | "solo";

export type Clinic = {
  id: string;
  name: string;
  type: ClinicType;
};

interface UserContextType {
  user: User | null;
  clinic: Clinic | null;
  setUser: (user: User | null) => void;
  setClinic: (clinic: Clinic | null) => void;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  userType: "clinic" | "professional";
  setUserType: (type: "clinic" | "professional") => void;
  userName: string;
  professionalId: string;

  usersList: User[];
  setUsersList: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};

const mockClinic: Clinic = {
  id: "c1",
  name: "Clínica Saúde Total",
  type: "clinic",
};

const mockAdmin: User = {
  id: "u1",
  name: "Admin Silva",
  email: "admin@clinica.com",
  role: "admin",
  clinicId: "c1",
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(mockAdmin);
  const [clinic, setClinic] = useState<Clinic | null>(mockClinic);

  const [usersList, setUsersList] = useState<User[]>([
    mockAdmin,
    {
      id: "u2",
      name: "Recepção",
      email: "recepcao@clinica.com",
      role: "staff",
      clinicId: "c1",
      permissions: {
        agenda: true,
        atendimentos: true,
        pacientes: true,

        podeConfirmar: true,
        podeCancelar: true,
        podeMarcarFalta: true,
        podeIniciar: true,
      },
    },
    {
      id: "u3",
      name: "Dr. João Silva",
      email: "joao@clinica.com",
      role: "professional",
      clinicId: "c1",
      professionalId: "p1",
      permissions: {
        agenda: true,
        atendimentos: true,

        podeIniciar: true,
        podeFinalizar: true,
        podeEditarFicha: true,
      },
    },
  ]);

  const [userType, setUserType] = useState<"clinic" | "professional">("clinic");

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!clinic || !user) return false;

    // 🔥 SOLO → tudo liberado
    if (clinic.type === "solo") return true;

    // 🔐 Permissão customizada
    if (user.permissions && user.permissions[permission] !== undefined) {
      return user.permissions[permission] as boolean;
    }

    // 👑 Admin tem tudo
    if (user.role === "admin") return true;

    return false;
  };

  const addUser = (newUser: User) => setUsersList([...usersList, newUser]);

  const updateUser = (updatedUser: User) =>
    setUsersList(usersList.map((u) => (u.id === updatedUser.id ? updatedUser : u)));

  return (
    <UserContext.Provider
      value={{
        user,
        clinic,
        setUser,
        setClinic,
        hasPermission,
        userType,
        setUserType,
        userName: user?.name || "Usuário",
        professionalId: user?.professionalId || "p1",
        usersList,
        setUsersList,
        addUser,
        updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};