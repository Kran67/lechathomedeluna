'use client'

import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import { InputTypes } from "@/app/enums/enums";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import Link from "@/app/components/ui/Link";
import Checkbox from "@/app/components/ui/Checkbox";
import { FormEvent, useState } from "react";
import { Cookies, useCookies } from "next-client-cookies";
import { validatePassword } from "@/app/lib/utils";
import { signin } from "@/app/services/authService";

/**
 * Affiche la page création de compte
 * 
 * @function Signin
 */
export default function Signin() {
    const [lastname, setLastname] = useState("");
    const [firstname, setFirstname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const cookies: Cookies = useCookies();

    const handleSignIn: (e: FormEvent<Element>) => Promise<void> = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.trim() !== "") {
            if (!validatePassword(password)) {
                setError(true);
                setErrorMsg("Le mot de passe doit contenir au minimum 8 caractères, une majuscule et un chiffre.");
                return;
            }
        }

        const res = await signin(`${firstname} ${lastname}`, email, password);
        if (!res.error) {
            cookies.set("token", res.token, { expires: 1 });
            window.location.href = "/";
        } else {
            if (res.status === 409) {
                setErrorMsg("");
            } else {
                setError(true);
                setErrorMsg(res.error);
            }
        }
    };

    return (
        <main className="flex flex-col gap-40 w-full items-center md:pt-20 md:px-140 h-screen justify-between">
            <Header />
            <div className="flex px-30 w-full md:w-742">
                <form
                    onSubmit={handleSignIn}
                    role="form"
                    aria-label="Informations d'enregistrement'"
                    className="flex flex-col w-full gap-38 px-16 py-32 lg:p-80 bg-(--white) border border-solid border-(--pink) rounded-[10px] items-center"
                >
                    <div className="flex flex-col gap-8 items-center">
                        <span className="text-2xl md:text-[32px] text-(--primary) font-bold px-50 lg:px-0">Devenir famille d'accueil</span>
                        <span className="text-sm text-(--text) font-normal text-center md:w-488">Créez votre compte et consuter nos chats à l'adoption.</span>
                    </div>
                    <div className="flex flex-col gap-22 w-full md:w-360 px-10">
                        <Input
                            label="Nom"
                            name="lastname"
                            type={InputTypes.Text}
                            required={true}
                            value={lastname}
                            onChange={(e) => {
                                setLastname(e.target.value);
                                setError(false);
                            }}
                            hasError={error} />
                        <Input
                            label="Prénom"
                            name="firstname"
                            type={InputTypes.Text}
                            required={true}
                            value={firstname}
                            onChange={(e) => {
                                setFirstname(e.target.value);
                                setError(false);
                            }}
                            hasError={error} />
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
                        <div className="flex text-xs text-(--pink)">
                            <Checkbox
                                id="readed-generals-conditions"
                                text="J’accepte les"
                                className="text-xs" />
                            <span className="ml-3 underline">conditions générales d’utilisation</span>
                        </div>
                    </div>
                    {error && <span className="text-sm text-(--primary) font-bold">{errorMsg}</span>}
                    <div className="flex flex-col gap-22 w-full md:w-360 items-center">
                        <Button
                            text="S’inscrire"
                            url=""
                            className="flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-230" />
                        <div className="flex flex-col gap-12 w-full items-center">
                            <div className="text-sm text-(--primary) font-normal text-center">
                                <span >Déjà membre ? </span>
                                <Link className="font-medium" url="/login" text="Se connecter" />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <Footer />
        </main>
    );
}
