"use client";

import { createContext, useContext, useState, ReactNode, Context } from "react";
import type { User } from "@/app/interfaces/user";

/**
 * Interface pour les propriétés d'initialisation du contexte de l'utilisateur
 * 
 * @interface UserContextType
 */
export interface UserContextType {
  user: User | null;
  clear: () => void;
}


const UserContext: Context<UserContextType | null> = createContext<UserContextType | null>(null);

export function UserProvider({ children, initialUser }: { children: ReactNode; initialUser: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser);

  // enléve un favoris
  const clear = () => {
    setUser(null);
  }

  return <UserContext.Provider value={{ user, clear }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context: UserContextType | null = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}