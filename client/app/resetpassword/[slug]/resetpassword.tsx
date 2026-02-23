'use client'

import {
  FormEvent,
  useState,
} from 'react';

import {
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { InputTypes } from '@/app/enums/enums';
import { validatePassword } from '@/app/lib/utils';
import { updatePassword } from '@/app/services/server/usersService';

/**
 * Interface pour les chats d'initialisation d'un chat
 * 
 * @interface ResetPasswordProps
 */
interface ResetPasswordProps {
    token: string;
    tokenValid: boolean;
}

/**
 * Affiche la page de réinitialisation du mot de passe
 * 
 * @function ResetPassword
 */
export default function ResetPassword({ token, tokenValid }: ResetPasswordProps) {
    const [password, setPassword] = useState("");
    const [confirmpassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const router: AppRouterInstance = useRouter();

    const handleResetPassword: (e: FormEvent<Element>) => Promise<void> = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePassword(password) && !validatePassword(confirmpassword)) {
            setError(true);
            setErrorMsg("Le mot de passe / confirmation du mot de passe doivent comporter au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial !");
        } else if (password !== confirmpassword) {
            setError(true);
            setErrorMsg("Les mots de passe ne correspondent pas !");
        } else {
            setError(false);
            setErrorMsg("");
            // on va appeler l'api pour réinitialiser le mot de passe
            await updatePassword(token, password);
            toast.success("Mot de passe réinitialisé avec succès !`nVous allez être redirigé vers la page de connexion dans une seconde.");
            setTimeout(() => {
                router.push(`/login`);
            }, 1000);
        }
    };

    return (
        <main className="flex flex-col gap-40 w-full items-center md:pt-20 md:px-140 h-screen justify-between">
            <Header />
            <div className="flex px-30 w-full md:w-742">
                <form
                    onSubmit={handleResetPassword}
                    role="form"
                    aria-label="Information de connexion"
                    className="flex flex-col w-full gap-38 px-16 py-32 lg:p-80 bg-(--white) border border-solid border-(--pink) rounded-[10px] items-center"
                >
                    <div className="flex flex-col gap-8 items-center">
                        <span className="text-2xl md:text-[32px] text-(--primary) font-bold">Réinitialisation du mot de passe</span>
                    </div>
                    {tokenValid ? <div className="flex flex-col gap-22 w-full md:w-360">
                        <Input
                            label="Mot de passe"
                            name="password"
                            type={InputTypes.Password}
                            required={true}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.currentTarget.value);
                                setError(false);
                            }}
                            hasError={error} />
                        <Input
                            label="Confirmation du mot de passe"
                            name="confirmpassword"
                            type={InputTypes.Password}
                            required={true}
                            value={confirmpassword}
                            onChange={(e) => {
                                setConfirmPassword(e.currentTarget.value);
                                setError(false);
                            }}
                            hasError={error} />
                    </div> : <span className="text-sm text-(--primary) font-bold">Le token de réinitialisation du mot de passe est invalide ou a expiré</span>}
                    {error && <span className="text-sm text-(--primary) font-bold">{errorMsg}</span>}
                    {tokenValid && <div className="flex flex-col gap-22 w-full md:w-360 items-center">
                        <Button text="Valider" className="flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-230" />
                    </div>}
                </form>
            </div>
            <Footer />
        </main >
    );
}