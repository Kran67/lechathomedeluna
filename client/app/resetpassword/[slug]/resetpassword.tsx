'use client'

import {
  FormEvent,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { useCookies } from 'next-client-cookies';
import {
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import ModalConditionsOfUse from '@/app/components/modals/modalConditionsOfUse';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Link from '@/app/components/ui/Link';
import { useUser } from '@/app/core/contexts/userContext';
import { InputTypes } from '@/app/core/enums/enums';
import { User } from '@/app/core/interfaces/user';
import { validatePassword } from '@/app/core/lib/utils';
import { updatePassword } from '@/app/core/services/server/usersService';

/**
 * Interface pour les chats d'initialisation d'un chat
 * 
 * @interface ResetPasswordProps
 */
interface ResetPasswordProps {
    token: string;
    tokenValid: boolean;
    user: User;
}

/**
 * Affiche la page de réinitialisation du mot de passe
 * 
 * @function ResetPassword
 */
export default function ResetPassword({ token, tokenValid, user }: ResetPasswordProps) {
    const { clear } = useUser();
    const [password, setPassword] = useState("");
    const [confirmpassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const router: AppRouterInstance = useRouter();
    const cookies = useCookies();
    const [readedConditionsOfUse, setReadedConditionsOfUse] = useState(false);
    const [showModalConditionsOfUse, setShowModalConditionsOfUse] = useState(false);
    const [approuvedConditions, setApprouvedConditions] = useState(false);

    const handleResetPassword: (e: FormEvent<Element>) => Promise<void> = async (e: React.FormEvent) => {
        e.preventDefault();
        cookies.set("token", "", { expires: Date.now() });
        cookies.set("userId", "", { expires: Date.now() });
        clear();
        
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
            toast.success("Mot de passe réinitialisé avec succès !\nVous allez être redirigé vers la page de connexion dans une seconde.");
            setTimeout(() => {
                router.push(`/login`);
            }, 1000);
        }
    };

    return (
        <main className="flex flex-col gap-40 w-full items-center md:pt-20 md:px-140 h-screen justify-between">
            <Header />
            {showModalConditionsOfUse && createPortal(
                <ModalConditionsOfUse
                    firstName={user.name}
                    lastName={user.lastName}
                    closeModal={() => setShowModalConditionsOfUse(false)}
                    onSuccess={() => {
                        setShowModalConditionsOfUse(false);
                        setReadedConditionsOfUse(true);
                    }}
                />,
                document.body
            )}
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
                        <Link className="text-sm" text="Lire les conditions d'utilisation" onClick={(e) => {
                            setShowModalConditionsOfUse(true);
                        }} />
                        <div className="flex gap-5 items-center">
                            <input className="min-w-[1.15em] min-h-[1.15em]" type="checkbox" name="approuved-conditions" disabled={!readedConditionsOfUse} checked={approuvedConditions} />
                            <label className="text-xs" htmlFor='approuved-conditions' >J'ai lu et j'accepte les conditions d'utilisation de mes données personnelles par le ’Chat'Home de Luna’</label>
                        </div>
                    </div> : <span className="text-sm text-(--primary) font-bold">Le token de réinitialisation du mot de passe est invalide ou a expiré</span>}
                    {error && <span className="text-sm text-(--primary) font-bold">{errorMsg}</span>}
                    {tokenValid && <div className="flex flex-col gap-22 w-full md:w-360 items-center">
                        <Button text="Valider" className="flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-230" disabled={!approuvedConditions} />
                    </div>}
                </form>
            </div>
            <Footer />
        </main >
    );
}