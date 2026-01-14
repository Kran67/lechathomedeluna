import type { Metadata } from "next";
import Login from "@/app/login/login";

/**
 * Ajout les métadata à la page
 * 
 * @function metadata
 * @returns { Metadata } - Les méta data à ajouter
 */
export function generateMetadata(): Metadata {
  return {
    title: "Le Chat'Home de Luna - Se connecter",
    description: "Se connecter au site Le Chat'Home de Luna"
  }
}

/**
 * Affiche la page de connexion
 * 
 * @function LoginPage
 */
export default function LoginPage() {
  return <Login />;
}
