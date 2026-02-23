'use client'

import {
  FormEvent,
  useRef,
  useState,
} from 'react';

import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'react-toastify';

import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { InputTypes } from '@/app/enums/enums';

import { sendResetPasswordEmail } from '../lib/utils';
import { resetPassword } from '../services/server/usersService';

/**
 * Affiche la page de demande de nouveau mot de passe
 * 
 * @function ResetPassword
 */
export default function ResetPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const recaptcha = useRef<ReCAPTCHA>(null);
    const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

    const handleCaptchaChange = (token: string | null) => {
        setIsCaptchaVerified(!!token);
    };

    const handleNewPassword: (e: FormEvent<Element>) => Promise<void> = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isCaptchaVerified) {
            setError(true);
            setErrorMsg("Veuillez vérifier le reCAPTCHA !");
        } else {
            setError(false);
            setErrorMsg("");
            const result = await resetPassword(email);
            if (result.error) {
                toast.error(`Une erreur est survenue lors de l'envoi de l'email pour la réinitialisation du mot de passe : ${result.error.message}`);
            } else {
                sendResetPasswordEmail(email, result.token);
            }
        }
    };

    return (
        <main className="flex flex-col gap-40 w-full items-center md:pt-20 md:px-140 h-screen justify-between">
            <Header />
            <div className="flex px-30 w-full md:w-742">
                <form
                    onSubmit={handleNewPassword}
                    role="form"
                    aria-label="Information de création de mot de passe"
                    className="flex flex-col w-full gap-38 px-16 py-32 lg:p-80 bg-(--white) border border-solid border-(--pink) rounded-[10px] items-center"
                >
                    <div className="flex flex-col gap-8 items-center">
                        <span className="text-2xl md:text-[32px] text-(--primary) font-bold">Mot de passe oublié</span>
                    </div>
                    <div className="flex flex-col gap-22 w-full md:w-360">
                        <Input
                            label="Adresse email"
                            name="email"
                            type={InputTypes.Email}
                            required={true}
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setEmail(e.currentTarget.value);
                                setError(false);
                            }}
                            hasError={error} />
                        <ReCAPTCHA ref={recaptcha} sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY ?? "-"} onChange={handleCaptchaChange} />
                    </div>
                    {error && <span className="text-sm text-(--primary) font-bold">{errorMsg}</span>}
                    <div className="flex flex-col gap-22 w-full md:w-360 items-center">
                        <Button text="Valider" className="flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-230" />
                    </div>
                </form>
            </div>
            <Footer />
        </main >
    );
}