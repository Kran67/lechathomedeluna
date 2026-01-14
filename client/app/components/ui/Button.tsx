// À cause de l'événement onClick
'use client'

import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ButtonTypes } from "@/app/enums/enums";

/**
 * Interface pour les propriétés d'initialisation du bouton
 * 
 * @interface ButtonProps
 */
interface ButtonProps {
    text?: string;
    disabled?: boolean;
    className?: string;
    url?: string
    clickFunc?: string;
    buttonType?: ButtonTypes;
}

/**
 * Affiche un bouton
 * 
 * @function Button
 * @param { text, disabled, className, url, onClick, buttonType } ButtonProps - Les proriétés du bouton
 * @param {string?} ButtonProps.text - Texte à afficher
 * @param {boolean?} ButtonProps.disabled - Statut du bouton actif ou non actif
 * @param {string?} ButtonProps.className - Classes css du bouton
 * @param {string?} ButtonProps.url - Url de redirection lors du clique sur le bouton
 * @param {string?} ButtonProps.clickFunc - Function à executer sur le clique du bouton avant redirection si elle est passée
 * @param {ButtonTypes?} ButtonProps.buttonType - Type de bouton (Button / Submit)
 */
export default function Button({ text, disabled, className, url, clickFunc, buttonType = ButtonTypes.Submit }: ButtonProps) {
    const router: AppRouterInstance = useRouter();

    const handleClick = (e: any) => {
        new Function(clickFunc ?? "")(e);
        if (url) router.push(url);
    };

    return (
        <button
            className={(disabled ? "opacity-[50%] cursor-not-allowed " : "cursor-pointer ") + className}
            disabled={disabled}
            type={buttonType}
            onClick={handleClick}
            role="button">
            {text}
        </button>
    );
}