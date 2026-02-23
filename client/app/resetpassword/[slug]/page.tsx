import type {
  Metadata,
  ResolvingMetadata,
} from 'next';

import { checkResetTokenValidity } from '@/app/services/server/usersService';

import ResetPassword from './resetpassword';

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props,
  parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: "Le Chat'Home de Luna - Se connecter",
    description: "Réinitialisation du mot de passe"
  }
}

/**
 * Affiche la page de réinitialisation du mot de passe
 * 
 * @function ResetPasswordPage
 */
export default async function ResetPasswordPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // on va vérifier que le token est valide et qu'il n'a pas expiré
  const tokenValid: { valid: boolean } = await checkResetTokenValidity(slug);
  console.log("tokenValid", tokenValid);

  return <ResetPassword token={slug} tokenValid={tokenValid.valid} />
}
