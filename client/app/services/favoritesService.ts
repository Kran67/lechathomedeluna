import { useContext } from "react";
import { FavoritesContext, FavoritesContextType } from "@/app/contexts/FavoritesContext";

/**
 * Permet de récupèrer les favoris depuis le context
 * 
 * @function favoritesService
 * @returns FavoritesContextType | null
 */
export function favoritesService() {
    const context: FavoritesContextType | null = useContext(FavoritesContext);

    if (!context) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }

    return context;
}
