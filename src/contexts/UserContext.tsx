import { createContext, useContext, useState, type ReactNode } from "react";

export type UserType = "clinic" | "professional";

interface UserContextType {
  userType: UserType;
  setUserType: (type: UserType) => void;
  userName: string;
  /** For professional users, which professional they are */
  professionalId: string;
}

const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userType, setUserType] = useState<UserType>("clinic");

  return (
    <UserContext.Provider
      value={{
        userType,
        setUserType,
        userName: userType === "clinic" ? "Clínica Saúde Total" : "Dr. João Silva",
        professionalId: "p1", // default professional for "professional" type
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
