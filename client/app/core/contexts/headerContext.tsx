"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from 'react';

/**
 * Interface pour les propriétés d'initialisation du contexte du header
 * 
 * @interface HeaderContextType
 */
export interface HeaderContextType {
  refreshKey: number;
  refreshBadges: () => void;
}

const HeaderContext = createContext<HeaderContextType | null>(null);

export function HeaderProvider({ children }: { children: ReactNode; }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshBadges = () => setRefreshKey(k => k + 1);

  return (
    <HeaderContext.Provider value={{ refreshKey, refreshBadges }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context: HeaderContextType | null = useContext(HeaderContext);

  if (!context) {
    throw new Error("useHeader must be used within a HeaderProvider");
  }

  return context;
}