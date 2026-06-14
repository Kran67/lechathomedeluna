"use client";

import {
  Context,
  createContext,
  ReactNode,
  useContext,
  useState,
} from 'react';

import type { User } from '@/app/core/interfaces/user';

/**
 * Interface pour les propriétés d'initialisation du contexte de l'utilisateur
 *
 * @interface UserContextType
 */
export interface UserContextType {
  user: User | null;
  originalUser: User | null;
  isImpersonating: boolean;
  clear: () => void;
  changeUser: (user: User) => void;
  startImpersonation: (targetUser: User) => void;
  stopImpersonation: () => void;
}


const UserContext: Context<UserContextType | null> = createContext<UserContextType | null>(null);

export function UserProvider({ children, initialUser }: { children: ReactNode; initialUser: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [originalUser, setOriginalUser] = useState<User | null>(null);

  const clear = () => {
    setOriginalUser(null);
    setUser(null);
  }

  const changeUser = (user: User) => {
    setUser(user);
  }

  const startImpersonation = (targetUser: User) => {
    setOriginalUser(user);
    setUser(targetUser);
  }

  const stopImpersonation = () => {
    if (originalUser) {
      setUser(originalUser);
      setOriginalUser(null);
    }
  }

  return (
    <UserContext.Provider value={{
      user,
      originalUser,
      isImpersonating: originalUser !== null,
      clear,
      changeUser,
      startImpersonation,
      stopImpersonation,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context: UserContextType | null = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}