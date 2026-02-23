import type { Metadata } from 'next';

import ResetPassword from './resetpassword';

/**
 * Ajout les métadata à la page
 * 
 * @function metadata
 * @returns { Metadata } - Les méta data à ajouter
 */
export function generateMetadata(): Metadata {
  return {
    title: "Le Chat'Home de Luna - Se connecter",
    description: "Création mot de passe"
  }
}

/**
 * Affiche la page de création de mot de passe
 * 
 * @function NewPasswordPage
 */
export default function NewPasswordPage() {
  return <ResetPassword />;
}
