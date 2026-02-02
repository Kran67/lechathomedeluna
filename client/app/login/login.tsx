'use client'

import {
  FormEvent,
  useState,
} from 'react';

import {
  Cookies,
  useCookies,
} from 'next-client-cookies';

import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Link from '@/app/components/ui/Link';
import { InputTypes } from '@/app/enums/enums';
import { login } from '@/app/services/authService';

/**
 * Affiche la page de connexion
 * 
 * @function Login
 */
export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const cookies: Cookies = useCookies();

    const handleLogin: (e: FormEvent<Element>) => Promise<void> = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await login(email, password);
        if (!res.error) {
            cookies.set("token", res.token, { expires: 1 });
            cookies.set("userId", res.user.id, { expires: 1 });
            window.location.href = "/";
        } else {
            setError(true);
            setErrorMsg(res.error);
        }
    };

    return (
        <main className="flex flex-col gap-40 w-full items-center md:pt-20 md:px-140 h-screen justify-between">
            <Header />
            <div className="flex px-30 w-full md:w-742">
                <form
                    onSubmit={handleLogin}
                    role="form"
                    aria-label="Information de connexion"
                    className="flex flex-col w-full gap-38 px-16 py-32 lg:p-80 bg-(--white) border border-solid border-(--pink) rounded-[10px] items-center"
                >
                    <div className="flex flex-col gap-8 items-center">
                        <span className="text-2xl md:text-[32px] text-(--primary) font-bold">Heureux de vous revoir</span>
                        <span className="text-sm text-(--text) font-normal text-center md:w-390">Connectez-vous pour retrouver vos ....</span>
                    </div>
                    <div className="flex flex-col gap-22 w-full md:w-360">
                        <Input
                            label="Adresse email"
                            name="email"
                            type={InputTypes.Email}
                            required={true}
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError(false);
                            }}
                            hasError={error} />
                        <Input
                            label="Mot de passe"
                            name="password"
                            type={InputTypes.Password}
                            required={true}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(false);
                            }}
                            hasError={error} />
                    </div>
                    {error && <span className="text-sm text-(--primary) font-bold">{errorMsg}</span>}
                    <div className="flex flex-col gap-22 w-full md:w-360 items-center">
                        <Button text="Se connecter" url='' className="flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-230" />
                        <div className="flex flex-col gap-12 w-full items-center">
                            <Link className="text-sm text-(--primary) font-normal text-center" url="/" text="Mot de passe oublié" />
                            <div className="text-sm text-(--primary) font-normal text-center">
                                <span >Pas encore de compte ? </span>
                                <Link className="font-medium" url="/signin" text="Inscrivez-vous" />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <Footer />
        </main >
    );
}