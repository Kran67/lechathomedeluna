import { createContext } from "react"
import { Property } from "@/app/interfaces/property"

/**
 * Interface pour les propriétés d'initialisation du contexte des favoris
 * 
 * @interface FavoritesContextType
 */
export interface FavoritesContextType {
    favorites: Property[];
    addFavorite: (property: Property) => void;
    removeFavorite: (id: string) => void;
    toggleFavorite: (property: Property) => void;
    isFavorite: (id: string) => boolean;
}

/**
 * Context des favoris
 * 
 * @function FavoritesContext
 * @returns { Context<FavoritesContextType | null> } Le contexte
 */
export const FavoritesContext = createContext<FavoritesContextType | null>(null)
