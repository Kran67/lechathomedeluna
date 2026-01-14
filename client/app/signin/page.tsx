import { Metadata } from "next";
import Signin from "@/app/signin/signin";

/**
 * Ajout les métadata à la page
 * 
 * @function metadata
 * @returns { Metadata } - Les méta data à ajouter
 */
export const metadata: Metadata = {
  title: "Le Chat'Home de Luna - S'enregister",
  description: "Devenir utlisateur enregistré"
};

/**
 * Affiche la page création de compte
 * 
 * @function SigninPage
 */
export default function SigninPage() {
  return <Signin />;
}
